import { loadMigrateConfig } from './config.js';
import { createPoolFromDatabaseUrl } from './db/pool.js';
import { runMigrations } from './db/migrate.js';

async function main() {
	const { databaseUrl } = loadMigrateConfig();
	const pool = createPoolFromDatabaseUrl(databaseUrl);
	try {
		await runMigrations(pool);
		console.log('bareframe-api migrations applied');
	} finally {
		await pool.end();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
