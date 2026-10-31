import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { loadConfig } from './config.js';
import { createHttpApp } from './app.js';
import { TOOL_NAMES } from './create-server.js';
import { resetRateLimitBucketsForTests } from './rate-limit.js';

describe('Bareframe MCP HTTP integration', () => {
	let baseUrl = '';
	let client: Client;
	let serverClose: (() => void) | undefined;

	beforeAll(async () => {
		resetRateLimitBucketsForTests();
		process.env.PORT = '0';
		process.env.BAREFRAME_MCP_BASE_PATH = '/mcp';
		process.env.BAREFRAME_MCP_RATE_MAX = '10000';
		const config = loadConfig();
		const app = createHttpApp(config);
		await new Promise<void>((resolve) => {
			const server = app.listen(0, '127.0.0.1', () => {
				const addr = server.address();
				if (addr && typeof addr === 'object') {
					baseUrl = `http://127.0.0.1:${addr.port}/mcp`;
				}
				serverClose = () => server.close();
				resolve();
			});
		});

		const transport = new StreamableHTTPClientTransport(new URL(baseUrl));
		client = new Client({ name: 'bareframe-mcp-test', version: '1.0.0' });
		await client.connect(transport);
	});

	afterAll(async () => {
		await client.close();
		serverClose?.();
	});

	it('healthz responds without MCP session', async () => {
		const healthUrl = baseUrl.replace(/\/mcp$/, '/mcp/healthz');
		const res = await fetch(healthUrl);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe('ok');
	});

	it('lists all expected tools', async () => {
		const { tools } = await client.listTools();
		const names = tools.map((t) => t.name).sort();
		expect(names).toEqual([...TOOL_NAMES].sort());
	});

	it('calls every tool successfully', async () => {
		const listResult = await client.callTool({ name: 'list_components', arguments: {} });
		expect(listResult.isError).not.toBe(true);

		const componentResult = await client.callTool({
			name: 'get_component',
			arguments: { slug: 'button' },
		});
		expect(componentResult.isError).not.toBe(true);
		const componentText = JSON.stringify(componentResult.content);
		expect(componentText).toContain('primary-action.example.tsx');
		expect(componentText).toContain('@bareframe/react');

		const themesResult = await client.callTool({ name: 'list_themes', arguments: {} });
		expect(themesResult.isError).not.toBe(true);

		const tokensResult = await client.callTool({ name: 'export_tokens', arguments: {} });
		expect(tokensResult.isError).not.toBe(true);

		const searchResult = await client.callTool({
			name: 'search_docs',
			arguments: { query: 'Migrating' },
		});
		expect(searchResult.isError).not.toBe(true);
		const searchText = JSON.stringify(searchResult.content);
		expect(searchText.toLowerCase()).toContain('repkit');

		const installResult = await client.callTool({ name: 'get_install_steps', arguments: {} });
		expect(installResult.isError).not.toBe(true);
		expect(JSON.stringify(installResult.content)).toContain('@bareframe/react');

		const migrationResult = await client.callTool({
			name: 'get_migration_guide',
			arguments: { format: 'markdown' },
		});
		expect(migrationResult.isError).not.toBe(true);
		expect(JSON.stringify(migrationResult.content)).toContain('@repkit/components');
	});
});
