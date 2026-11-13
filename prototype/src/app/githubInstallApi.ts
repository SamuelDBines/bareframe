async function parseJson<T>(res: Response): Promise<T> {
	if (!res.ok) {
		const data = (await res.json().catch(() => ({}))) as { message?: string };
		throw new Error(data.message ?? res.statusText);
	}
	return (await res.json()) as T;
}

export type GitHubInstallStatus = {
	oauthConnected: boolean;
	scopes: string[];
	canListRepos: boolean;
	canOpenPullRequest: boolean;
	githubAppInstallUrl: string | null;
	updatedAt: string | null;
	requiredScopesForListing: string[];
};

export async function fetchGitHubInstallStatus() {
	return parseJson<GitHubInstallStatus>(
		await fetch('/api/github/install/status', { credentials: 'include' }),
	);
}

export type GitHubRepoSummary = {
	id: number;
	fullName: string;
	private: boolean;
	defaultBranch: string;
	htmlUrl: string;
};

export async function fetchGitHubRepos(q = '') {
	return parseJson<{ repos: GitHubRepoSummary[] }>(
		await fetch(`/api/github/repos?q=${encodeURIComponent(q)}`, { credentials: 'include' }),
	);
}

export async function fetchGitHubBranches(owner: string, repo: string) {
	return parseJson<{ branches: { name: string; protected: boolean }[] }>(
		await fetch(`/api/github/repos/${owner}/${repo}/branches`, { credentials: 'include' }),
	);
}

export async function fetchGitHubEntryFiles(owner: string, repo: string, ref?: string) {
	const refQ = ref ? `?ref=${encodeURIComponent(ref)}` : '';
	return parseJson<{ files: string[] }>(
		await fetch(`/api/github/repos/${owner}/${repo}/entry-files${refQ}`, { credentials: 'include' }),
	);
}

export function githubInstallAuthorizeUrl(returnTo: string): string {
	return `/api/auth/github/install?returnTo=${encodeURIComponent(returnTo)}`;
}
