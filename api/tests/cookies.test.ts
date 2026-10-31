import pg from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GitHubClient } from '../src/auth/github.js';
import { OAUTH_STATE_COOKIE, SESSION_COOKIE } from '../src/auth/cookies.js';
import {
	createTestApp,
	mockGitHubUser,
	setupTestDb,
	testConfig,
} from '../src/test-utils.js';
import { cookieHeaderFromResponse, setCookieLines } from './helpers.js';

describe('cookie security and headers', () => {
	const pool = new pg.Pool({ connectionString: testConfig.databaseUrl });
	const github: GitHubClient = {
		exchangeCode: vi.fn(async () => 'token'),
		fetchUser: vi.fn(async () => mockGitHubUser()),
	};

	beforeAll(async () => {
		await setupTestDb(pool);
	});

	beforeEach(async () => {
		await setupTestDb(pool);
	});

	afterAll(async () => {
		await pool.end();
	});

	it('sets Secure on OAuth and session cookies when PUBLIC_URL is https', async () => {
		const app = createTestApp(pool, github, {
			...testConfig,
			publicUrl: 'https://bareframe.org',
		});

		const start = await app.request('http://internal/api/auth/github');
		const oauthHeaders = setCookieLines(start);
		expect(
			oauthHeaders.some((h) => h.includes(OAUTH_STATE_COOKIE) && h.includes('Secure')),
		).toBe(true);

		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
		const callback = await app.request(
			`http://internal/api/auth/github/callback?code=ok&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: cookieHeaderFromResponse(start) } },
		);
		const callbackCookies = setCookieLines(callback);
		expect(
			callbackCookies.some((h) => h.includes(SESSION_COOKIE) && h.includes('Secure')),
		).toBe(true);
	});

	it('sends oauth clear and session set on successful callback', async () => {
		const app = createTestApp(pool, github);

		const start = await app.request('http://internal/api/auth/github');
		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
		const callback = await app.request(
			`http://internal/api/auth/github/callback?code=ok&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: cookieHeaderFromResponse(start) } },
		);

		const raw = setCookieLines(callback);
		expect(raw.length).toBeGreaterThanOrEqual(2);
		const names = raw.map((h) => h.split('=')[0]);
		expect(names).toContain(OAUTH_STATE_COOKIE);
		expect(names).toContain(SESSION_COOKIE);
		const oauthClear = raw.find((h) => h.startsWith(`${OAUTH_STATE_COOKIE}=`));
		expect(oauthClear).toMatch(/Max-Age=0/);
	});

	it('ignores malformed cookie values without 500', async () => {
		const app = createTestApp(pool, github);
		const res = await app.request('/api/me', {
			headers: { Cookie: `${SESSION_COOKIE}=%E0%A4%A` },
		});
		expect(res.status).toBe(200);
		const body = await res.json();
		expect(body.user).toBeNull();
	});
});
