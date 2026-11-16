import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import {
	createProjectNote,
	deleteProjectNote,
	listProjectNotes,
	updateProjectNote,
} from '../db/notes.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';

export function createNotesRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('*', auth);

	router.get('/projects/:projectId/notes', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const status = c.req.query('status') as 'open' | 'done' | 'all' | undefined;
			const frameId = c.req.query('frameId');
			const tag = c.req.query('tag');
			const q = c.req.query('q');
			const notes = await listProjectNotes(pool, projectId, actor, {
				status: status === 'open' || status === 'done' ? status : status === 'all' ? 'all' : undefined,
				frameId: frameId ?? undefined,
				tag: tag ?? undefined,
				q: q ?? undefined,
			});
			return c.json({ notes });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/notes', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{
				body?: string;
				frameId?: string | null;
				nodeId?: string | null;
				pageUrl?: string | null;
				tags?: string[];
			}>();
			if (!body.body?.trim()) return c.json({ error: 'body is required' }, 400);
			const note = await createProjectNote(pool, projectId, actor, {
				body: body.body!.trim(),
				frameId: body.frameId,
				nodeId: body.nodeId,
				pageUrl: body.pageUrl,
				tags: body.tags,
			});
			return c.json({ note }, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.patch('/projects/:projectId/notes/:noteId', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const noteId = c.req.param('noteId');
			const body = await c.req.json<{
				body?: string;
				frameId?: string | null;
				nodeId?: string | null;
				pageUrl?: string | null;
				status?: 'open' | 'done';
				tags?: string[];
			}>();
			const note = await updateProjectNote(pool, projectId, noteId, actor, body);
			if (!note) return c.json({ error: 'Not found' }, 404);
			return c.json({ note });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.delete('/projects/:projectId/notes/:noteId', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const noteId = c.req.param('noteId');
			const ok = await deleteProjectNote(pool, projectId, noteId, actor);
			if (!ok) return c.json({ error: 'Not found' }, 404);
			return c.json({ ok: true });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	return router;
}