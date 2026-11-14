import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createPool, upsertUser } from '../src/db/index.js';
import { createAccountToken } from '../src/db/accountTokens.js';
import { randomToken } from '../src/auth/crypto.js';
import { createProject } from '../src/db/projects.js';
import { setupTestDb } from '../src/test-utils.js';
import { resetProjectEventBusForTests } from '../src/projects/events.js';

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)('account API tokens', () => {
	let pool: ReturnType<typeof createPool>;
	let baseUrl = '';
	let server: Server;

	beforeAll(async () => {
		resetProjectEventBusForTests();
		process.env.SESSION_SECRET = 'test-session-secret-32chars!!!!';
		process.env.PUBLIC_URL = 'http://127.0.0.1:8080';
		process.env.GITHUB_CLIENT_ID = 'test';
		process.env.GITHUB_CLIENT_SECRET = 'test';
		const config = loadConfig();
		pool = createPool(config);
		await setupTestDb(pool);
		const app = createApp({ config, pool, github: {} as never });
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

	it('creates project and playable share with account token', async () => {
		const user = await upsertUser(pool, {
			githubId: 77,
			login: 'acc-user',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const plain = `bf_acc_${randomToken(32)}`;
		await createAccountToken(pool, user.id, 'MCP', ['projects:create', 'projects:write', 'share:create'], plain);

		const createRes = await fetch(`${baseUrl}/api/projects`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'From token' }),
		});
		expect(createRes.status).toBe(201);
		const created = (await createRes.json()) as { id: string };

		const shareRes = await fetch(`${baseUrl}/api/projects/${created.id}/share`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${plain}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ play: true }),
		});
		expect(shareRes.status).toBe(200);
		const share = (await shareRes.json()) as { publicUrl: string; playUrl?: string };
		expect(share.publicUrl).toContain('play=1');
		expect(share.playUrl).toContain('play=1');
	});
});