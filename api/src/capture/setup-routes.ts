import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { assertProjectAccess } from '../db/projects.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { assertFeature, PlanLimitError } from '../plans/limits.js';
import { buildInstallPrPreview, getWebsiteCaptureStatus, setupWebsiteCapture } from './setup.js';

export function createWebsiteCaptureRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('*', auth);

	router.post('/projects/:projectId/website-capture/setup', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:write');
			const body = await c.req.json<{ websiteUrl?: string }>();
			if (!body.websiteUrl?.trim()) {
				return c.json({ error: 'bad_request', message: 'websiteUrl is required' }, 400);
			}
			const result = await setupWebsiteCapture(
				pool,
				projectId,
				actor.userId,
				body.websiteUrl,
				config.publicUrl,
			);
			return c.json(result, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.get('/projects/:projectId/website-capture/status', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			const status = await getWebsiteCaptureStatus(pool, projectId);
			return c.json(status);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/website-capture/install-pr/preview', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:write');
			const body = await c.req.json<{
				repo?: string;
				branch?: string;
				filePath?: string;
				snippetHtml?: string;
			}>();
			if (!body.repo || !body.branch || !body.snippetHtml) {
				return c.json({ error: 'bad_request', message: 'repo, branch, and snippetHtml are required' }, 400);
			}
			const preview = buildInstallPrPreview({
				repo: body.repo,
				branch: body.branch,
				filePath: body.filePath,
				snippetHtml: body.snippetHtml,
			});
			return c.json(preview);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/website-capture/public-crawl', async (c) => {
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
			return c.json({
				ok: true,
				message: 'Use POST /api/projects/:id/flow-maps from the client with this project id.',
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	return router;
}
