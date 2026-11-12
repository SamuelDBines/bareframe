export type GitHubUser = {
	id: number;
	login: string;
	name: string | null;
	avatar_url: string | null;
	email: string | null;
};

export type GitHubClient = {
	exchangeCode(code: string, redirectUri: string): Promise<string>;
	fetchUser(accessToken: string): Promise<GitHubUser>;
};

type FetchFn = typeof fetch;

export function createGitHubClient(
	clientId: string,
	clientSecret: string,
	fetchImpl: FetchFn = fetch,
): GitHubClient {
	return {
		async exchangeCode(code: string, redirectUri: string): Promise<string> {
			const res = await fetchImpl('https://github.com/login/oauth/access_token', {
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					client_id: clientId,
					client_secret: clientSecret,
					code,
					redirect_uri: redirectUri,
				}),
			});
			if (!res.ok) {
				throw new Error(`GitHub token exchange failed: ${res.status}`);
			}
			const data = (await res.json()) as { access_token?: string; error?: string };
			if (!data.access_token) {
				throw new Error(data.error ?? 'GitHub token exchange missing access_token');
			}
			return data.access_token;
		},

		async fetchUser(accessToken: string): Promise<GitHubUser> {
			const [userRes, emailsRes] = await Promise.all([
				fetchImpl('https://api.github.com/user', {
					headers: {
						Accept: 'application/vnd.github+json',
						Authorization: `Bearer ${accessToken}`,
						'User-Agent': 'bareframe-api',
					},
				}),
				fetchImpl('https://api.github.com/user/emails', {
					headers: {
						Accept: 'application/vnd.github+json',
						Authorization: `Bearer ${accessToken}`,
						'User-Agent': 'bareframe-api',
					},
				}),
			]);

			if (!userRes.ok) {
				throw new Error(`GitHub user fetch failed: ${userRes.status}`);
			}
			const user = (await userRes.json()) as {
				id: number;
				login: string;
				name: string | null;
				avatar_url: string | null;
				email: string | null;
			};

			let email = user.email;
			if (!email && emailsRes.ok) {
				const emails = (await emailsRes.json()) as Array<{
					email: string;
					verified: boolean;
					primary: boolean;
				}>;
				const primary = emails.find((e) => e.primary && e.verified);
				const verified = emails.find((e) => e.verified);
				email = primary?.email ?? verified?.email ?? null;
			}

			return {
				id: user.id,
				login: user.login,
				name: user.name,
				avatar_url: user.avatar_url,
				email,
			};
		},
	};
}

export const GITHUB_SIGNIN_SCOPES = 'read:user user:email';
/** Lists public and private repos the user can access; does not grant write. */
export const GITHUB_INSTALL_LIST_SCOPES = 'read:user user:email repo';

export function githubAuthorizeUrl(
	clientId: string,
	redirectUri: string,
	state: string,
	scope: string = GITHUB_SIGNIN_SCOPES,
): string {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		scope,
		state,
	});
	return `https://github.com/login/oauth/authorize?${params}`;
}

export type GitHubRepoSummary = {
	id: number;
	fullName: string;
	private: boolean;
	defaultBranch: string;
	htmlUrl: string;
};

export type GitHubBranchSummary = {
	name: string;
	protected: boolean;
};

const GH_HEADERS = {
	Accept: 'application/vnd.github+json',
	'User-Agent': 'bareframe-api',
} as const;

export function createGitHubApi(accessToken: string, fetchImpl: FetchFn = fetch) {
	const authHeaders = { ...GH_HEADERS, Authorization: `Bearer ${accessToken}` };

	return {
		async listRepos(search?: string, page = 1): Promise<GitHubRepoSummary[]> {
			const perPage = 30;
			let url = `https://api.github.com/user/repos?sort=updated&per_page=${perPage}&page=${page}&affiliation=owner,collaborator,organization_member`;
			if (search?.trim()) {
				const userRes = await fetchImpl('https://api.github.com/user', { headers: authHeaders });
				if (!userRes.ok) throw new Error(`GitHub user failed: ${userRes.status}`);
				const user = (await userRes.json()) as { login?: string };
				const login = user.login ?? '';
				url = `https://api.github.com/search/repositories?q=${encodeURIComponent(`${search.trim()} in:name user:${login}`)}&per_page=${perPage}&page=${page}`;
			}
			const res = await fetchImpl(url, { headers: authHeaders });
			if (!res.ok) throw new Error(`GitHub repos failed: ${res.status}`);
			const data = (await res.json()) as
				| { items?: Array<Record<string, unknown>> }
				| Array<Record<string, unknown>>;
			const rows = Array.isArray(data) ? data : (data.items ?? []);
			return rows.map((r) => ({
				id: Number(r.id),
				fullName: String(r.full_name ?? ''),
				private: Boolean(r.private),
				defaultBranch: String(r.default_branch ?? 'main'),
				htmlUrl: String(r.html_url ?? ''),
			}));
		},

		async listBranches(owner: string, repo: string): Promise<GitHubBranchSummary[]> {
			const res = await fetchImpl(`https://api.github.com/repos/${owner}/${repo}/branches?per_page=100`, {
				headers: authHeaders,
			});
			if (!res.ok) throw new Error(`GitHub branches failed: ${res.status}`);
			const rows = (await res.json()) as Array<{ name?: string; protected?: boolean }>;
			return rows.map((b) => ({ name: String(b.name ?? ''), protected: Boolean(b.protected) }));
		},

		async fileExists(owner: string, repo: string, path: string, ref?: string): Promise<boolean> {
			const refQ = ref ? `?ref=${encodeURIComponent(ref)}` : '';
			const res = await fetchImpl(
				`https://api.github.com/repos/${owner}/${repo}/contents/${path}${refQ}`,
				{ headers: authHeaders },
			);
			if (res.status === 404) return false;
			if (!res.ok) return false;
			return true;
		},
	};
}

const ENTRY_FILE_CANDIDATES = [
	'index.html',
	'public/index.html',
	'src/index.html',
	'app/index.html',
	'app/layout.tsx',
	'app/layout.jsx',
	'src/app/layout.tsx',
	'src/app/layout.jsx',
];

export async function detectEntryFiles(
	api: ReturnType<typeof createGitHubApi>,
	owner: string,
	repo: string,
	ref?: string,
): Promise<string[]> {
	const found: string[] = [];
	for (const candidate of ENTRY_FILE_CANDIDATES) {
		// eslint-disable-next-line no-await-in-loop
		if (await api.fileExists(owner, repo, candidate, ref)) {
			found.push(candidate);
		}
	}
	return found.length ? found : ['index.html'];
}
