import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { friendlyError } from '../../app/apiError';
import { createFlowMap, fetchPlan, importSitemap, startProCheckout } from '../../app/reviewApi';
import {
	fetchWebsiteCaptureStatus,
	previewInstallPr,
	setupWebsiteCapture,
	type WebsiteCaptureSetup,
	type WebsiteCaptureStatus,
} from '../../app/websiteCaptureApi';
import { fetchProject } from '../../designer/projectApi';
import { buildCaptureSnippet, looksLikeWebsiteUrl } from './websiteImportUtils';

export function WebsiteCaptureSetupPage() {
	const { projectId = '' } = useParams<{ projectId: string }>();
	const [search] = useSearchParams();
	const navigate = useNavigate();
	const websiteUrl = search.get('url') ?? '';

	const [planTier, setPlanTier] = useState<'free' | 'pro' | null>(null);
	const [projectVersion, setProjectVersion] = useState(1);
	const [setup, setSetup] = useState<WebsiteCaptureSetup | null>(null);
	const [status, setStatus] = useState<WebsiteCaptureStatus | null>(null);
	const [screenshots, setScreenshots] = useState(true);
	const [repo, setRepo] = useState('');
	const [branch, setBranch] = useState('main');
	const [filePath, setFilePath] = useState('src/index.html');
	const [prPreview, setPrPreview] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const scriptOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bareframe.org';

	const snippet = useMemo(() => {
		if (!setup) return '';
		return buildCaptureSnippet({
			origin: scriptOrigin,
			token: setup.token,
			endpoint: setup.ingestUrl,
			screenshots,
		});
	}, [setup, screenshots, scriptOrigin]);

	const refreshStatus = useCallback(async () => {
		if (!projectId) return;
		const s = await fetchWebsiteCaptureStatus(projectId);
		setStatus(s);
	}, [projectId]);

	useEffect(() => {
		if (!projectId || !looksLikeWebsiteUrl(websiteUrl)) return;
		let cancelled = false;
		(async () => {
			try {
				const [plan, project] = await Promise.all([fetchPlan(), fetchProject(projectId)]);
				if (cancelled) return;
				setPlanTier(plan.tier === 'pro' ? 'pro' : 'free');
				setProjectVersion(project.version);
			} catch (e) {
				if (!cancelled) setError(friendlyError(e, 'Could not load project.'));
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [projectId, websiteUrl]);

	useEffect(() => {
		if (!projectId) return;
		const id = window.setInterval(() => {
			void refreshStatus().catch(() => undefined);
		}, 8000);
		void refreshStatus().catch(() => undefined);
		return () => window.clearInterval(id);
	}, [projectId, refreshStatus]);

	async function issueToken() {
		if (!looksLikeWebsiteUrl(websiteUrl)) return;
		setBusy(true);
		setError(null);
		try {
			const created = await setupWebsiteCapture(projectId, websiteUrl);
			setSetup(created);
			setNotice('Capture token issued. Copy the script now — the token is shown once.');
			await refreshStatus();
		} catch (e) {
			setError(friendlyError(e, 'Could not create capture token.'));
		} finally {
			setBusy(false);
		}
	}

	async function runPublicCrawl() {
		if (planTier !== 'pro') return;
		setBusy(true);
		setError(null);
		try {
			await createFlowMap(projectId, websiteUrl, projectVersion);
			navigate(`/app/project/${projectId}`);
		} catch (e) {
			setError(friendlyError(e, 'Public crawl failed.'));
		} finally {
			setBusy(false);
		}
	}

	async function runSitemap() {
		if (planTier !== 'pro') return;
		setBusy(true);
		setError(null);
		try {
			await importSitemap(projectId, websiteUrl, projectVersion);
			navigate(`/app/project/${projectId}`);
		} catch (e) {
			setError(friendlyError(e, 'Sitemap import failed.'));
		} finally {
			setBusy(false);
		}
	}

	async function previewPr() {
		if (!snippet.trim()) return;
		setBusy(true);
		setError(null);
		setPrPreview(null);
		try {
			const preview = await previewInstallPr(projectId, {
				repo: repo.trim(),
				branch: branch.trim(),
				filePath: filePath.trim(),
				snippetHtml: snippet,
			});
			setPrPreview(
				`${preview.message}\n\nRepo: ${preview.repo} @ ${preview.baseBranch}\nRequired GitHub scopes: ${preview.requiredGitHubScopes.join(', ')}\nGitHub App connected: ${preview.githubAppConnected ? 'yes' : 'no'}\n\n${preview.files[0]?.patch ?? ''}`,
			);
		} catch (e) {
			setError(friendlyError(e, 'Could not build PR preview.'));
		} finally {
			setBusy(false);
		}
	}

	if (!looksLikeWebsiteUrl(websiteUrl)) {
		return (
			<div className="bx-page app-home">
				<p className="bx-notice bx-notice--warn">Missing or invalid website URL.</p>
				<Link to="/app">← Projects</Link>
			</div>
		);
	}

	const connected = (status?.eventCount ?? 0) > 0;
	const hasScreens = (status?.screenshotCount ?? 0) > 0;

	return (
		<div className="bx-page website-setup" data-testid="website-capture-setup">
			<header className="website-setup__head">
				<div>
					<p className="bx-eyebrow">Website import</p>
					<h1>{new URL(websiteUrl).hostname}</h1>
					<p className="lead">
						Pick how Bareframe learns your product. <strong>Installed capture</strong> records navigation from
						your app (optional screenshots, redacted fields). <strong>Public crawl</strong> and{' '}
						<strong>sitemap</strong> run on our servers and stay on Pro.
					</p>
				</div>
				<Link className="btn btn-secondary" to={`/app/project/${projectId}`}>
					Open flow map
				</Link>
			</header>

			<div className="website-setup__grid">
				<section className="card website-setup__panel">
					<h2>1 · Installed capture (recommended)</h2>
					<p>
						Ingestion-only token, bound to <code>{new URL(websiteUrl).origin}</code>. Safe to embed in your
						site — not a GitHub or admin secret.
					</p>
					<label className="field">
						<span>
							<input
								type="checkbox"
								checked={screenshots}
								onChange={(e) => setScreenshots(e.target.checked)}
							/>{' '}
							Include opt-in page screenshots (JPEG, sensitive fields redacted)
						</span>
					</label>
					<button type="button" className="btn btn-primary" disabled={busy || Boolean(setup)} onClick={() => void issueToken()}>
						{setup ? 'Token issued' : 'Generate capture token & script'}
					</button>
					{setup ? (
						<>
							<p className="bx-hint">
								Token prefix <code>{setup.tokenPrefix}</code> · scopes: {setup.scopes.join(', ')}
							</p>
							<pre className="website-setup__snippet" data-testid="capture-snippet">
								{snippet}
							</pre>
						</>
					) : null}
					<div className="website-setup__status" role="status" data-testid="capture-status">
						{connected ? (
							<p>
								<strong>Connected.</strong> {status?.distinctUrlCount ?? 0} URLs seen
								{hasScreens ? ` · ${status?.screenshotCount} with screenshots` : ' · metadata only so far'}.
							</p>
						) : (
							<p>
								<strong>Waiting for first event.</strong> Install the script, then navigate your staging or
								production app.
							</p>
						)}
					</div>
				</section>

				<section className="card website-setup__panel">
					<h2>2 · Optional: preview GitHub install PR</h2>
					<p>
						Bareframe sign-in uses GitHub OAuth for your account only — it does <strong>not</strong> write to
						repositories yet. Preview shows what a future PR would change after you authorize a GitHub App with{' '}
						<code>contents:write</code> and <code>pull_requests:write</code>.
					</p>
					<label className="field">
						<span>Repository (owner/name)</span>
						<input value={repo} onChange={(e) => setRepo(e.target.value)} placeholder="your-org/your-app" />
					</label>
					<label className="field">
						<span>Base branch</span>
						<input value={branch} onChange={(e) => setBranch(e.target.value)} />
					</label>
					<label className="field">
						<span>HTML file to patch</span>
						<input value={filePath} onChange={(e) => setFilePath(e.target.value)} />
					</label>
					<button
						type="button"
						className="btn btn-secondary"
						disabled={busy || !repo.trim() || !snippet}
						onClick={() => void previewPr()}
					>
						Preview install PR (simulation)
					</button>
					{prPreview ? <pre className="website-setup__preview">{prPreview}</pre> : null}
				</section>

				<section className="card website-setup__panel">
					<h2>Server-side imports (Pro)</h2>
					<p className="bx-hint">
						No install required — Bareframe fetches public pages from our infrastructure (SSRF-safe).
					</p>
					<div className="website-setup__pro-actions">
						<button
							type="button"
							className="btn btn-secondary"
							disabled={busy || planTier !== 'pro'}
							onClick={() => void runPublicCrawl()}
						>
							Public crawl + screenshots
						</button>
						<button
							type="button"
							className="btn btn-ghost"
							disabled={busy || planTier !== 'pro'}
							onClick={() => void runSitemap()}
						>
							Sitemap structure only
						</button>
					</div>
					{planTier === 'free' ? (
						<div className="bx-notice bx-notice--accent" role="status">
							<p>
								<strong>Public crawl and sitemap stay on Pro.</strong> Installed capture works on the free plan
								for your own site.
							</p>
							<button type="button" className="btn btn-secondary btn-sm" onClick={() => void startProCheckout().then((r) => {
								if (r.checkoutUrl) window.location.href = r.checkoutUrl;
							})}>
								Upgrade to Pro
							</button>
						</div>
					) : null}
				</section>
			</div>

			{notice ? <p className="bx-hint">{notice}</p> : null}
			{error ? (
				<div className="bx-notice bx-notice--warn" role="alert">
					<p>{error}</p>
				</div>
			) : null}
		</div>
	);
}
