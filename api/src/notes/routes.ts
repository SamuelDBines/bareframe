import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import {
	captureProjectNote,
	createProjectNote,
	createProjectNotesBatch,
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

	router.post('/projects/:projectId/notes/capture', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{
				where?: string | null;
				issue?: string;
				body?: string;
				pageUrl?: string | null;
				elementSelector?: string | null;
				screenshot?: string;
			}>();
			const issue = (body.issue ?? body.body ?? '').trim();
			if (!issue) return c.json({ error: 'issue is required' }, 400);
			const note = await captureProjectNote(pool, projectId, actor, {
				where: body.where,
				issue,
				pageUrl: body.pageUrl,
				elementSelector: body.elementSelector,
				screenshot: body.screenshot,
			});
			return c.json({ note }, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/notes/batch', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{
				notes?: { where?: string | null; body?: string; issue?: string; pageUrl?: string | null }[];
			}>();
			const items = (body.notes ?? [])
				.map((n) => ({
					where: n.where,
					body: (n.body ?? n.issue ?? '').trim(),
					pageUrl: n.pageUrl,
				}))
				.filter((n) => n.body.length > 0);
			if (!items.length) return c.json({ error: 'notes array required' }, 400);
			const notes = await createProjectNotesBatch(pool, projectId, actor, items);
			return c.json({ notes }, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/projects/:projectId/notes', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const body = await c.req.json<{
				where?: string | null;
				body?: string;
				issue?: string;
				frameId?: string | null;
				nodeId?: string | null;
				pageUrl?: string | null;
				elementSelector?: string | null;
				tags?: string[];
			}>();
			const text = (body.body ?? body.issue ?? '').trim();
			if (!text) return c.json({ error: 'body is required' }, 400);
			const note = await createProjectNote(pool, projectId, actor, {
				where: body.where,
				body: text,
				frameId: body.frameId,
				nodeId: body.nodeId,
				pageUrl: body.pageUrl,
				elementSelector: body.elementSelector,
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
				where?: string | null;
				body?: string;
				issue?: string;
				frameId?: string | null;
				nodeId?: string | null;
				pageUrl?: string | null;
				elementSelector?: string | null;
				status?: 'open' | 'done';
				tags?: string[];
			}>();
			const patch = { ...body };
			if (body.issue !== undefined && body.body === undefined) {
				patch.body = body.issue;
			}
			const note = await updateProjectNote(pool, projectId, noteId, actor, patch);
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