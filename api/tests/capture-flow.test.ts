import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createPool, upsertUser } from '../src/db/index.js';
import { createProject, createProjectToken } from '../src/db/projects.js';
import { dedupeCaptureStepsByUrl, urlAssetSequence } from '../src/db/capture-flow.js';
import { setupTestDb, testConfig, createTestApp } from '../src/test-utils.js';

const databaseUrl = process.env.DATABASE_URL;

const tinyPng = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
	'base64',
);

describe('capture flow helpers', () => {
	it('dedupes duplicate URLs', () => {
		const steps = [
			{ url: 'https://a.test/', title: 'a' },
			{ url: 'https://b.test/', title: 'b' },
			{ url: 'https://a.test/', title: 'a2' },
		];
		expect(dedupeCaptureStepsByUrl(steps).map((s) => s.url)).toEqual([
			'https://a.test/',
			'https://b.test/',
		]);
	});

	it('reuses assets when the same URL is visited twice', () => {
		const mapped = urlAssetSequence([
			{ url: 'https://a.test/', assetId: 'asset-a' },
			{ url: 'https://b.test/', assetId: 'asset-b', click: { x: 10, y: 20, name: 'Go' } },
			{ url: 'https://a.test/', assetId: 'asset-a', click: { x: 5, y: 5, name: 'Back' } },
		]);
		expect(mapped.shots).toHaveLength(2);
		expect(mapped.links).toHaveLength(2);
		expect(mapped.links[1]?.toAssetId).toBe('asset-a');
	});
});

describe.skipIf(!databaseUrl)('capture flow API', () => {
	let pool: ReturnType<typeof createPool>;
	let apiServer: Server;
	let apiBase = '';
	let projectId = '';
	let token = '';

	beforeAll(async () => {
		pool = createPool(testConfig);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 503,
			login: 'flow-cap',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'Capture flow');
		projectId = created.id;
		token = `bf_proj_${'f'.repeat(48)}`;
		await createProjectToken(
			pool,
			projectId,
			user.id,
			'extension',
			['capture:write', 'assets:upload', 'projects:read'],
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

	it('POST capture/flow builds deduped screens and connectors', async () => {
		const projectRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const project = (await projectRes.json()) as { version: number };

		const res = await fetch(`${apiBase}/api/projects/${projectId}/capture/flow`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: 'Checkout',
				baseVersion: project.version,
				steps: [
					{
						stepIndex: 0,
						url: 'https://example.com/cart',
						capturedAt: new Date().toISOString(),
						viewport: { width: 390, height: 844 },
						imageBase64: tinyPng.toString('base64'),
					},
					{
						stepIndex: 1,
						url: 'https://example.com/checkout',
						capturedAt: new Date().toISOString(),
						viewport: { width: 390, height: 844 },
						click: { x: 120, y: 400, w: 80, h: 32, name: 'Checkout' },
						imageBase64: tinyPng.toString('base64'),
					},
					{
						stepIndex: 2,
						url: 'https://example.com/cart',
						capturedAt: new Date().toISOString(),
						viewport: { width: 390, height: 844 },
						click: { x: 40, y: 20, name: 'Back' },
						imageBase64: tinyPng.toString('base64'),
					},
				],
			}),
		});
		expect(res.status).toBe(201);
		const body = (await res.json()) as { screenCount: number; connectorCount: number };
		expect(body.screenCount).toBe(2);
		expect(body.connectorCount).toBe(2);

		const docRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const doc = (await docRes.json()) as {
			document: { project: { frames: unknown[]; connectors: unknown[] } };
		};
		expect(doc.document.project.frames.length).toBeGreaterThan(1);
		expect(doc.document.project.connectors.length).toBe(2);
	});
});