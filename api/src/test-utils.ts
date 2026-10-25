import type pg from 'pg';
import { createApp, type AppDeps } from './app.js';
import type { Config } from './config.js';
import type { GitHubClient, GitHubUser } from './auth/github.js';
import { runMigrations } from './db/migrate.js';

export const testConfig: Config = {
	githubClientId: 'test-client-id',
	githubClientSecret: 'test-client-secret',
	sessionSecret: 'test-session-secret-min-32-chars-long',
	databaseUrl: process.env.DATABASE_URL ?? 'postgres://bareframe:bareframe@127.0.0.1:54329/bareframe',
	publicUrl: 'https://bareframe.org',
	port: 0,
	nodeEnv: 'test',
};

export async function setupTestDb(pool: pg.Pool): Promise<void> {
	await pool.query('DROP TABLE IF EXISTS sessions CASCADE');
	await pool.query('DROP TABLE IF EXISTS users CASCADE');
	await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
	await runMigrations(pool);
}

export function createTestApp(
	pool: pg.Pool,
	github: GitHubClient,
	config: Config = testConfig,
) {
	return createApp({ config, pool, github });
}

export function mockGitHubUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
	return {
		id: 424242,
		login: 'octocat',
		name: 'The Octocat',
		avatar_url: 'https://avatars.githubusercontent.com/u/583231',
		email: 'octocat@github.com',
		...overrides,
	};
}
