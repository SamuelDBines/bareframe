import express from 'express';
import { hostHeaderValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import type { Config } from './config.js';
import { createBareframeMcpServer } from './create-server.js';
import { createRateLimiter } from './rate-limit.js';

function normalizeBasePath(basePath: string): string {
	const trimmed = basePath.trim();
	if (!trimmed || trimmed === '/') return '';
	return trimmed.startsWith('/') ? trimmed.replace(/\/$/, '') : `/${trimmed.replace(/\/$/, '')}`;
}

export function createHttpApp(config: Config) {
	const base = normalizeBasePath(config.publicBasePath);
	const mountPath = base || '/';
	const app = express();
	app.set('trust proxy', true);

	const limiter = createRateLimiter(config);

	// Kubernetes probes hit the pod IP in Host; skip allow-list on health only.
	app.get(`${base}/healthz`, limiter, (_req: Request, res: Response) => {
		res.type('text/plain').send('ok');
	});

	const mcp = express.Router();
	mcp.use(hostHeaderValidation(config.allowedHosts));
	mcp.use(express.json());

	mcp.post('/', limiter, async (req: Request, res: Response) => {
		const server = createBareframeMcpServer();
		const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

		try {
			await server.connect(transport);
			await transport.handleRequest(req, res, req.body);
			res.on('close', () => {
				transport.close();
				server.close();
			});
		} catch (err) {
			console.error('MCP request failed', err);
			if (!res.headersSent) {
				res.status(500).json({
					jsonrpc: '2.0',
					error: { code: -32603, message: 'Internal server error' },
					id: null,
				});
			}
		}
	});

	mcp.get('/', limiter, (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	mcp.delete('/', limiter, (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	app.use(mountPath, mcp);

	return app;
}
