import { Hono } from 'hono';
import type pg from 'pg';
import { z } from 'zod';
import {
	defaultNewId,
	DESIGN_DEVICES,
	designToNodes,
	DesignSpecError,
	deviceDimensions,
	getDevicePreset,
	repairDesignSpec,
	screenKeyForPage,
	type DesignDevice,
	type DesignSpec,
	type ScreenBrief,
} from '@bareframe/designer-core';
import type { Config } from '../config.js';
import { attachConnectorButtonNodes } from '@bareframe/designer-core';
import { assertProjectAccess, replaceProjectDocument, tokenHasScope } from '../db/projects.js';
import { refundGeneration, reserveGeneration } from '../plans/limits.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { publishProjectUpdate } from '../projects/events.js';
import { designLlmForConfig, type DesignGenerationInput, type DesignLlm } from './llm.js';

/** Same presets as the canvas device switch (Phone / Tablet / Desktop). */
export const DEVICE_PRESET: Record<DesignDevice, string> = { phone: 'mobile', tablet: 'tablet', desktop: 'desktop-1440' };

const STATE_ORDER = ['default', 'empty', 'loading', 'error', 'success'] as const;

const bodySchema = z.object({
	baseVersion: z.number().int().nonnegative(),
	device: z.enum(DESIGN_DEVICES),
});

export async function generateDesignSpec(
	llm: DesignLlm,
	input: DesignGenerationInput,
): Promise<{ spec: DesignSpec; repairs: string[]; attempts: number }> {
	let feedback: string[] | undefined;
	for (let attempt = 1; attempt <= 2; attempt++) {
		const raw = await llm.generateDesign({ ...input, feedback });
		try {
			return { ...repairDesignSpec(raw, input.brief.states), attempts: attempt };
		} catch (err) {
			if (!(err instanceof DesignSpecError) || attempt === 2) throw err;
			feedback = err.issues;
		}
	}
	throw new Error('unreachable');
}

export function createDesignGenerationRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('/projects/:projectId/screens/*', auth);
	router.use('/projects/:projectId/screen-designs', auth);

	/** Saved designs per screen and device (states and repair notes), newest first. */
	router.get('/projects/:projectId/screen-designs', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			const { rows } = await pool.query(
				`SELECT screen_key, device, spec, repairs, updated_at FROM screen_designs
				 WHERE project_id = $1 ORDER BY updated_at DESC`,
				[projectId],
			);
			return c.json({
				designs: rows.map((r) => ({
					screenKey: r.screen_key,
					device: r.device,
					// JSONB doesn't keep key order.
					states: STATE_ORDER.filter((name) => name in (r.spec as DesignSpec).states),
					spec: r.spec,
					repairs: r.repairs,
					updatedAt: r.updated_at,
				})),
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	/**
	 * Generate a design for one screen (page) on one device. The default state replaces the page's
	 * nodes and the screen's frame switches to that device; every state is stored in screen_designs.
	 */
	router.post('/projects/:projectId/screens/:pageId/design', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token' && !tokenHasScope(actor.scopes, 'projects:write')) {
			return c.json({ error: 'Forbidden' }, 403);
		}
		let reserved = false;
		try {
			const projectId = c.req.param('projectId');
			const pageId = c.req.param('pageId');
			const project = await assertProjectAccess(pool, projectId, actor, 'projects:write');
			const parsed = bodySchema.safeParse(await c.req.json().catch(() => null));
			if (!parsed.success) {
				return c.json({ error: 'invalid_request', issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }, 400);
			}
			const { baseVersion, device } = parsed.data;
			if (project.version !== baseVersion) {
				return c.json({ error: 'Version conflict', currentVersion: project.version }, 409);
			}
			const document = structuredClone(project.document);
			const pageIndex = document.project.pages.findIndex((p) => p.id === pageId);
			const page = document.project.pages[pageIndex];
			if (!page) return c.json({ error: 'Screen not found' }, 404);
			const frames = document.project.frames.filter((f) => !f.ghost && f.pageId === pageId);

			const llm = designLlmForConfig(config);
			if (!llm) {
				return c.json({ error: 'llm_not_configured', message: 'Design generation needs an LLM.' }, 503);
			}
			await reserveGeneration(pool, actor.userId, 'screen_design');
			reserved = true;

			const brief: ScreenBrief = page.brief ?? { key: page.id, purpose: '', keyContent: [], states: ['default'] };
			const frameIds = new Set(frames.map((f) => f.id));
			const nameOf = (frameId: string) => document.project.frames.find((f) => f.id === frameId)?.name;
			const outgoingActions = document.project.connectors
				.filter((conn) => frameIds.has(conn.fromFrameId))
				.map((conn) => conn.label || `Go to ${nameOf(conn.toFrameId) ?? 'next screen'}`)
				.slice(0, 6);

			let result: Awaited<ReturnType<typeof generateDesignSpec>>;
			try {
				result = await generateDesignSpec(llm, {
					productDescription: document.project.productBrief?.description ?? document.project.name,
					screenName: page.name,
					brief,
					device,
					outgoingActions,
				});
			} catch (err) {
				if (err instanceof DesignSpecError) {
					return c.json({ error: 'design_invalid', message: 'The AI returned a design we could not use. Try again.', issues: err.issues }, 502);
				}
				console.error('design generation failed', err);
				return c.json({ error: 'llm_failed', message: 'The AI did not respond. Try again in a moment.' }, 502);
			}

			document.project.pages[pageIndex] = designToNodes(page, result.spec.states.default, defaultNewId);
			const preset = getDevicePreset(DEVICE_PRESET[device])!;
			const dim = deviceDimensions(preset);
			for (const frame of document.project.frames) {
				if (frameIds.has(frame.id)) Object.assign(frame, { devicePresetId: preset.id, width: dim.width, height: dim.height });
			}

			const linkNotes: string[] = [];
			for (const frame of document.project.frames) {
				if (frameIds.has(frame.id)) {
					linkNotes.push(...attachConnectorButtonNodes(document, pageId, frame.id));
				}
			}

			const version = await replaceProjectDocument(pool, projectId, actor.userId, document, baseVersion);
			reserved = false;
			await pool.query(
				`INSERT INTO screen_designs (project_id, screen_key, device, spec, repairs, created_by)
				 VALUES ($1, $2, $3, $4, $5, $6)
				 ON CONFLICT (project_id, screen_key, device)
				 DO UPDATE SET spec = EXCLUDED.spec, repairs = EXCLUDED.repairs, created_by = EXCLUDED.created_by, updated_at = NOW()`,
				[projectId, screenKeyForPage(page), device, JSON.stringify(result.spec), JSON.stringify(result.repairs), actor.userId],
			);
			publishProjectUpdate(projectId, version);
			return c.json({
				version,
				document,
				design: {
					device,
					states: STATE_ORDER.filter((name) => name in result.spec.states),
					repairs: result.repairs,
					attempts: result.attempts,
					connectorLinks: linkNotes,
				},
			});
		} catch (err) {
			return handleProjectError(c, err);
		} finally {
			if (reserved) await refundGeneration(pool, actor.userId, 'screen_design').catch(() => undefined);
		}
	});

	return router;
}
