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

export function githubAuthorizeUrl(
	clientId: string,
	redirectUri: string,
	state: string,
): string {
	const params = new URLSearchParams({
		client_id: clientId,
		redirect_uri: redirectUri,
		scope: 'read:user user:email',
		state,
	});
	return `https://github.com/login/oauth/authorize?${params}`;
}
