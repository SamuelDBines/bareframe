import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const here = path.dirname(fileURLToPath(import.meta.url));

export async function runMigrations(pool: pg.Pool): Promise<void> {
	await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

	const migrationsDir = path.join(here, 'migrations');
	const files = (await readdir(migrationsDir))
		.filter((f) => f.endsWith('.sql'))
		.sort();

	for (const file of files) {
		const version = file.replace(/\.sql$/, '');
		const { rows } = await pool.query<{ version: string }>(
			'SELECT version FROM schema_migrations WHERE version = $1',
			[version],
		);
		if (rows.length > 0) continue;

		const sql = await readFile(path.join(migrationsDir, file), 'utf8');
		const client = await pool.connect();
		try {
			await client.query('BEGIN');
			await client.query(sql);
			await client.query(
				'INSERT INTO schema_migrations (version) VALUES ($1)',
				[version],
			);
			await client.query('COMMIT');
		} catch (err) {
			await client.query('ROLLBACK');
			throw err;
		} finally {
			client.release();
		}
	}
}
