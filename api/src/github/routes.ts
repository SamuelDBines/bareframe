import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import {
	createGitHubApi,
	detectEntryFiles,
	GITHUB_INSTALL_LIST_SCOPES,
} from '../auth/github.js';
import { createProjectAuthMiddleware, getActor } from '../projects/auth.js';

const INSTALL_SCOPES = GITHUB_INSTALL_LIST_SCOPES.split(' ');

export function createGitHubInstallRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();
	router.use('*', auth);

	async function loadToken(userId: number): Promise<string | null> {
		const { rows } = await pool.query<{ github_oauth_access_token: string | null }>(
			`SELECT github_oauth_access_token FROM users WHERE id = $1`,
			[userId],
		);
		return rows[0]?.github_oauth_access_token ?? null;
	}

	router.get('/github/install/status', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
		const { rows } = await pool.query<{
			github_oauth_access_token: string | null;
			github_oauth_scopes: string | null;
			github_oauth_updated_at: Date | null;
		}>(
			`SELECT github_oauth_access_token, github_oauth_scopes, github_oauth_updated_at FROM users WHERE id = $1`,
			[actor.userId],
		);
		const row = rows[0];
		const scopes = (row?.github_oauth_scopes ?? '').split(/[\s,]+/).filter(Boolean);
		const hasRepo = scopes.includes('repo');
		const appSlug = process.env.GITHUB_INSTALL_APP_SLUG?.trim() ?? null;
		return c.json({
			oauthConnected: Boolean(row?.github_oauth_access_token),
			scopes,
			canListRepos: hasRepo,
			canOpenPullRequest: Boolean(appSlug),
			githubAppInstallUrl: appSlug ? `https://github.com/apps/${appSlug}/installations/new` : null,
			updatedAt: row?.github_oauth_updated_at?.toISOString() ?? null,
			requiredScopesForListing: INSTALL_SCOPES,
		});
	});

	router.get('/github/repos', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
		const token = await loadToken(actor.userId);
		if (!token) {
			return c.json(
				{
					error: 'github_not_connected',
					message: 'Authorize GitHub with repo read access to list repositories.',
				},
				403,
			);
		}
		const q = c.req.query('q') ?? '';
		const page = Number(c.req.query('page') ?? '1') || 1;
		try {
			const api = createGitHubApi(token);
			const repos = await api.listRepos(q, page);
			return c.json({ repos });
		} catch (err) {
			console.error('github repos', err);
			return c.json({ error: 'github_api_error', message: 'Could not list repositories.' }, 502);
		}
	});

	router.get('/github/repos/:owner/:repo/branches', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
		const token = await loadToken(actor.userId);
		if (!token) {
			return c.json({ error: 'github_not_connected', message: 'Connect GitHub first.' }, 403);
		}
		const owner = c.req.param('owner');
		const repo = c.req.param('repo');
		try {
			const api = createGitHubApi(token);
			const branches = await api.listBranches(owner, repo);
			return c.json({ branches });
		} catch (err) {
			console.error('github branches', err);
			return c.json({ error: 'github_api_error', message: 'Could not list branches.' }, 502);
		}
	});

	router.get('/github/repos/:owner/:repo/entry-files', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
		const token = await loadToken(actor.userId);
		if (!token) {
			return c.json({ error: 'github_not_connected', message: 'Connect GitHub first.' }, 403);
		}
		const owner = c.req.param('owner');
		const repo = c.req.param('repo');
		const ref = c.req.query('ref') ?? undefined;
		try {
			const api = createGitHubApi(token);
			const files = await detectEntryFiles(api, owner, repo, ref);
			return c.json({ files });
		} catch (err) {
			console.error('github entry-files', err);
			return c.json({ error: 'github_api_error', message: 'Could not detect entry files.' }, 502);
		}
	});

	return router;
}
