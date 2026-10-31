import type { TokenRecord } from './types.js';

export type Config = {
	port: number;
	publicBasePath: string;
	allowedHosts: string[];
	tokens: TokenRecord[];
};

function parseTokens(raw: string | undefined): TokenRecord[] {
	if (!raw?.trim()) return [];
	try {
		const parsed = JSON.parse(raw) as TokenRecord[];
		if (!Array.isArray(parsed)) throw new Error('expected array');
		return parsed.filter((t) => t.token && Array.isArray(t.scopes));
	} catch (err) {
		console.error('Invalid BAREFRAME_MCP_TOKENS JSON', err);
		return [];
	}
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
	const allowedHosts = (env.BAREFRAME_MCP_ALLOWED_HOSTS ?? 'mcp.bareframe.dev,localhost,127.0.0.1')
		.split(',')
		.map((h) => h.trim())
		.filter(Boolean);

	return {
		port: Number(env.PORT ?? 8080),
		publicBasePath: env.BAREFRAME_MCP_BASE_PATH ?? '/v1',
		allowedHosts,
		tokens: parseTokens(env.BAREFRAME_MCP_TOKENS),
	};
}
