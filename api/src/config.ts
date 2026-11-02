export type Config = {
	githubClientId: string;
	githubClientSecret: string;
	sessionSecret: string;
	databaseUrl: string;
	publicUrl: string;
	designerPublicUrl: string;
	port: number;
	nodeEnv: string;
	renderWorkerSecret: string;
	llmAdapter: 'openai_compatible' | 'fixture' | 'disabled';
	llmBaseUrl: string | null;
	llmApiKey: string | null;
	llmModel: string | null;
	packageMonthlyLimit: number;
	packageRateLimitPerHour: number;
	stripeSecretKey: string | null;
	stripePriceId: string | null;
};

function required(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing required environment variable: ${name}`);
	return v;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
	const llmKey = env.LLM_API_KEY ?? null;
	const llmBase = env.LLM_API_BASE_URL ?? env.OPENAI_BASE_URL ?? null;
	const llmModel = env.LLM_MODEL ?? env.OPENAI_MODEL ?? null;
	let llmAdapter: Config['llmAdapter'] = 'disabled';
	if (env.LLM_ADAPTER === 'fixture' || env.NODE_ENV === 'test') {
		llmAdapter = 'fixture';
	} else if (llmKey && llmBase && llmModel) {
		llmAdapter = 'openai_compatible';
	}

	return {
		githubClientId: required('GITHUB_CLIENT_ID'),
		githubClientSecret: required('GITHUB_CLIENT_SECRET'),
		sessionSecret: required('SESSION_SECRET'),
		databaseUrl: required('DATABASE_URL'),
		publicUrl: (env.PUBLIC_URL ?? 'http://localhost:8080').replace(/\/$/, ''),
		designerPublicUrl: (env.DESIGNER_PUBLIC_URL ?? 'https://designer.bareframe.org').replace(
			/\/$/,
			'',
		),
		port: Number(env.PORT ?? 8080),
		nodeEnv: env.NODE_ENV ?? 'development',
		renderWorkerSecret: env.RENDER_WORKER_SECRET ?? 'dev-render-worker-secret',
		llmAdapter,
		llmBaseUrl: llmBase,
		llmApiKey: llmKey,
		llmModel: llmModel,
		packageMonthlyLimit: Number(env.PACKAGE_MONTHLY_LIMIT ?? 10),
		packageRateLimitPerHour: Number(env.PACKAGE_RATE_LIMIT_PER_HOUR ?? 5),
		stripeSecretKey: env.STRIPE_SECRET_KEY ?? null,
		stripePriceId: env.STRIPE_PRICE_ID ?? null,
	};
}

/** Migrations only need a database URL (e.g. Kubernetes Job). */
export function loadMigrateConfig(env: NodeJS.ProcessEnv = process.env): {
	databaseUrl: string;
} {
	return { databaseUrl: required('DATABASE_URL') };
}
