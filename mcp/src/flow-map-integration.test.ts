import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../../api/src/app.js';
import { loadConfig as loadApiConfig } from '../../api/src/config.js';
import { createPool, upsertUser } from '../../api/src/db/index.js';
import { createProject, createProjectToken } from '../../api/src/db/projects.js';
import { setupTestDb } from '../../api/src/test-utils.js';
import { closePlaywrightBrowser } from '../../api/src/render/playwright-capture.js';
import { loadConfig } from './config.js';
import { createHttpApp, resetTokenRateLimitBucketsForTests } from './app.js';
import { resetRateLimitBucketsForTests } from './rate-limit.js';

const databaseUrl = process.env.DATABASE_URL;
const fixtureDir = path.join(
	path.dirname(fileURLToPath(import.meta.url)),
	'../../api/tests/fixtures/flow-site',
);

describe.skipIf(!databaseUrl)('create_flow_map MCP', () => {
	let apiBase = '';
	let studioUrl = '';
	let apiServer: Server;
	let mcpServer: Server;
	let fixtureServer: ReturnType<typeof createServer>;
	let fixtureBase = '';
	let projectId = '';
	let token = '';

	beforeAll(async () => {
		process.env.RENDER_ALLOW_HOSTS = '127.0.0.1';
		process.env.RENDER_INLINE = '1';
		resetRateLimitBucketsForTests();
		resetTokenRateLimitBucketsForTests();
		process.env.SESSION_SECRET = 'test-session-secret-32chars!!!!';
		process.env.PUBLIC_URL = 'http://127.0.0.1:8080';
		process.env.GITHUB_CLIENT_ID = 'test';
		process.env.GITHUB_CLIENT_SECRET = 'test';

		const apiConfig = loadApiConfig();
		const pool = createPool(apiConfig);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 77,
			login: 'flow-mcp',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'MCP flow map');
		projectId = created.id;
		token = `bf_proj_${'f'.repeat(48)}`;
		await createProjectToken(pool, projectId, user.id, 'e2e', ['flowmap:write', 'projects:read'], token);

		fixtureServer = createServer(async (req, res) => {
			const url = new URL(req.url ?? '/', fixtureBase);
			let file = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '');
			if (!file.endsWith('.html')) file = `${file}.html`;
			try {
				const body = await readFile(path.join(fixtureDir, file));
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

		const apiApp = createApp({ config: apiConfig, pool, github: {} as never });
		await new Promise<void>((resolve) => {
			apiServer = serve({ fetch: apiApp.fetch, port: 0 }, (info) => {
				apiBase = `http://127.0.0.1:${info.port}`;
				process.env.BAREFRAME_API_URL = apiBase;
				resolve();
			});
		});

		const mcpConfig = loadConfig();
		const expressApp = createHttpApp(mcpConfig);
		await new Promise<void>((resolve) => {
			mcpServer = expressApp.listen(0, '127.0.0.1', () => {
				const addr = mcpServer.address();
				if (addr && typeof addr === 'object') {
					studioUrl = `http://127.0.0.1:${addr.port}/mcp/studio`;
				}
				resolve();
			});
		});
	}, 120_000);

	afterAll(async () => {
		apiServer?.close();
		mcpServer?.close();
		fixtureServer?.close();
		await closePlaywrightBrowser();
	});

	it('create_flow_map completes against fixture site', async () => {
		const origFetch = globalThis.fetch;
		globalThis.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
			if (url.startsWith(studioUrl)) {
				const headers = new Headers(init?.headers);
				headers.set('Authorization', `Bearer ${token}`);
				return origFetch(input, { ...init, headers });
			}
			return origFetch(input, init);
		};

		const projectRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const project = (await projectRes.json()) as { version: number };

		const transport = new StreamableHTTPClientTransport(new URL(studioUrl));
		const client = new Client({ name: 'flow-map-e2e', version: '1.0.0' });
		await client.connect(transport);

		const toolResult = await client.callTool({
			name: 'create_flow_map',
			arguments: {
				projectId,
				baseVersion: project.version,
				url: `${fixtureBase}/`,
				maxPages: 4,
			},
		});
		expect(toolResult.isError).not.toBe(true);
		const text = (toolResult.content as { text: string }[])[0]?.text ?? '';
		expect(text).toMatch(/"status": "completed"/);

		await client.close();
		globalThis.fetch = origFetch;
	}, 120_000);
});
