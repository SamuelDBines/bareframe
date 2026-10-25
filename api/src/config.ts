export type Config = {
	githubClientId: string;
	githubClientSecret: string;
	sessionSecret: string;
	databaseUrl: string;
	publicUrl: string;
	port: number;
	nodeEnv: string;
};

function required(name: string): string {
	const v = process.env[name];
	if (!v) throw new Error(`Missing required environment variable: ${name}`);
	return v;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
	return {
		githubClientId: required('GITHUB_CLIENT_ID'),
		githubClientSecret: required('GITHUB_CLIENT_SECRET'),
		sessionSecret: required('SESSION_SECRET'),
		databaseUrl: required('DATABASE_URL'),
		publicUrl: (env.PUBLIC_URL ?? 'http://localhost:8080').replace(/\/$/, ''),
		port: Number(env.PORT ?? 8080),
		nodeEnv: env.NODE_ENV ?? 'development',
	};
}

/** Migrations only need a database URL (e.g. Kubernetes Job). */
export function loadMigrateConfig(env: NodeJS.ProcessEnv = process.env): {
	databaseUrl: string;
} {
	return { databaseUrl: required('DATABASE_URL') };
}
