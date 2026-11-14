import express from 'express';
import { hostHeaderValidation } from '@modelcontextprotocol/sdk/server/middleware/hostHeaderValidation.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import type { Request, Response } from 'express';
import type { Config } from './config.js';
import { createBareframeMcpServer } from './create-server.js';
import { createRateLimiter } from './rate-limit.js';
import { createBareframeStudioMcpServer, createStudioApiClient } from './studio/create-studio-server.js';
import { loadStudioApiBaseUrl } from './studio/api-client.js';
import { createTokenRateLimiter, resetTokenRateLimitBucketsForTests } from './studio/token-rate-limit.js';

export { resetTokenRateLimitBucketsForTests };

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

	const studio = express.Router();
	studio.use(hostHeaderValidation(config.allowedHosts));
	studio.use(express.json({ limit: '2mb' }));
	const tokenLimiter = createTokenRateLimiter({
		max: Number(process.env.BAREFRAME_MCP_STUDIO_RATE_MAX ?? 120),
		windowMs: Number(process.env.BAREFRAME_MCP_STUDIO_RATE_WINDOW_MS ?? 60_000),
	});

	studio.post('/', limiter, async (req: Request, res: Response) => {
		const auth = req.headers.authorization;
		if (!auth?.startsWith('Bearer ')) {
			res.status(401).json({
				jsonrpc: '2.0',
				error: { code: -32001, message: 'Missing Bearer token (bf_acc_… or bf_proj_…)' },
				id: null,
			});
			return;
		}
		const bearer = auth.slice('Bearer '.length).trim();
		const rate = tokenLimiter(bearer.slice(0, 24));
		if (!rate.allowed) {
			res.setHeader('Retry-After', String(Math.ceil((rate.retryAfterMs ?? 1000) / 1000)));
			res.status(429).json({
				jsonrpc: '2.0',
				error: { code: -32029, message: 'Rate limit exceeded' },
				id: null,
			});
			return;
		}

		const api = createStudioApiClient(loadStudioApiBaseUrl(config), bearer);
		const server = createBareframeStudioMcpServer(api);
		const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

		try {
			await server.connect(transport);
			await transport.handleRequest(req, res, req.body);
			res.on('close', () => {
				transport.close();
				server.close();
			});
		} catch (err) {
			console.error('Studio MCP request failed', err);
			if (!res.headersSent) {
				res.status(500).json({
					jsonrpc: '2.0',
					error: { code: -32603, message: 'Internal server error' },
					id: null,
				});
			}
		}
	});

	studio.get('/', limiter, (_req: Request, res: Response) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	app.use(mountPath, mcp);
	app.use(`${mountPath}/studio`, studio);

	return app;
}
