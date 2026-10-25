import { serve } from '@hono/node-server';
import { loadConfig } from './config.js';
import { createPool } from './db/index.js';
import { runMigrations } from './db/migrate.js';
import { createGitHubClient } from './auth/github.js';
import { createApp } from './app.js';

async function main() {
	const config = loadConfig();
	const pool = createPool(config);
	await runMigrations(pool);

	const github = createGitHubClient(
		config.githubClientId,
		config.githubClientSecret,
	);
	const app = createApp({ config, pool, github });

	serve({ fetch: app.fetch, port: config.port }, (info) => {
		console.log(`bareframe-api listening on :${info.port}`);
	});
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
