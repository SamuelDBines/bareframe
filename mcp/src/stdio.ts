import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createBareframeMcpServer } from './create-server.js';

async function main() {
	const server = createBareframeMcpServer();
	const transport = new StdioServerTransport();
	await server.connect(transport);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
