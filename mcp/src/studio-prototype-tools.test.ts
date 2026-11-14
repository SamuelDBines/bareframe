import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { serve } from '@hono/node-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { createApp } from '../../api/src/app.js';
import { loadConfig as loadApiConfig } from '../../api/src/config.js';
import { createPool, upsertUser } from '../../api/src/db/index.js';
import { createAccountToken } from '../../api/src/db/accountTokens.js';
import { randomToken } from '../../api/src/auth/crypto.js';
import { setupTestDb } from '../../api/src/test-utils.js';
import { loadConfig } from './config.js';
import { createHttpApp, resetTokenRateLimitBucketsForTests } from './app.js';
import { resetRateLimitBucketsForTests } from './rate-limit.js';

const databaseUrl = process.env.DATABASE_URL;

describe.skipIf(!databaseUrl)('Studio MCP prototype tools', () => {
	let apiServer: Server;
	let mcpServer: Server;
	let studioUrl = '';
	let accountToken = '';

	beforeAll(async () => {
		resetRateLimitBucketsForTests();
		resetTokenRateLimitBucketsForTests();
		process.env.DATABASE_URL = databaseUrl;
		process.env.SESSION_SECRET = 'test-session-secret-32chars!!!!';
		process.env.PUBLIC_URL = 'http://127.0.0.1:8080';
		process.env.LLM_ADAPTER = 'fixture';
		const apiConfig = loadApiConfig();
		const pool = createPool(apiConfig);
		await setupTestDb(pool);
		const user = await upsertUser(pool, {
			githubId: 88,
			login: 'mcp-acc',
			name: null,
			avatarUrl: null,
			email: null,
		});
		accountToken = `bf_acc_${randomToken(32)}`;
		await createAccountToken(
			pool,
			user.id,
			'MCP',
			['projects:create', 'projects:write', 'share:create'],
			accountToken,
		);

		const apiApp = createApp({ config: apiConfig, pool, github: {} as never });
		await new Promise<void>((resolve) => {
			apiServer = serve({ fetch: apiApp.fetch, port: 0 }, (info) => {
				process.env.BAREFRAME_API_URL = `http://127.0.0.1:${info.port}`;
				resolve();
			});
		});

		process.env.BAREFRAME_MCP_BASE_PATH = '/mcp';
		process.env.BAREFRAME_MCP_RATE_MAX = '10000';
		const mcpConfig = loadConfig();
		const expressApp = createHttpApp(mcpConfig);
		await new Promise<void>((resolve) => {
			mcpServer = expressApp.listen(0, '127.0.0.1', () => {
				const addr = mcpServer.address();
				if (addr && typeof addr === 'object') studioUrl = `http://127.0.0.1:${addr.port}/mcp/studio`;
				resolve();
			});
		});
	});

	afterAll(() => {
		apiServer?.close();
		mcpServer?.close();
	});

	it('create_project via account token', async () => {
		const transport = new StreamableHTTPClientTransport(new URL(studioUrl), {
			requestInit: { headers: { Authorization: `Bearer ${accountToken}` } },
		});
		const client = new Client({ name: 'studio-acc', version: '1.0.0' });
		await client.connect(transport);
		const result = await client.callTool({ name: 'create_project', arguments: { name: 'MCP created' } });
		const text = (result.content as { type: string; text: string }[])[0]?.text ?? '';
		const data = JSON.parse(text) as { id: string };
		expect(data.id).toBeTruthy();
	});
});