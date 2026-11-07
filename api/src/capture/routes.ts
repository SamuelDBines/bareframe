import type { Context } from 'hono';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type pg from 'pg';
import type { Config } from '../config.js';
import { findProjectToken, touchProjectToken, type AuthActor } from '../db/projects.js';
import { publishProjectUpdate } from '../projects/events.js';
import { handleProjectError } from '../projects/auth.js';
import { ingestAndSyncCaptureEvents, type CaptureEventInput } from './ingest.js';

type CaptureTokenActor = Extract<AuthActor, { kind: 'token' }> & { allowedOrigins: string[] };

function getCaptureActor(c: Context): CaptureTokenActor {
	return c.get('captureActor') as CaptureTokenActor;
}

function captureTokenHasScope(scopes: string[], required: string): boolean {
	if (scopes.includes('projects:write')) return true;
	return scopes.includes(required);
}

function createCaptureBearerMiddleware(pool: pg.Pool) {
	return async (c: Context<{ Variables: { captureActor: CaptureTokenActor } }>, next: () => Promise<void>) => {
		const authHeader = c.req.header('authorization');
		if (!authHeader?.startsWith('Bearer ')) {
			return c.json({ error: 'Unauthorized', message: 'Bearer project token required' }, 401);
		}
		const token = authHeader.slice('Bearer '.length).trim();
		const row = await findProjectToken(pool, token);
		if (!row) return c.json({ error: 'Invalid token' }, 401);
		if (!captureTokenHasScope(row.scopes ?? [], 'capture:write')) {
			return c.json({ error: 'Insufficient scope', message: 'Token needs capture:write' }, 403);
		}
		await touchProjectToken(pool, row.id);
		const actor: CaptureTokenActor = {
			kind: 'token',
			userId: row.owner_user_id,
			tokenId: row.id,
			projectId: row.project_id,
			scopes: row.scopes ?? [],
			allowedOrigins: row.allowed_origins ?? [],
		};
		c.set('captureActor', actor);
		return next();
	};
}

export function createCaptureRouter(pool: pg.Pool, config: Config) {
	const router = new Hono<{ Variables: { captureActor: CaptureTokenActor } }>();
	const bearer = createCaptureBearerMiddleware(pool);

	router.use(
		'*',
		cors({
			origin: (origin) => origin ?? '*',
			allowMethods: ['POST', 'OPTIONS'],
			allowHeaders: ['Authorization', 'Content-Type'],
			maxAge: 86400,
		}),
	);

	router.post('/capture/events', bearer, async (c) => {
		try {
			const len = Number(c.req.header('content-length') ?? 0);
			if (len > 6 * 1024 * 1024) {
				return c.json({ error: 'payload_too_large', message: 'Max request body is 6MB' }, 413);
			}
			const actor = getCaptureActor(c);
			const body = await c.req.json<{ events?: CaptureEventInput[]; sync?: boolean }>();
			const events = Array.isArray(body.events) ? body.events : [];
			if (events.length > 50) {
				return c.json({ error: 'bad_request', message: 'Max 50 events per batch' }, 400);
			}
			const result = await ingestAndSyncCaptureEvents(
				pool,
				actor.projectId,
				events,
				actor,
				body.sync !== false,
				actor.allowedOrigins,
			);
			if (result.synced && result.version != null) {
				publishProjectUpdate(actor.projectId, result.version);
			}
			return c.json(result, 202);
		} catch (err) {
			if (err instanceof Error && err.message.startsWith('Too many')) {
				return c.json({ error: 'bad_request', message: err.message }, 400);
			}
			if (err instanceof Error && err.message.includes('limit reached')) {
				return c.json({ error: 'limit_exceeded', message: err.message }, 429);
			}
			return handleProjectError(c, err);
		}
	});

	router.get('/capture/config', bearer, (c) => {
		const actor = getCaptureActor(c);
		return c.json({
			projectId: actor.projectId,
			ingestUrl: `${config.publicUrl}/api/v1/capture/events`,
			maxBatch: 50,
		});
	});

	return router;
}
