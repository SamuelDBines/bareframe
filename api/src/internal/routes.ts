import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { purgeExpiredRecordings } from '../db/recordings.js';
import { verifyRenderWorkerSecret } from './worker-auth.js';

/** Worker/cron routes — no session or project token auth. */
export function createInternalWorkerRouter(pool: pg.Pool, config: Config): Hono {
	const router = new Hono();

	router.post('/internal/recordings/purge-expired', async (c) => {
		if (!verifyRenderWorkerSecret(c.req.header('x-render-worker-secret'), config.renderWorkerSecret)) {
			return c.json({ error: 'Forbidden' }, 403);
		}
		const deleted = await purgeExpiredRecordings(pool);
		return c.json({ deleted });
	});

	return router;
}
