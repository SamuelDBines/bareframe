import { beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { createHttpApp } from './app.js';
import { loadCatalog } from './catalog.js';

const TEST_TOKEN = 'bf_test_mcp_token_for_ci_only';

describe('Bareframe MCP HTTP', () => {
	let baseUrl = '';

	beforeAll(async () => {
		process.env.BAREFRAME_MCP_TOKENS = JSON.stringify([
			{
				id: 'test',
				token: TEST_TOKEN,
				scopes: ['components:read', 'themes:read'],
			},
		]);
		process.env.PORT = '0';
		process.env.BAREFRAME_MCP_BASE_PATH = '/v1';
		const config = loadConfig();
		const app = createHttpApp(config);
		await new Promise<void>((resolve) => {
			const server = app.listen(0, '127.0.0.1', () => {
				const addr = server.address();
				if (addr && typeof addr === 'object') {
					baseUrl = `http://127.0.0.1:${addr.port}`;
				}
				resolve();
			});
		});
	});

	it('serves healthz without auth', async () => {
		const res = await fetch(`${baseUrl}/v1/healthz`);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe('ok');
	});

	it('rejects MCP POST without token', async () => {
		const res = await fetch(`${baseUrl}/v1`, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				jsonrpc: '2.0',
				id: 1,
				method: 'initialize',
				params: {
					protocolVersion: '2025-11-25',
					capabilities: {},
					clientInfo: { name: 'test', version: '0.0.0' },
				},
			}),
		});
		expect(res.status).toBe(401);
	});

	it('bundled catalog matches manifest size', () => {
		const catalog = loadCatalog();
		expect(catalog.components.length).toBe(catalog.manifest.componentCount);
		expect(catalog.themes.length).toBeGreaterThan(10);
	});
});
