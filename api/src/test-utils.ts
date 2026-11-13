import type pg from 'pg';
import { createApp, type AppDeps } from './app.js';
import type { Config } from './config.js';
import type { GitHubClient, GitHubUser } from './auth/github.js';
import { runMigrations } from './db/migrate.js';

let testDbSetupChain: Promise<void> = Promise.resolve();

export const testConfig: Config = {
	githubClientId: 'test-client-id',
	githubClientSecret: 'test-client-secret',
	sessionSecret: 'test-session-secret-min-32-chars-long',
	databaseUrl: process.env.DATABASE_URL ?? 'postgres://bareframe:bareframe@127.0.0.1:54329/bareframe',
	publicUrl: 'https://bareframe.org',
	designerPublicUrl: 'https://designer.bareframe.org',
	port: 0,
	nodeEnv: 'test',
	renderWorkerSecret: 'test-render-worker-secret',
	llmAdapter: 'fixture',
	llmBaseUrl: null,
	llmApiKey: null,
	llmModel: null,
	packageMonthlyLimit: 20,
	packageRateLimitPerHour: 100,
	stripeSecretKey: null,
	stripePriceId: null,
	stripeWebhookSecret: null,
	figmaAccessToken: null,
	githubInstallAppSlug: null,
};

export async function setupTestDb(pool: pg.Pool): Promise<void> {
	const run = async () => {
		await pool.query('DROP TABLE IF EXISTS capture_events CASCADE');
		await pool.query('DROP TABLE IF EXISTS capture_flow_state CASCADE');
		await pool.query('DROP TABLE IF EXISTS recording_steps CASCADE');
		await pool.query('DROP TABLE IF EXISTS recordings CASCADE');
		await pool.query('DROP TABLE IF EXISTS audit_findings CASCADE');
		await pool.query('DROP TABLE IF EXISTS flow_map_jobs CASCADE');
		await pool.query('DROP TABLE IF EXISTS render_jobs CASCADE');
		await pool.query('DROP TABLE IF EXISTS project_revisions CASCADE');
		await pool.query('DROP TABLE IF EXISTS project_api_tokens CASCADE');
		await pool.query('DROP TABLE IF EXISTS project_assets CASCADE');
		await pool.query('DROP TABLE IF EXISTS projects CASCADE');
		await pool.query('DROP TABLE IF EXISTS package_generation_jobs CASCADE');
		await pool.query('DROP TABLE IF EXISTS product_packages CASCADE');
    await pool.query('DROP TABLE IF EXISTS url_check_log CASCADE');
    await pool.query('DROP TABLE IF EXISTS review_runs CASCADE');
    await pool.query('DROP TABLE IF EXISTS user_plan_usage CASCADE');
		await pool.query('DROP TABLE IF EXISTS sessions CASCADE');
		await pool.query('DROP TABLE IF EXISTS users CASCADE');
		await pool.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
		await runMigrations(pool);
	};
	testDbSetupChain = testDbSetupChain.then(run, run);
	await testDbSetupChain;
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
