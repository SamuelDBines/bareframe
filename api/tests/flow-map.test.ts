import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createPool } from '../src/db/index.js';
import { createProject, createProjectToken } from '../src/db/projects.js';
import { upsertUser } from '../src/db/index.js';
import { setupTestDb, testConfig, createTestApp } from '../src/test-utils.js';
import { closePlaywrightBrowser } from '../src/render/playwright-capture.js';

const databaseUrl = process.env.DATABASE_URL;
const fixtureDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures/flow-site');

describe.skipIf(!databaseUrl)('create_flow_map', () => {
	let pool: ReturnType<typeof createPool>;
	let apiServer: Server;
	let apiBase = '';
	let fixtureBase = '';
	let fixtureServer: ReturnType<typeof createServer>;
	let projectId = '';
	let token = '';

	beforeAll(async () => {
		process.env.RENDER_ALLOW_HOSTS = '127.0.0.1';
		process.env.RENDER_INLINE = '1';
		pool = createPool(testConfig);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 501,
			login: 'flow-map-tester',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'Flow map test');
		projectId = created.id;
		token = `bf_proj_${'c'.repeat(48)}`;
		await createProjectToken(pool, projectId, user.id, 'flow', ['flowmap:write', 'projects:read'], token);

		fixtureServer = createServer(async (req, res) => {
			const url = new URL(req.url ?? '/', fixtureBase);
			let file = url.pathname === '/' ? '/index.html' : url.pathname;
			if (!file.endsWith('.html')) file = `${file}.html`;
			try {
				const body = await readFile(path.join(fixtureDir, file === '/index.html' ? 'index.html' : file.slice(1)));
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(body);
			} catch {
				res.writeHead(404);
				res.end('not found');
			}
		});
		await new Promise<void>((resolve) => {
			fixtureServer.listen(0, '127.0.0.1', () => {
				const addr = fixtureServer.address();
				if (addr && typeof addr === 'object') fixtureBase = `http://127.0.0.1:${addr.port}`;
				resolve();
			});
		});

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
		fixtureServer?.close();
		await closePlaywrightBrowser();
		await pool.end();
	});

	it('builds a flow map canvas from the fixture site', async () => {
		const projectRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const project = (await projectRes.json()) as { version: number };

		const res = await fetch(`${apiBase}/api/projects/${projectId}/flow-maps`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				baseVersion: project.version,
				url: `${fixtureBase}/`,
				maxPages: 5,
			}),
		});
		expect(res.status).toBe(202);
		const { jobId } = (await res.json()) as { jobId: string };

		const jobRes = await fetch(`${apiBase}/api/projects/${projectId}/flow-maps/${jobId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const job = (await jobRes.json()) as {
			status: string;
			result: { pageCount: number; findingsSummary: string };
			findings: unknown[];
		};
		expect(job.status).toBe('completed');
		expect(job.result.pageCount).toBeGreaterThanOrEqual(2);
		expect(job.findings.length).toBeGreaterThan(0);

		const docRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const doc = (await docRes.json()) as {
			document: { project: { connectors: unknown[]; frames: unknown[]; annotations: unknown[] } };
		};
		expect(doc.document.project.frames.length).toBeGreaterThanOrEqual(2);
		expect(doc.document.project.connectors.length).toBeGreaterThan(0);
	}, 120_000);
});
