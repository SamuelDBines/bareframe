import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type pg from 'pg';
import { randomToken, hashToken } from '../auth/crypto.js';
import { isValidComponentSlug } from '../catalog/components.js';
import {
	applyImportScreenshotsTx,
	applyProjectCommandTx,
	assertProjectAccess,
	createProject,
	createProjectToken,
	getProjectAsset,
	getProjectById,
	insertProjectAsset,
	listProjectTokens,
	listProjectsForUser,
	ProjectAccessError,
	replaceProjectDocument,
	revokeProjectToken,
	VersionConflictError,
	actorCanCreateProject,
} from '../db/projects.js';
import { assertCanCreateProject, assertScreenCountForUser, PlanLimitError } from '../plans/limits.js';
import type { ProjectDocument } from '@bareframe/designer-core';
import { createProjectAuthMiddleware, getActor, handleProjectError } from './auth.js';
import { publishProjectUpdate, subscribeProject } from './events.js';

export function createProjectsRouter(pool: pg.Pool, config: import('../config.js').Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();

	router.use('*', auth);

	router.get('/projects', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token') {
			const project = await getProjectById(pool, actor.projectId);
			if (!project) return c.json({ error: 'Not found' }, 404);
			return c.json({
				projects: [
					{
						id: project.id,
						name: project.name,
						version: project.version,
						updatedAt: project.updated_at,
					},
				],
			});
		}
		const projects = await listProjectsForUser(pool, actor.userId);
		return c.json({ projects });
	});

	router.post('/projects', async (c) => {
		const actor = getActor(c);
		if (!actorCanCreateProject(actor)) return c.json({ error: 'Forbidden' }, 403);
		try {
			await assertCanCreateProject(pool, actor.userId);
		} catch (err) {
			if (err instanceof PlanLimitError) {
				return c.json({ error: err.code, message: err.message }, 429);
			}
			throw err;
		}
		const body = (await c.req.json<{ name?: string; themeId?: string }>().catch(() => ({
			name: undefined,
			themeId: undefined,
		}))) as { name?: string; themeId?: string };
		const name = body.name?.trim() || 'Untitled project';
		const created = await createProject(pool, actor.userId, name, body.themeId ?? 'light');
		publishProjectUpdate(created.id, created.version);
		return c.json(
			{
				id: created.id,
				name: created.name,
				version: created.version,
				document: created.document,
			},
			201,
		);
	});

	router.get('/projects/:projectId', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const project = await assertProjectAccess(pool, projectId, actor, 'projects:read');
			return c.json({
				id: project.id,
				name: project.name,
				version: project.version,
				document: project.document,
				updatedAt: project.updated_at,
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.put('/projects/:projectId/document', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{ document: ProjectDocument; baseVersion?: number }>();
			const version = await replaceProjectDocument(
				pool,
				projectId,
				actor.userId,
				body.document,
				body.baseVersion,
			);
			publishProjectUpdate(projectId, version);
			return c.json({ version });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/commands', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{ baseVersion: number; command: unknown }>();
			const result = await applyProjectCommandTx(pool, {
				projectId,
				baseVersion: body.baseVersion,
				command: body.command,
				actor,
				isValidComponentSlug,
			});
			publishProjectUpdate(projectId, result.version);
			return c.json(result);
		} catch (err) {
			if (err instanceof VersionConflictError) {
				return c.json({ error: 'Version conflict', currentVersion: err.currentVersion }, 409);
			}
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/import-screenshots', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{
				baseVersion: number;
				shots: { assetId: string; title?: string; url?: string }[];
				links?: { fromAssetId: string; toAssetId: string; label?: string; trigger?: string }[];
			}>();
			const result = await applyImportScreenshotsTx(pool, {
				projectId,
				baseVersion: body.baseVersion,
				shots: body.shots,
				links: body.links ?? [],
				actor,
			});
			publishProjectUpdate(projectId, result.version);
			return c.json(result);
		} catch (err) {
			if (err instanceof VersionConflictError) {
				return c.json({ error: 'Version conflict', currentVersion: err.currentVersion }, 409);
			}
			return handleProjectError(c, err);
		}
	});

	router.get('/projects/:projectId/events', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			return streamSSE(c, async (stream) => {
				let alive = true;
				c.req.raw.signal.addEventListener('abort', () => {
					alive = false;
				});
				const unsubscribe = subscribeProject(projectId, (event) => {
					void stream.writeSSE({ data: JSON.stringify(event) });
				});
				try {
					while (alive) {
						await stream.writeSSE({ event: 'ping', data: '{}' });
						await stream.sleep(15000);
					}
				} finally {
					unsubscribe();
				}
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.get('/projects/:projectId/tokens', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			const tokens = await listProjectTokens(pool, c.req.param('projectId'), actor.userId);
			return c.json({ tokens });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/tokens', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			const body = await c.req.json<{ name?: string; scopes?: string[] }>();
			const name = body.name?.trim() || 'MCP token';
			const scopes = body.scopes?.length
				? body.scopes
				: ['projects:read', 'projects:write', 'assets:upload'];
			const plaintext = `bf_proj_${randomToken(32)}`;
			const id = await createProjectToken(
				pool,
				c.req.param('projectId'),
				actor.userId,
				name,
				scopes,
				plaintext,
			);
			return c.json({ id, token: plaintext, tokenPrefix: `${plaintext.slice(0, 16)}…`, scopes }, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.delete('/projects/:projectId/tokens/:tokenId', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
			await revokeProjectToken(pool, c.req.param('projectId'), actor.userId, c.req.param('tokenId'));
			return c.json({ ok: true });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/assets', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'assets:upload');
			const contentType = c.req.header('content-type') ?? 'application/octet-stream';
			const buf = Buffer.from(await c.req.arrayBuffer());
			const assetId = await insertProjectAsset(pool, projectId, contentType, buf);
			return c.json({ assetId, byteSize: buf.byteLength, contentType }, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.get('/projects/:projectId/assets/:assetId', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			const asset = await getProjectAsset(pool, projectId, c.req.param('assetId'));
			if (!asset) return c.json({ error: 'Not found' }, 404);
			return new Response(new Uint8Array(asset.bytes), {
				headers: {
					'Content-Type': asset.content_type,
					'Cache-Control': 'private, max-age=3600',
				},
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/upload-url', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'assets:upload');
			const body = await c.req.json<{ contentType?: string; size?: number }>();
			if (body.size != null && body.size > 5 * 1024 * 1024) {
				return c.json({ error: 'Asset too large (max 5MB)' }, 413);
			}
			const uploadUrl = `${config.publicUrl}/api/projects/${projectId}/assets`;
			return c.json({
				method: 'POST',
				uploadUrl,
				headers: { 'Content-Type': body.contentType ?? 'image/png' },
				maxBytes: 5 * 1024 * 1024,
				note: 'Upload raw bytes to uploadUrl with the same Authorization you used for this request.',
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/share', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'share:create');
			const body = (await c.req
				.json<{ play?: boolean; startFrameId?: string }>()
				.catch(() => ({ play: undefined, startFrameId: undefined as string | undefined }))) as {
				play?: boolean;
				startFrameId?: string;
			};
			const token = randomToken(24);
			await pool.query(
				`UPDATE projects SET share_token_hash = $2, is_private = false, updated_at = NOW() WHERE id = $1`,
				[projectId, hashToken(token)],
			);
			const query = new URLSearchParams();
			if (body.play) query.set('play', '1');
			if (body.startFrameId) query.set('start', body.startFrameId);
			const qs = query.toString();
			const sharePath = `/share/${token}${qs ? `?${qs}` : ''}`;
			return c.json({
				token,
				sharePath,
				publicUrl: `${config.publicUrl}/#${sharePath}`,
				playUrl: body.play
					? `${config.publicUrl}/#/share/${token}?play=1${body.startFrameId ? `&start=${encodeURIComponent(body.startFrameId)}` : ''}`
					: undefined,
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	return router;
}

export { ProjectAccessError };
