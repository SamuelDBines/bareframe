import express from 'express';
import { createMcpExpressApp } from '@modelcontextprotocol/sdk/server/express.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { authenticateRequest } from './auth.js';
import type { Config } from './config.js';
import { createBareframeMcpServer, ScopeError } from './create-server.js';
import type { McpScope } from './types.js';

function normalizeBasePath(basePath: string): string {
	const trimmed = basePath.trim();
	if (!trimmed || trimmed === '/') return '';
	return trimmed.startsWith('/') ? trimmed.replace(/\/$/, '') : `/${trimmed.replace(/\/$/, '')}`;
}

export function createHttpApp(config: Config) {
	const base = normalizeBasePath(config.publicBasePath);
	const app = createMcpExpressApp({ host: '0.0.0.0', allowedHosts: config.allowedHosts });

	app.get(`${base}/healthz`, (_req, res) => {
		res.type('text/plain').send('ok');
	});

	const handleMcp = async (
		req: express.Request,
		res: express.Response,
		requiredScopes: McpScope[],
	) => {
		const auth = authenticateRequest(req, config);
		if (!auth.ok) {
			res.status(auth.status).json({ error: auth.message });
			return;
		}

		const missing = requiredScopes.filter((scope) => !auth.scopes.includes(scope));
		if (missing.length > 0) {
			res.status(403).json({ error: `Token missing scopes: ${missing.join(', ')}` });
			return;
		}

		const server = createBareframeMcpServer({ scopes: auth.scopes });
		const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

		try {
			await server.connect(transport);
			await transport.handleRequest(req, res, req.body);
			res.on('close', () => {
				transport.close();
				server.close();
			});
		} catch (err) {
			if (err instanceof ScopeError) {
				if (!res.headersSent) res.status(403).json({ error: err.message });
				return;
			}
			console.error('MCP request failed', err);
			if (!res.headersSent) {
				res.status(500).json({
					jsonrpc: '2.0',
					error: { code: -32603, message: 'Internal server error' },
					id: null,
				});
			}
		}
	};

	app.post(`${base}`, (req, res) => {
		void handleMcp(req, res, []);
	});

	app.get(`${base}`, (_req, res) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	app.delete(`${base}`, (_req, res) => {
		res.status(405).json({
			jsonrpc: '2.0',
			error: { code: -32000, message: 'Method not allowed.' },
			id: null,
		});
	});

	return app;
}
