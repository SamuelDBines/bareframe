export type Config = {
	port: number;
	publicBasePath: string;
	allowedHosts: string[];
	rateLimitWindowMs: number;
	rateLimitMax: number;
};

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
	const allowedHosts = (env.BAREFRAME_MCP_ALLOWED_HOSTS ?? 'bareframe.org,localhost,127.0.0.1')
		.split(',')
		.map((h) => h.trim())
		.filter(Boolean);

	return {
		port: Number(env.PORT ?? 8080),
		publicBasePath: env.BAREFRAME_MCP_BASE_PATH ?? '/mcp',
		allowedHosts,
		rateLimitWindowMs: Number(env.BAREFRAME_MCP_RATE_WINDOW_MS ?? 60_000),
		rateLimitMax: Number(env.BAREFRAME_MCP_RATE_MAX ?? 120),
	};
};
