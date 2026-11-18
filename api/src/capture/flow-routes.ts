import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import {
	buildFlowFromCaptureStepsTx,
	type CaptureFlowStepInput,
} from '../db/capture-flow.js';
import { assertProjectAccess, tokenHasScope, VersionConflictError } from '../db/projects.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { publishProjectUpdate } from '../projects/events.js';
import { getProjectById } from '../db/projects.js';

function assertCaptureFlowScope(actor: ReturnType<typeof getActor>): void {
	if (actor.kind === 'user') return;
	const scopes = actor.scopes ?? [];
	if (
		tokenHasScope(scopes, 'capture:write') ||
		tokenHasScope(scopes, 'recordings:upload') ||
		tokenHasScope(scopes, 'projects:write')
	) {
		return;
	}
	throw Object.assign(new Error('Insufficient scope for flow capture'), { status: 403 });
}

export function createCaptureFlowRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('*', auth);

	router.post('/projects/:projectId/capture/flow', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			assertCaptureFlowScope(actor);

			const body = await c.req.json<{
				name?: string;
				baseVersion: number;
				build?: boolean;
				steps: CaptureFlowStepInput[];
			}>();

			if (!Array.isArray(body.steps) || body.steps.length === 0) {
				return c.json({ error: 'steps array required' }, 400);
			}
			if (typeof body.baseVersion !== 'number') {
				return c.json({ error: 'baseVersion is required' }, 400);
			}

			const project = await getProjectById(pool, projectId);
			if (!project) return c.json({ error: 'Not found' }, 404);
			if (project.version !== body.baseVersion) {
				return c.json({ error: 'Version conflict', currentVersion: project.version }, 409);
			}

			const name = body.name?.trim() || `Flow ${new Date().toISOString().slice(0, 10)}`;
			const build = body.build !== false;

			if (!build) {
				return c.json({ ok: true, built: false, stepCount: body.steps.length }, 202);
			}

			const result = await buildFlowFromCaptureStepsTx(
				pool,
				projectId,
				name,
				body.steps,
				body.baseVersion,
				actor,
			);
			publishProjectUpdate(projectId, result.version);
			return c.json(
				{
					built: true,
					version: result.version,
					pageId: result.pageId,
					frameIds: result.frameIds,
					screenCount: result.screenCount,
					connectorCount: result.connectorCount,
				},
				201,
			);
		} catch (err) {
			if (err instanceof VersionConflictError) {
				return c.json({ error: 'Version conflict', currentVersion: err.currentVersion }, 409);
			}
			if (err && typeof err === 'object' && (err as { status?: number }).status === 403) {
				return c.json({ error: 'Insufficient scope', message: 'Token needs capture:write' }, 403);
			}
			return handleProjectError(c, err);
		}
	});

	return router;
}