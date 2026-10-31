import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GitHubClient } from '../src/auth/github.js';
import {
	createTestApp,
	mockGitHubUser,
	setupTestDb,
	testConfig,
} from '../src/test-utils.js';
import { cookieHeaderFromResponse } from './helpers.js';

describe('auth flow', () => {
	const pool = new pg.Pool({ connectionString: testConfig.databaseUrl });
	let github: GitHubClient;
	const exchangeCode = vi.fn(async () => 'gh-access-token');
	const fetchUser = vi.fn(async () => mockGitHubUser());

	beforeAll(async () => {
		await setupTestDb(pool);
	});

	beforeEach(async () => {
		await setupTestDb(pool);
		exchangeCode.mockClear();
		fetchUser.mockClear();
		github = {
			exchangeCode,
			fetchUser,
		};
	});

	afterAll(async () => {
		await pool.end();
	});

	it('rejects OAuth callback when state does not match', async () => {
		const app = createTestApp(pool, github);
		const start = await app.request('/api/auth/github?returnTo=/designer');
		const oauthCookie = cookieHeaderFromResponse(start);
		expect(start.status).toBe(302);

		const callback = await app.request(
			'/api/auth/github/callback?code=abc&state=wrong-state',
			{ headers: { Cookie: oauthCookie } },
		);
		expect(callback.status).toBe(400);
		expect(exchangeCode).not.toHaveBeenCalled();
	});

	it('creates a new user and session on successful callback', async () => {
		const app = createTestApp(pool, github);
		const start = await app.request(
			'/api/auth/github?returnTo=' + encodeURIComponent('/#/designer'),
		);
		const oauthCookie = cookieHeaderFromResponse(start);
		const loc = start.headers.get('location')!;
		const state = new URL(loc).searchParams.get('state')!;

		const callback = await app.request(
			`/api/auth/github/callback?code=good&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: oauthCookie } },
		);
		expect(callback.status).toBe(302);
		expect(callback.headers.get('location')).toBe('https://bareframe.org/#/designer');
		expect(exchangeCode).toHaveBeenCalledOnce();

		const { rows: users } = await pool.query('SELECT * FROM users WHERE github_id = $1', [
			424242,
		]);
		expect(users).toHaveLength(1);
		expect(users[0].login).toBe('octocat');

		const sessionCookie = cookieHeaderFromResponse(callback);
		const me = await app.request('/api/me', { headers: { Cookie: sessionCookie } });
		expect(me.status).toBe(200);
		const body = await me.json();
		expect(body.user.login).toBe('octocat');
	});

	it('updates an existing user on login', async () => {
		await pool.query(
			`INSERT INTO users (github_id, login, name, avatar_url, email) VALUES ($1, $2, $3, $4, $5)`,
			[424242, 'old-login', 'Old', null, 'old@example.com'],
		);
		fetchUser.mockResolvedValueOnce(
			mockGitHubUser({ login: 'octocat', name: 'The Octocat', email: 'octocat@github.com' }),
		);

		const app = createTestApp(pool, github);
		const start = await app.request('/api/auth/github');
		const oauthCookie = cookieHeaderFromResponse(start);
		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;

		await app.request(
			`/api/auth/github/callback?code=good&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: oauthCookie } },
		);

		const { rows } = await pool.query('SELECT login, name FROM users WHERE github_id = $1', [
			424242,
		]);
		expect(rows[0].login).toBe('octocat');
		expect(rows[0].name).toBe('The Octocat');
	});

	it('returns 200 with null user for /api/me without a session cookie', async () => {
		const app = createTestApp(pool, github);
		const res = await app.request('/api/me');
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.user).toBeNull();
	});

	it('logout clears the session', async () => {
		const app = createTestApp(pool, github);
		const start = await app.request('/api/auth/github');
		const oauthCookie = cookieHeaderFromResponse(start);
		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
		const callback = await app.request(
			`/api/auth/github/callback?code=good&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: oauthCookie } },
		);
		const sessionCookie = cookieHeaderFromResponse(callback);

		const logout = await app.request('/api/auth/logout', {
			method: 'POST',
			headers: { Cookie: sessionCookie },
		});
		expect(logout.status).toBe(200);

		const me = await app.request('/api/me', { headers: { Cookie: sessionCookie } });
		expect(me.status).toBe(200);
		const body = await me.json();
		expect(body.user).toBeNull();

		const { rows } = await pool.query('SELECT COUNT(*)::int AS n FROM sessions');
		expect(rows[0].n).toBe(0);
	});

	it('blocks open redirect returnTo on OAuth start', async () => {
		const app = createTestApp(pool, github);
		const start = await app.request(
			'/api/auth/github?returnTo=' + encodeURIComponent('https://evil.example'),
		);
		const oauthCookie = cookieHeaderFromResponse(start);
		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
		const callback = await app.request(
			`/api/auth/github/callback?code=good&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: oauthCookie } },
		);
		expect(callback.headers.get('location')).toBe('https://bareframe.org/');
	});
});
