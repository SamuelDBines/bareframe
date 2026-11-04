import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createServer } from 'node:http';
import { mapCaptureEventsToFlow } from '../src/capture/event-mapping.js';
import { hashToken } from '../src/auth/crypto.js';
import { createApp } from '../src/app.js';
import { loadConfig } from '../src/config.js';
import { createPool, upsertUser } from '../src/db/index.js';
import { createProject, createProjectToken } from '../src/db/projects.js';
import { setupTestDb, testConfig } from '../src/test-utils.js';
import { resetProjectEventBusForTests } from '../src/projects/events.js';

describe('mapCaptureEventsToFlow', () => {
	it('dedupes shots by url and maps navigatedFrom edges', () => {
		const { shots, links } = mapCaptureEventsToFlow([
			{
				url: 'https://app.test/',
				title: 'Home',
				asset_id: 'a1',
				navigated_from: null,
				clicked_selector: null,
			},
			{
				url: 'https://app.test/',
				title: 'Home v2',
				asset_id: 'a2',
				navigated_from: null,
				clicked_selector: null,
			},
			{
				url: 'https://app.test/settings',
				title: 'Settings',
				asset_id: 'b1',
				navigated_from: 'https://app.test/',
				clicked_selector: '#settings-link',
			},
		]);
		expect(shots).toHaveLength(2);
		expect(shots.find((s) => s.url.includes('settings'))?.assetId).toBe('b1');
		expect(links).toHaveLength(1);
		expect(links[0]?.fromAssetId).toBe('a2');
		expect(links[0]?.toAssetId).toBe('b1');
	});
});

describe('hashToken', () => {
	it('hashes deterministically without storing plaintext', () => {
		const plain = 'bf_proj_test_secret_value';
		expect(hashToken(plain)).toMatch(/^[a-f0-9]{64}$/);
		expect(hashToken(plain)).toBe(hashToken(plain));
		expect(hashToken(plain)).not.toContain('bf_proj');
	});
});

describe.skipIf(!process.env.DATABASE_URL)('capture ingest API', () => {
	let pool: ReturnType<typeof createPool>;
	let baseUrl = '';
	let server: Server;
	let captureToken = '';
	let projectId = '';

	beforeAll(async () => {
		resetProjectEventBusForTests();
		process.env.SESSION_SECRET = 'test-session-secret-32chars!!!!';
		process.env.PUBLIC_URL = 'http://127.0.0.1:8080';
		process.env.GITHUB_CLIENT_ID = 'test';
		process.env.GITHUB_CLIENT_SECRET = 'test';
		const config = loadConfig();
		pool = createPool(config);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 902,
			login: 'capture-user',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'Capture test');
		projectId = created.id;
		captureToken = `bf_proj_${'e'.repeat(48)}`;
		await createProjectToken(
			pool,
			projectId,
			user.id,
			'capture',
			['capture:write', 'assets:upload', 'projects:read'],
			captureToken,
		);
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

	it('accepts capture batches and syncs flow map', async () => {
		const pngBase64 =
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
		const res = await fetch(`${baseUrl}/api/v1/capture/events`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${captureToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				sync: true,
				events: [
					{
						sessionId: 'sess-1',
						url: 'https://app.example/',
						title: 'Home',
						screenshot: pngBase64,
					},
					{
						sessionId: 'sess-1',
						url: 'https://app.example/dashboard',
						title: 'Dashboard',
						screenshot: pngBase64,
						navigatedFrom: 'https://app.example/',
					},
				],
			}),
		});
		expect(res.status).toBe(202);
		const body = (await res.json()) as { accepted: number; synced: boolean; version?: number };
		expect(body.accepted).toBe(2);
		expect(body.synced).toBe(true);
		expect(body.version).toBeGreaterThan(1);

		const docRes = await fetch(`${baseUrl}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${captureToken}` },
		});
		const doc = (await docRes.json()) as {
			document: { project: { frames: unknown[]; connectors: unknown[] } };
		};
		expect(doc.document.project.frames.length).toBeGreaterThanOrEqual(2);
		expect(doc.document.project.connectors.length).toBeGreaterThanOrEqual(1);
	});
});

describe.skipIf(!process.env.DATABASE_URL)('sitemap import', () => {
	let pool: ReturnType<typeof createPool>;
	let fixtureServer: ReturnType<typeof createServer>;
	let fixtureBase = '';

	beforeAll(async () => {
		pool = createPool(testConfig);
		await setupTestDb(pool);

		fixtureServer = createServer((req, res) => {
			const url = new URL(req.url ?? '/', fixtureBase);
			if (url.pathname === '/sitemap.xml') {
				res.writeHead(200, { 'Content-Type': 'application/xml' });
				res.end(`<?xml version="1.0"?><urlset>
<url><loc>${fixtureBase}/</loc></url>
<url><loc>${fixtureBase}/pricing</loc></url>
</urlset>`);
				return;
			}
			res.writeHead(200, { 'Content-Type': 'text/html' });
			res.end(
				`<html><head><title>Page ${url.pathname}</title></head><body><a href="/docs">Docs</a></body></html>`,
			);
		});
		await new Promise<void>((resolve) => {
			fixtureServer.listen(0, '127.0.0.1', () => {
				const addr = fixtureServer.address();
				if (addr && typeof addr === 'object') fixtureBase = `http://127.0.0.1:${addr.port}`;
				resolve();
			});
		});
	});

	afterAll(async () => {
		fixtureServer?.close();
		await pool.end();
	});

	it('imports routes from a fixture sitemap', async () => {
		process.env.RENDER_ALLOW_HOSTS = '127.0.0.1';
		const user = await upsertUser(pool, {
			githubId: 903,
			login: 'sitemap-user',
			name: null,
			avatarUrl: null,
			email: null,
		});
		await pool.query(`UPDATE users SET plan_tier = 'pro' WHERE id = $1`, [user.id]);
		const created = await createProject(pool, user.id, 'Sitemap project');
		const { importSitemapIntoProject } = await import('../src/sitemap/import-sitemap.js');
		const result = await importSitemapIntoProject(
			pool,
			created.id,
			user.id,
			created.version,
			`${fixtureBase}/`,
		);
		expect(result.routeCount).toBeGreaterThanOrEqual(2);
		expect(result.connectorCount).toBeGreaterThanOrEqual(1);
	});
});
