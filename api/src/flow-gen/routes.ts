import { Hono } from 'hono';
import type pg from 'pg';
import { z } from 'zod';
import {
	applyFlowSpec,
	defaultNewId,
	FLOW_LIMITS,
	FLOW_DEVICES,
	FLOW_PLATFORMS,
	devicesForPlatform,
	platformForDevices,
	flowSpecFromDocument,
	FlowSpecError,
	isEmptyFlow,
	repairFlowSpec,
	type FlowSpec,
} from '@bareframe/designer-core';
import type { Config } from '../config.js';
import { assertProjectAccess, replaceProjectDocument, tokenHasScope } from '../db/projects.js';
import { PLAN_LIMITS, getUserPlanTier, refundGeneration, reserveGeneration } from '../plans/limits.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { publishProjectUpdate } from '../projects/events.js';
import { flowLlmForConfig, flowUsesLlm, type FlowGenerationInput, type FlowLlm } from './llm.js';

const generateBodySchema = z.object({
	baseVersion: z.number().int().nonnegative(),
	description: z.string().trim().min(10).max(FLOW_LIMITS.descriptionLength).optional(),
	platform: z.enum(FLOW_PLATFORMS).optional(),
	/** Exact devices chosen (wins over `platform`). */
	platforms: z.array(z.enum(FLOW_DEVICES)).min(1).max(FLOW_DEVICES.length).optional(),
	instruction: z.string().trim().min(3).max(FLOW_LIMITS.instructionLength).optional(),
});

/** Ask the model; if its output can't be repaired, retry once with the validation problems. */
export async function generateFlowSpec(
	llm: FlowLlm,
	input: FlowGenerationInput,
): Promise<{ spec: FlowSpec; repairs: string[]; attempts: number }> {
	let feedback: string[] | undefined;
	for (let attempt = 1; attempt <= 2; attempt++) {
		const raw = await llm.generateFlow({ ...input, feedback });
		try {
			return { ...repairFlowSpec(raw), attempts: attempt };
		} catch (err) {
			if (!(err instanceof FlowSpecError) || attempt === 2) throw err;
			feedback = err.issues;
		}
	}
	throw new Error('unreachable');
}

export function createFlowGenerationRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('/projects/:projectId/flow/*', auth);

	/**
	 * Generate the project's flow from a product description, or refine the current flow with
	 * `instruction`. Writes pages, frames and connectors into the document and returns it.
	 */
	router.post('/projects/:projectId/flow/generate', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token' && !tokenHasScope(actor.scopes, 'projects:write')) {
			return c.json({ error: 'Forbidden' }, 403);
		}
		let reserved = false;
		try {
			const projectId = c.req.param('projectId');
			const project = await assertProjectAccess(pool, projectId, actor, 'projects:write');
			const parsed = generateBodySchema.safeParse(await c.req.json().catch(() => null));
			if (!parsed.success) {
				return c.json(
					{ error: 'invalid_request', issues: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) },
					400,
				);
			}
			const body = parsed.data;
			if (project.version !== body.baseVersion) {
				return c.json({ error: 'Version conflict', currentVersion: project.version }, 409);
			}
			const document = project.document;
			const refining = Boolean(body.instruction) && !isEmptyFlow(document);
			const description = body.description ?? document.project.productBrief?.description;
			if (!description) {
				return c.json({ error: 'invalid_request', issues: ['description: describe your product first'] }, 400);
			}
			const brief = document.project.productBrief;
			const platforms = body.platforms
				? FLOW_DEVICES.filter((d) => body.platforms!.includes(d))
				: body.platform
					? devicesForPlatform(body.platform)
					: (brief?.platforms ?? devicesForPlatform(brief?.platform ?? 'mobile'));
			const platform = body.platforms ? platformForDevices(platforms) : (body.platform ?? brief?.platform ?? 'mobile');

			const llm = flowLlmForConfig(config);
			const usedLlm = flowUsesLlm(config);

			await reserveGeneration(pool, actor.userId, 'flow');
			reserved = true;

			let result: Awaited<ReturnType<typeof generateFlowSpec>>;
			try {
				result = await generateFlowSpec(llm, {
					description,
					platform,
					platforms,
					instruction: refining ? body.instruction : undefined,
					current: refining ? flowSpecFromDocument(document) : undefined,
				});
			} catch (err) {
				if (err instanceof FlowSpecError) {
					return c.json(
						{ error: 'flow_invalid', message: 'The AI returned a flow we could not use. Try again.', issues: err.issues },
						502,
					);
				}
				console.error('flow generation failed', err);
				return c.json({ error: 'llm_failed', message: 'The AI did not respond. Try again in a moment.' }, 502);
			}

			const { spec, repairs } = result;
			const tier = await getUserPlanTier(pool, actor.userId);
			const maxScreens = PLAN_LIMITS[tier].maxScreensPerProject;
			if (spec.screens.length > maxScreens) {
				const kept = new Set(spec.screens.slice(0, maxScreens).map((s) => s.id));
				repairs.push(`Kept the first ${maxScreens} screens (plan limit); ${spec.screens.length - maxScreens} left out`);
				spec.screens = spec.screens.filter((s) => kept.has(s.id));
				spec.connections = spec.connections.filter((l) => kept.has(l.from) && kept.has(l.to));
			}

			const next = applyFlowSpec(document, spec, { platform, platforms, description, newId: defaultNewId });
			const version = await replaceProjectDocument(pool, projectId, actor.userId, next.document, body.baseVersion);
			reserved = false;
			publishProjectUpdate(projectId, version);
			return c.json({
				version,
				document: next.document,
				screens: spec.screens.length,
				connections: spec.connections.length,
				refined: refining,
				repairs,
				attempts: result.attempts,
				source: usedLlm ? 'llm' : 'template',
			});
		} catch (err) {
			return handleProjectError(c, err);
		} finally {
			if (reserved) await refundGeneration(pool, actor.userId, 'flow').catch(() => undefined);
		}
	});

	return router;
}
