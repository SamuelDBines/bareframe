import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createBareframeMcpServer } from './create-server.js';

const scopes = (process.env.BAREFRAME_MCP_STDIO_SCOPES ?? 'components:read,themes:read')
	.split(',')
	.map((s) => s.trim())
	.filter(Boolean) as ('components:read' | 'themes:read' | 'designer:write')[];

async function main() {
	const server = createBareframeMcpServer({ scopes });
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
