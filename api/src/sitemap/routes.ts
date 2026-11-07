import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { assertProjectAccess } from '../db/projects.js';
import { assertFeature, PlanLimitError } from '../plans/limits.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { publishProjectUpdate } from '../projects/events.js';
import { importSitemapIntoProject } from './import-sitemap.js';
import { VersionConflictError } from '../db/projects.js';

export function createSitemapRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('*', auth);

	router.post('/projects/:projectId/sitemap-import', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:write');
			try {
				await assertFeature(pool, actor.userId, 'urlImport');
			} catch (err) {
				if (err instanceof PlanLimitError) {
					return c.json({ error: err.code, message: err.message }, 429);
				}
				throw err;
			}
			const body = await c.req.json<{ url?: string; baseVersion?: number }>();
			if (!body.url?.trim()) {
				return c.json({ error: 'bad_request', message: 'url is required' }, 400);
			}
			if (body.baseVersion == null) {
				return c.json({ error: 'bad_request', message: 'baseVersion is required' }, 400);
			}
			const result = await importSitemapIntoProject(
				pool,
				projectId,
				actor.userId,
				body.baseVersion,
				body.url,
			);
			publishProjectUpdate(projectId, result.version);
			return c.json(result);
		} catch (err) {
			if (err instanceof Error && err.message.startsWith('Version conflict')) {
				const m = /current (\d+)/.exec(err.message);
				return c.json(
					{ error: 'Version conflict', currentVersion: m ? Number(m[1]) : undefined },
					409,
				);
			}
			if (err instanceof VersionConflictError) {
				return c.json({ error: 'Version conflict', currentVersion: err.currentVersion }, 409);
			}
			if (err instanceof Error && (err.message.includes('URL') || err.message.includes('fetch'))) {
				return c.json({ error: 'import_failed', message: err.message }, 400);
			}
			return handleProjectError(c, err);
		}
	});

	return router;
}
