import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { createHttpApp } from './app.js';
import { resetRateLimitBucketsForTests } from './rate-limit.js';

describe('MCP healthz Host header', () => {
	let port = 0;
	let serverClose: (() => void) | undefined;

	beforeAll(async () => {
		resetRateLimitBucketsForTests();
		process.env.PORT = '0';
		process.env.BAREFRAME_MCP_BASE_PATH = '/mcp';
		process.env.BAREFRAME_MCP_ALLOWED_HOSTS = 'bareframe.org';
		const config = loadConfig();
		const app = createHttpApp(config);
		await new Promise<void>((resolve) => {
			const server = app.listen(0, '127.0.0.1', () => {
				const addr = server.address();
				if (addr && typeof addr === 'object') {
					port = addr.port;
				}
				serverClose = () => server.close();
				resolve();
			});
		});
	});

	afterAll(() => {
		serverClose?.();
	});

	it('returns 200 on /mcp/healthz with an arbitrary Host header', async () => {
		const res = await fetch(`http://127.0.0.1:${port}/mcp/healthz`, {
			headers: { Host: '10.42.0.99:8080' },
		});
		expect(res.status).toBe(200);
		expect(await res.text()).toBe('ok');
	});

	it('still rejects disallowed Host on the MCP endpoint', async () => {
		const res = await fetch(`http://127.0.0.1:${port}/mcp`, {
			method: 'GET',
			headers: { Host: '10.42.0.99:8080' },
		});
		expect(res.status).toBe(403);
	});
});
