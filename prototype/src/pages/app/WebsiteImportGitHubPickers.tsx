import { useCallback, useEffect, useMemo, useState } from 'react';
import { friendlyError } from '../../app/apiError';
import {
	fetchGitHubBranches,
	fetchGitHubEntryFiles,
	fetchGitHubInstallStatus,
	fetchGitHubRepos,
	githubInstallAuthorizeUrl,
	type GitHubRepoSummary,
} from '../../app/githubInstallApi';

type Props = {
	repo: string;
	branch: string;
	filePath: string;
	onRepoChange: (fullName: string, defaultBranch: string) => void;
	onBranchChange: (branch: string) => void;
	onFilePathChange: (path: string) => void;
	returnTo: string;
};

export function WebsiteImportGitHubPickers({
	repo,
	branch,
	filePath,
	onRepoChange,
	onBranchChange,
	onFilePathChange,
	returnTo,
}: Props) {
	const [installStatus, setInstallStatus] = useState<Awaited<ReturnType<typeof fetchGitHubInstallStatus>> | null>(
		null,
	);
	const [repoQuery, setRepoQuery] = useState(repo);
	const [repos, setRepos] = useState<GitHubRepoSummary[]>([]);
	const [branches, setBranches] = useState<{ name: string }[]>([]);
	const [entryFiles, setEntryFiles] = useState<string[]>([]);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [owner, name] = useMemo(() => {
		const parts = repo.split('/');
		return [parts[0] ?? '', parts[1] ?? ''];
	}, [repo]);

	const refreshInstallStatus = useCallback(async () => {
		try {
			const status = await fetchGitHubInstallStatus();
			setInstallStatus(status);
		} catch (e) {
			setError(friendlyError(e, 'Could not load GitHub status.'));
		}
	}, []);

	useEffect(() => {
		void refreshInstallStatus();
	}, [refreshInstallStatus]);

	useEffect(() => {
		if (!installStatus?.canListRepos) return;
		let cancelled = false;
		const timer = window.setTimeout(() => {
			setBusy(true);
			void fetchGitHubRepos(repoQuery)
				.then((r) => {
					if (!cancelled) setRepos(r.repos);
				})
				.catch((e) => {
					if (!cancelled) setError(friendlyError(e, 'Could not list repositories.'));
				})
				.finally(() => {
					if (!cancelled) setBusy(false);
				});
		}, 250);
		return () => {
			cancelled = true;
			window.clearTimeout(timer);
		};
	}, [installStatus?.canListRepos, repoQuery]);

	useEffect(() => {
		if (!owner || !name) {
			setBranches([]);
			setEntryFiles([]);
			return;
		}
		let cancelled = false;
		void fetchGitHubBranches(owner, name)
			.then((r) => {
				if (!cancelled) setBranches(r.branches);
			})
			.catch(() => {
				if (!cancelled) setBranches([]);
			});
		return () => {
			cancelled = true;
		};
	}, [owner, name]);

	useEffect(() => {
		if (!owner || !name || !branch) return;
		let cancelled = false;
		void fetchGitHubEntryFiles(owner, name, branch)
			.then((r) => {
				if (!cancelled) {
					setEntryFiles(r.files);
					if (!filePath || !r.files.includes(filePath)) {
						onFilePathChange(r.files[0] ?? 'index.html');
					}
				}
			})
			.catch(() => {
				if (!cancelled) setEntryFiles(['index.html']);
			});
		return () => {
			cancelled = true;
		};
	}, [owner, name, branch, filePath, onFilePathChange]);

	if (!installStatus) {
		return <p className="bx-hint">Loading GitHub connection…</p>;
	}

	if (!installStatus.oauthConnected || !installStatus.canListRepos) {
		return (
			<div className="website-import__github-connect">
				<p>
					Sign-in uses GitHub for identity only. To pick repositories, authorize{' '}
					<code>repo</code> read access (lists your repos; does not open pull requests by itself).
				</p>
				<p className="bx-hint">
					Opening a real install PR needs the Bareframe GitHub App with{' '}
					<code>contents:write</code> and <code>pull_requests:write</code> on the target repo.
				</p>
				<a className="btn btn-primary" href={githubInstallAuthorizeUrl(returnTo)}>
					Connect GitHub for repo access
				</a>
			</div>
		);
	}

	return (
		<div className="website-import__github-pickers" data-testid="github-pickers">
			{error ? (
				<div className="bx-notice bx-notice--warn" role="alert">
					<p>{error}</p>
				</div>
			) : null}
			<label className="bx-field">
				<span className="bx-label">Repository</span>
				<input
					className="bx-input"
					value={repoQuery}
					onChange={(e) => setRepoQuery(e.target.value)}
					placeholder="Search your repositories…"
					list="github-repo-options"
					autoComplete="off"
				/>
				<datalist id="github-repo-options">
					{repos.map((r) => (
						<option key={r.id} value={r.fullName}>
							{r.private ? 'private' : 'public'}
						</option>
					))}
				</datalist>
			</label>
			<label className="bx-field">
				<span className="bx-label">Selected repository</span>
				<select
					className="bx-input"
					value={repo}
					onChange={(e) => {
						const picked = repos.find((r) => r.fullName === e.target.value);
						if (picked) onRepoChange(picked.fullName, picked.defaultBranch);
					}}
				>
					<option value="">Select a repository…</option>
					{repos.map((r) => (
						<option key={r.id} value={r.fullName}>
							{r.fullName}
						</option>
					))}
				</select>
			</label>
			<label className="bx-field">
				<span className="bx-label">Base branch</span>
				<select
					className="bx-input"
					value={branch}
					disabled={!repo}
					onChange={(e) => onBranchChange(e.target.value)}
				>
					{branches.length ? null : <option value={branch}>{branch}</option>}
					{branches.map((b) => (
						<option key={b.name} value={b.name}>
							{b.name}
						</option>
					))}
				</select>
			</label>
			<label className="bx-field">
				<span className="bx-label">HTML / layout entry file</span>
				<select
					className="bx-input"
					value={filePath}
					disabled={!repo}
					onChange={(e) => onFilePathChange(e.target.value)}
				>
					{entryFiles.map((f) => (
						<option key={f} value={f}>
							{f}
						</option>
					))}
				</select>
			</label>
			{installStatus.githubAppInstallUrl ? (
				<p className="bx-hint">
					Need an automatic PR?{' '}
					<a href={installStatus.githubAppInstallUrl} target="_blank" rel="noreferrer">
						Install the Bareframe GitHub App
					</a>{' '}
					on this repository ({installStatus.canOpenPullRequest ? 'connected' : 'required for writes'}).
				</p>
			) : null}
			{busy ? <p className="bx-hint">Searching repositories…</p> : null}
		</div>
	);
}
