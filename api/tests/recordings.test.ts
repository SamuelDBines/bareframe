import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createPool, upsertUser } from '../src/db/index.js';
import { createProject, createProjectToken } from '../src/db/projects.js';
import { setupTestDb, testConfig, createTestApp } from '../src/test-utils.js';

const databaseUrl = process.env.DATABASE_URL;

const tinyPng = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
	'base64',
);

describe.skipIf(!databaseUrl)('recordings API', () => {
	let pool: ReturnType<typeof createPool>;
	let apiServer: Server;
	let apiBase = '';
	let projectId = '';
	let token = '';

	beforeAll(async () => {
		process.env.RENDER_INLINE = '1';
		pool = createPool(testConfig);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 502,
			login: 'rec-tester',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'Recording test');
		projectId = created.id;
		token = `bf_proj_${'d'.repeat(48)}`;
		await createProjectToken(
			pool,
			projectId,
			user.id,
			'rec',
			['recordings:upload', 'projects:read', 'projects:write'],
			token,
		);

		const app = createTestApp(pool, {} as never, testConfig);
		await new Promise<void>((resolve) => {
			apiServer = serve({ fetch: app.fetch, port: 0 }, (info) => {
				apiBase = `http://127.0.0.1:${info.port}`;
				resolve();
			});
		});
	});

	afterAll(async () => {
		apiServer?.close();
		await pool.end();
	});

	it('uploads steps and builds a journey canvas', async () => {
		const projectRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const project = (await projectRes.json()) as { version: number };

		const res = await fetch(`${apiBase}/api/projects/${projectId}/recordings`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: 'Click-through',
				baseVersion: project.version,
				build: true,
				steps: [
					{
						stepIndex: 0,
						url: 'https://example.com/a',
						capturedAt: new Date().toISOString(),
						viewport: { width: 390, height: 844 },
						imageBase64: tinyPng.toString('base64'),
						contentType: 'image/png',
					},
					{
						stepIndex: 1,
						url: 'https://example.com/b',
						capturedAt: new Date().toISOString(),
						viewport: { width: 390, height: 844 },
						click: { x: 120, y: 400, name: 'Continue' },
						imageBase64: tinyPng.toString('base64'),
						contentType: 'image/png',
					},
				],
			}),
		});
		expect(res.status).toBe(201);
		const body = (await res.json()) as { build: { version: number; frameIds: string[] } };
		expect(body.build.frameIds.length).toBe(2);

		const listRes = await fetch(`${apiBase}/api/projects/${projectId}/recordings`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const list = (await listRes.json()) as { recordings: { status: string }[] };
		expect(list.recordings[0]?.status).toBe('built');
	});
});
