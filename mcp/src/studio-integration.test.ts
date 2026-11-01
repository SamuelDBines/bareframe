import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { serve } from '@hono/node-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../../api/src/app.js';
import { loadConfig as loadApiConfig } from '../../api/src/config.js';
import { createPool, upsertUser } from '../../api/src/db/index.js';
import { createProject, createProjectToken } from '../../api/src/db/projects.js';
import { setupTestDb } from '../../api/src/test-utils.js';
import { loadConfig } from './config.js';
import { createHttpApp, resetTokenRateLimitBucketsForTests } from './app.js';
import { resetRateLimitBucketsForTests } from './rate-limit.js';

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)('Studio MCP end-to-end', () => {
	let apiBase = '';
	let studioUrl = '';
	let apiServer: Server;
	let mcpServer: Server;
	let projectId = '';
	let token = '';
	let pageId = '';
	let baseVersion = 1;

	beforeAll(async () => {
		resetRateLimitBucketsForTests();
		resetTokenRateLimitBucketsForTests();
		process.env.DATABASE_URL = databaseUrl;
		process.env.SESSION_SECRET = 'test-session-secret-32chars!!!!';
		process.env.PUBLIC_URL = 'http://127.0.0.1:8080';
		process.env.GITHUB_CLIENT_ID = 'test';
		process.env.GITHUB_CLIENT_SECRET = 'test';

		const apiConfig = loadApiConfig();
		const pool = createPool(apiConfig);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 99,
			login: 'studio-bot',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const created = await createProject(pool, user.id, 'Studio e2e');
		projectId = created.id;
		pageId = created.document.project.pages[0]!.id;
		baseVersion = created.version;
		token = `bf_proj_${'b'.repeat(48)}`;
		await createProjectToken(pool, projectId, user.id, 'e2e', ['projects:read', 'projects:write'], token);

		const apiApp = createApp({ config: apiConfig, pool, github: {} as never });
		await new Promise<void>((resolve) => {
			apiServer = serve({ fetch: apiApp.fetch, port: 0 }, (info) => {
				apiBase = `http://127.0.0.1:${info.port}`;
				process.env.BAREFRAME_API_URL = apiBase;
				resolve();
			});
		});

		process.env.PORT = '0';
		process.env.BAREFRAME_MCP_BASE_PATH = '/mcp';
		process.env.BAREFRAME_MCP_RATE_MAX = '10000';
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
	});

	afterAll(async () => {
		apiServer?.close();
		mcpServer?.close();
	});

	it('add_screen via MCP appears in project document', async () => {
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

		const transport = new StreamableHTTPClientTransport(new URL(studioUrl));
		const client = new Client({ name: 'studio-e2e', version: '1.0.0' });
		await client.connect(transport);

		const toolResult = await client.callTool({
			name: 'add_screen',
			arguments: {
				projectId,
				baseVersion,
				name: 'Checkout',
				pageId,
				presetId: 'mobile',
			},
		});
		expect(toolResult.isError).not.toBe(true);

		const getRes = await fetch(`${apiBase}/api/projects/${projectId}`, {
			headers: { Authorization: `Bearer ${token}` },
		});
		const body = (await getRes.json()) as { document: { project: { frames: { name: string }[] } } };
		expect(body.document.project.frames.some((f) => f.name === 'Checkout')).toBe(true);

		await client.close();
		globalThis.fetch = origFetch;
	});
});
