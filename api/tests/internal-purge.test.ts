import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createPool } from '../src/db/index.js';
import { setupTestDb, testConfig, createTestApp } from '../src/test-utils.js';

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)('internal worker routes', () => {
	let pool: ReturnType<typeof createPool>;
	let baseUrl = '';
	let server: Server;
	const workerSecret = testConfig.renderWorkerSecret;

	beforeAll(async () => {
		process.env.SESSION_SECRET = 'test-session-secret-32chars!!!!';
		process.env.PUBLIC_URL = 'http://127.0.0.1:8080';
		process.env.GITHUB_CLIENT_ID = 'test';
		process.env.GITHUB_CLIENT_SECRET = 'test';
		process.env.RENDER_WORKER_SECRET = workerSecret;
		const config = { ...testConfig, renderWorkerSecret: workerSecret };
		pool = createPool(config);
		await setupTestDb(pool);
		const app = createTestApp(pool, {} as never, config);
		await new Promise<void>((resolve) => {
			server = serve({ fetch: app.fetch, port: 0 }, (info) => {
				baseUrl = `http://127.0.0.1:${info.port}`;
				resolve();
			});
		});
	});

	afterAll(async () => {
		server?.close();
		await pool.end();
	});

	it('purge-expired accepts x-render-worker-secret', async () => {
		const res = await fetch(`${baseUrl}/api/internal/recordings/purge-expired`, {
			method: 'POST',
			headers: { 'x-render-worker-secret': workerSecret },
		});
		expect(res.status).toBe(200);
		const body = (await res.json()) as { deleted: number };
		expect(typeof body.deleted).toBe('number');
	});

	it('purge-expired rejects wrong secret', async () => {
		const res = await fetch(`${baseUrl}/api/internal/recordings/purge-expired`, {
			method: 'POST',
			headers: { 'x-render-worker-secret': 'not-the-secret' },
		});
		expect(res.status).toBe(403);
	});

	it('purge-expired rejects missing secret', async () => {
		const res = await fetch(`${baseUrl}/api/internal/recordings/purge-expired`, {
			method: 'POST',
		});
		expect(res.status).toBe(403);
	});

	it('project routes still require auth without worker secret', async () => {
		const purge = await fetch(`${baseUrl}/api/internal/recordings/purge-expired`, {
			method: 'POST',
			headers: { Authorization: `Bearer bf_proj_${'z'.repeat(48)}` },
		});
		expect(purge.status).toBe(403);

		const projects = await fetch(`${baseUrl}/api/projects`);
		expect(projects.status).toBe(401);
		const recordings = await fetch(`${baseUrl}/api/projects/00000000-0000-0000-0000-000000000001/recordings`);
		expect(recordings.status).toBe(401);
	});
});
