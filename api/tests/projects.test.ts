import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createPool } from '../src/db/index.js';
import { createProject, createProjectToken } from '../src/db/projects.js';
import { upsertUser } from '../src/db/index.js';
import { setupTestDb } from '../src/test-utils.js';
import { resetProjectEventBusForTests } from '../src/projects/events.js';

describe('designer projects API', () => {
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

	it('creates a project with token auth roundtrip', async () => {
		const user = await upsertUser(pool, {
			githubId: 42,
			login: 'sam',
			name: 'Sam',
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'Hookoh flows');
		const tokenPlain = `bf_proj_${'a'.repeat(48)}`;
		await createProjectToken(pool, created.id, user.id, 'bot', ['projects:read', 'projects:write'], tokenPlain);

		const listRes = await fetch(`${baseUrl}/api/projects`, {
			headers: { Authorization: `Bearer ${tokenPlain}` },
		});
		expect(listRes.status).toBe(200);
		const list = (await listRes.json()) as { projects: { id: string }[] };
		expect(list.projects[0]?.id).toBe(created.id);

		const cmdRes = await fetch(`${baseUrl}/api/projects/${created.id}/commands`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${tokenPlain}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				baseVersion: 1,
				command: { type: 'add_frame', pageId: created.document.project.pages[0]?.id, name: 'Screen' },
			}),
		});
		expect(cmdRes.status).toBe(200);
		const cmdBody = (await cmdRes.json()) as { version: number; effects: { frameId?: string } };
		expect(cmdBody.version).toBe(2);
		expect(cmdBody.effects.frameId).toBeTruthy();

		const getRes = await fetch(`${baseUrl}/api/projects/${created.id}`, {
			headers: { Authorization: `Bearer ${tokenPlain}` },
		});
		const project = (await getRes.json()) as { version: number; document: { project: { frames: unknown[] } } };
		expect(project.version).toBe(2);
		expect(project.document.project.frames.length).toBe(1);
	});
});
