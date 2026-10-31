import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
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
	const app = createMcpExpressApp({ host: '0.0.0.0', allowedHosts: config.allowedHosts });
	app.set('trust proxy', true);

	const limiter = createRateLimiter(config);

	app.get(`${base}/healthz`, limiter, (_req: Request, res: Response) => {
		res.type('text/plain').send('ok');
	});

	app.post(`${base}`, limiter, async (req: Request, res: Response) => {
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

	app.get(`${base}`, limiter, (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	app.delete(`${base}`, limiter, (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	return app;
}
