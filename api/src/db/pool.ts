import pg from 'pg';

/** Map libpq-style sslmode in DATABASE_URL to node-pg `ssl` options. */
export function poolConfigFromDatabaseUrl(databaseUrl: string): pg.PoolConfig {
	const config: pg.PoolConfig = { connectionString: databaseUrl };

	try {
		const normalized = databaseUrl.replace(/^postgresql:/i, 'postgres:');
		const url = new URL(normalized);
		const sslmode = url.searchParams.get('sslmode')?.toLowerCase();

		if (sslmode === 'disable') {
			config.ssl = false;
		} else if (
			sslmode === 'require' ||
			sslmode === 'verify-ca' ||
			sslmode === 'verify-full'
		) {
			config.ssl = { rejectUnauthorized: sslmode !== 'require' };
		}
	} catch {
		/* use driver defaults */
	}

	return config;
}

export function createPoolFromDatabaseUrl(databaseUrl: string): pg.Pool {
	return new pg.Pool(poolConfigFromDatabaseUrl(databaseUrl));
}
