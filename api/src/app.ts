import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from './config.js';
import type { GitHubClient } from './auth/github.js';
import {
	clearOAuthStateCookie,
	clearSessionCookie,
	cookieSettingsFromPublicUrl,
	readOAuthStateCookie,
	readSignedCookie,
	SESSION_COOKIE,
	setOAuthStateCookie,
	setSessionCookie,
} from './auth/cookies.js';
import { randomToken, hashToken } from './auth/crypto.js';
import {
	githubAuthorizeUrl,
	GITHUB_INSTALL_LIST_SCOPES,
	GITHUB_SIGNIN_SCOPES,
} from './auth/github.js';
import { createGitHubInstallRouter } from './github/routes.js';
import { isSafeReturnTo, normalizeReturnTo, resolvePostAuthRedirect } from './auth/returnTo.js';
import {
	createSession,
	deleteExpiredSessions,
	deleteSessionByTokenHash,
	findUserBySessionToken,
	toPublicUser,
	upsertUser,
} from './db/index.js';
import { createProjectsRouter } from './projects/routes.js';
import { createFlowMapRouter } from './flow-map/routes.js';
import { createInternalWorkerRouter } from './internal/routes.js';
import { createPackagesRouter } from './packages/routes.js';
import { createReviewsRouter, createPublicShareRouter } from './reviews/routes.js';
import { createFlowGenerationRouter } from './flow-gen/routes.js';
import { createBillingRouter, registerStripeWebhookRoute } from './billing/routes.js';
import { createFigmaRouter } from './figma/routes.js';
import { createPublicToolsRouter } from './public/check-url.js';
import { createCaptureRouter } from './capture/routes.js';
import { createWebsiteCaptureRouter } from './capture/setup-routes.js';
import { createSitemapRouter } from './sitemap/routes.js';

export type AppDeps = {
	config: Config;
	pool: pg.Pool;
	github: GitHubClient;
};

export function createApp(deps: AppDeps): Hono {
	const { config, pool, github } = deps;
	const cookieSettings = cookieSettingsFromPublicUrl(config.publicUrl);
	const app = new Hono();

	app.get('/api/healthz', (c) => c.text('ok'));

	registerStripeWebhookRoute(app, pool, config);

	app.get('/api/auth/github', (c) => {
		const returnTo = normalizeReturnTo(c.req.query('returnTo'), config.designerPublicUrl);
		const state = randomToken(16);
		setOAuthStateCookie(c, { state, returnTo, purpose: 'signin' }, config.sessionSecret, cookieSettings);

		const redirectUri = `${config.publicUrl}/api/auth/github/callback`;
		const url = githubAuthorizeUrl(config.githubClientId, redirectUri, state, GITHUB_SIGNIN_SCOPES);
		return c.redirect(url, 302);
	});

	app.get('/api/auth/github/install', (c) => {
		const returnTo = normalizeReturnTo(c.req.query('returnTo'), config.designerPublicUrl);
		const state = randomToken(16);
		setOAuthStateCookie(c, { state, returnTo, purpose: 'install' }, config.sessionSecret, cookieSettings);
		const redirectUri = `${config.publicUrl}/api/auth/github/callback`;
		const url = githubAuthorizeUrl(
			config.githubClientId,
			redirectUri,
			state,
			GITHUB_INSTALL_LIST_SCOPES,
		);
		return c.redirect(url, 302);
	});

	app.get('/api/auth/github/callback', async (c) => {
		const code = c.req.query('code');
		const stateParam = c.req.query('state');
		const stored = readOAuthStateCookie(c, config.sessionSecret);

		if (!code || !stateParam || !stored || stored.state !== stateParam) {
			clearOAuthStateCookie(c, cookieSettings);
			return c.text('Invalid OAuth state', 400);
		}

		const returnTo = isSafeReturnTo(stored.returnTo, config.designerPublicUrl)
			? stored.returnTo
			: '/';
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

			if (stored.purpose === 'install') {
				await pool.query(
					`UPDATE users SET github_oauth_access_token = $2, github_oauth_scopes = $3, github_oauth_updated_at = NOW() WHERE id = $1`,
					[user.id, accessToken, GITHUB_INSTALL_LIST_SCOPES],
				);
			}

			const sessionToken = randomToken(32);
			const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
			await createSession(pool, user.id, hashToken(sessionToken), expiresAt);
			await deleteExpiredSessions(pool);
			clearOAuthStateCookie(c, cookieSettings);
			setSessionCookie(c, sessionToken, config.sessionSecret, cookieSettings, true);

			return c.redirect(resolvePostAuthRedirect(config.publicUrl, returnTo), 302);
		} catch (err) {
			console.error('OAuth callback error', err);
			return c.text('Authentication failed', 500);
		}
	});

	app.get('/api/me', async (c) => {
		const token = readSignedCookie(c, SESSION_COOKIE, config.sessionSecret);
		if (!token) return c.json({ user: null });

		const user = await findUserBySessionToken(pool, hashToken(token));
		if (!user) return c.json({ user: null });

		return c.json({ user: toPublicUser(user) });
	});

	app.post('/api/auth/logout', async (c) => {
		const token = readSignedCookie(c, SESSION_COOKIE, config.sessionSecret);
		if (token) {
			await deleteSessionByTokenHash(pool, hashToken(token));
		}
		clearSessionCookie(c, cookieSettings);
		return c.json({ ok: true });
	});

	app.route('/api', createPublicShareRouter(pool));
	app.route('/api', createPublicToolsRouter(pool));
	app.route('/api', createInternalWorkerRouter(pool, config));
	app.route('/api', createProjectsRouter(pool, config));
	app.route('/api', createFlowMapRouter(pool, config));
	app.route('/api', createPackagesRouter(pool, config));
	app.route('/api', createReviewsRouter(pool, config));
	app.route('/api', createFlowGenerationRouter(pool, config));
	app.route('/api', createBillingRouter(pool, config));
	app.route('/api', createFigmaRouter(pool, config));
	app.route('/api', createSitemapRouter(pool, config));
	app.route('/api/v1', createCaptureRouter(pool, config));
	app.route('/api', createWebsiteCaptureRouter(pool, config));
	app.route('/api', createGitHubInstallRouter(pool, config));

	return app;
}
