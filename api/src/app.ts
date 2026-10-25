import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from './config.js';
import type { GitHubClient } from './auth/github.js';
import {
	clearOAuthStateCookie,
	clearSessionCookie,
	readOAuthStateCookie,
	readSignedCookie,
	SESSION_COOKIE,
	setOAuthStateCookie,
	setSessionCookie,
} from './auth/cookies.js';
import { randomToken, hashToken } from './auth/crypto.js';
import { githubAuthorizeUrl } from './auth/github.js';
import { isSafeReturnTo, normalizeReturnTo } from './auth/returnTo.js';
import {
	createSession,
	deleteSessionByTokenHash,
	findUserBySessionToken,
	toPublicUser,
	upsertUser,
} from './db/index.js';

export type AppDeps = {
	config: Config;
	pool: pg.Pool;
	github: GitHubClient;
};

export function createApp(deps: AppDeps): Hono {
	const { config, pool, github } = deps;
	const app = new Hono();

	app.get('/api/healthz', (c) => c.text('ok'));

	app.get('/api/auth/github', (c) => {
		const returnTo = normalizeReturnTo(c.req.query('returnTo'));
		const state = randomToken(16);
		setOAuthStateCookie(c, { state, returnTo }, config.sessionSecret);

		const redirectUri = `${config.publicUrl}/api/auth/github/callback`;
		const url = githubAuthorizeUrl(config.githubClientId, redirectUri, state);
		return c.redirect(url, 302);
	});

	app.get('/api/auth/github/callback', async (c) => {
		const code = c.req.query('code');
		const stateParam = c.req.query('state');
		const stored = readOAuthStateCookie(c, config.sessionSecret);
		clearOAuthStateCookie(c);

		if (!code || !stateParam || !stored || stored.state !== stateParam) {
			return c.text('Invalid OAuth state', 400);
		}

		const returnTo = isSafeReturnTo(stored.returnTo) ? stored.returnTo : '/';
		const redirectUri = `${config.publicUrl}/api/auth/github/callback`;

		try {
			const accessToken = await github.exchangeCode(code, redirectUri);
			const ghUser = await github.fetchUser(accessToken);

			const user = await upsertUser(pool, {
				githubId: ghUser.id,
				login: ghUser.login,
				name: ghUser.name,
				avatarUrl: ghUser.avatar_url,
				email: ghUser.email,
			});

			const sessionToken = randomToken(32);
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
			await createSession(pool, user.id, hashToken(sessionToken), expiresAt);
			setSessionCookie(c, sessionToken, config.sessionSecret);

			return c.redirect(`${config.publicUrl}${returnTo}`, 302);
		} catch (err) {
			console.error('OAuth callback error', err);
			return c.text('Authentication failed', 500);
		}
	});

	app.get('/api/me', async (c) => {
		const token = readSignedCookie(c, SESSION_COOKIE, config.sessionSecret);
		if (!token) return c.json({ error: 'unauthorized' }, 401);

		const user = await findUserBySessionToken(pool, hashToken(token));
		if (!user) return c.json({ error: 'unauthorized' }, 401);

		return c.json({ user: toPublicUser(user) });
	});

	app.post('/api/auth/logout', async (c) => {
		const token = readSignedCookie(c, SESSION_COOKIE, config.sessionSecret);
		if (token) {
			await deleteSessionByTokenHash(pool, hashToken(token));
		}
		clearSessionCookie(c);
		return c.json({ ok: true });
	});

	return app;
}
