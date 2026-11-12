import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
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
import {
	buildCaptureSnippet,
	buildPrivacyNoticeSnippet,
	looksLikeWebsiteUrl,
} from './websiteImportUtils';
import {
	loadWizardState,
	maxStepForMethod,
	saveWizardState,
	WIZARD_STEPS,
	type WebsiteImportMethod,
	type WebsiteImportWizardState,
} from './websiteImportWizardState';
import { WebsiteImportGitHubPickers } from './WebsiteImportGitHubPickers';

export function WebsiteCaptureSetupPage() {
	const { projectId = '' } = useParams<{ projectId: string }>();
	const [search] = useSearchParams();
	const websiteUrl = search.get('url') ?? '';

	const [wizard, setWizard] = useState<WebsiteImportWizardState>(() => loadWizardState(projectId));
	const [planTier, setPlanTier] = useState<'free' | 'pro' | null>(null);
	const [projectVersion, setProjectVersion] = useState(1);
	const [setup, setSetup] = useState<WebsiteCaptureSetup | null>(null);
	const [status, setStatus] = useState<WebsiteCaptureStatus | null>(null);
	const [prPreview, setPrPreview] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	const scriptOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://bareframe.org';
	const hostname = useMemo(() => {
		try {
			return new URL(websiteUrl).hostname;
		} catch {
			return 'your site';
		}
	}, [websiteUrl]);

	const snippets = useMemo(() => {
		if (!setup) return { script: '', privacy: buildPrivacyNoticeSnippet(hostname) };
		return {
			script: buildCaptureSnippet({
				origin: scriptOrigin,
				token: setup.token,
				endpoint: setup.ingestUrl,
				screenshots: wizard.screenshots,
			}),
			privacy: buildPrivacyNoticeSnippet(hostname),
		};
	}, [setup, wizard.screenshots, scriptOrigin, hostname]);

	const persistWizard = useCallback(
		(next: WebsiteImportWizardState) => {
			setWizard(next);
			saveWizardState(projectId, next);
		},
		[projectId],
	);

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
			persistWizard({ ...wizard, tokenIssued: true });
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
			persistWizard({ ...wizard, step: WIZARD_STEPS.length - 1 });
			await refreshStatus();
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
			persistWizard({ ...wizard, step: WIZARD_STEPS.length - 1 });
			await refreshStatus();
		} catch (e) {
			setError(friendlyError(e, 'Sitemap import failed.'));
		} finally {
			setBusy(false);
		}
	}

	async function previewPr() {
		if (!snippets.script.trim()) return;
		setBusy(true);
		setError(null);
		setPrPreview(null);
		try {
			const preview = await previewInstallPr(projectId, {
				repo: wizard.repo.trim(),
				branch: wizard.branch.trim(),
				filePath: wizard.filePath.trim(),
				snippetHtml: snippets.script,
			});
			setPrPreview(
				`${preview.message}\n\nRepo: ${preview.repo} @ ${preview.baseBranch}\nSimulated: ${preview.simulated ? 'yes' : 'no'}\nGitHub App connected: ${preview.githubAppConnected ? 'yes' : 'no'}\n\n${preview.files[0]?.patch ?? ''}`,
			);
		} catch (e) {
			setError(friendlyError(e, 'Could not build PR preview.'));
		} finally {
			setBusy(false);
		}
	}

	function selectMethod(method: WebsiteImportMethod) {
		persistWizard({ ...wizard, method, step: 1 });
	}

	function goBack() {
		persistWizard({ ...wizard, step: Math.max(0, wizard.step - 1) });
	}

	function goNext() {
		const cap = maxStepForMethod(wizard.method);
		persistWizard({ ...wizard, step: Math.min(cap, wizard.step + 1) });
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
	const step = wizard.step;
	const returnTo = `/app/project/${projectId}/website-setup?url=${encodeURIComponent(websiteUrl)}`;

	const canContinueStep1 =
		wizard.method === 'capture'
			? wizard.privacyAcknowledged
			: wizard.method === 'github-pr'
				? Boolean(wizard.repo.trim() && wizard.branch.trim() && wizard.filePath.trim())
				: wizard.method === 'server-crawl' || wizard.method === 'server-sitemap'
					? planTier === 'pro'
					: false;

	return (
		<div className="bx-page bx-page--narrow website-import" data-testid="website-capture-setup">
			<header className="website-import__head">
				<div>
					<p className="bx-eyebrow">Website import</p>
					<h1>{hostname}</h1>
					<p className="lead">
						Step through capture, optional GitHub install, or server-side Pro imports. Progress is saved in this
						browser session.
					</p>
				</div>
			</header>

			<nav className="website-import__stepper" aria-label="Website import progress" data-testid="import-stepper">
				<ol>
					{WIZARD_STEPS.map((label, index) => (
						<li
							key={label}
							className={
								index < step ? 'is-done' : index === step ? 'is-active' : undefined
							}
							aria-current={index === step ? 'step' : undefined}
						>
							<span className="website-import__step-num">{index + 1}</span>
							<span className="website-import__step-label">{label}</span>
						</li>
					))}
				</ol>
			</nav>

			<div className="card website-import__panel" data-testid={`import-step-${step}`}>
				{step === 0 ? (
					<>
						<h2>Choose how Bareframe learns your product</h2>
						<ul className="website-import__methods">
							<li>
								<button
									type="button"
									className={`website-import__method${wizard.method === 'capture' ? ' is-selected' : ''}`}
									onClick={() => selectMethod('capture')}
								>
									<strong>Installed capture</strong>
									<span>Recommended · navigation events on your domain, optional masked screenshots</span>
								</button>
							</li>
							<li>
								<button
									type="button"
									className={`website-import__method${wizard.method === 'github-pr' ? ' is-selected' : ''}`}
									onClick={() => selectMethod('github-pr')}
								>
									<strong>GitHub install PR</strong>
									<span>Pick a repo, branch, and entry file — preview (or open) a script PR</span>
								</button>
							</li>
							<li>
								<button
									type="button"
									className={`website-import__method${wizard.method === 'server-crawl' ? ' is-selected' : ''}`}
									onClick={() => selectMethod('server-crawl')}
									disabled={planTier === 'free'}
								>
									<strong>Public crawl + screenshots</strong>
									<span>Pro · server-side fetch, no embed</span>
								</button>
							</li>
							<li>
								<button
									type="button"
									className={`website-import__method${wizard.method === 'server-sitemap' ? ' is-selected' : ''}`}
									onClick={() => selectMethod('server-sitemap')}
									disabled={planTier === 'free'}
								>
									<strong>Sitemap structure only</strong>
									<span>Pro · fast structure from sitemap.xml</span>
								</button>
							</li>
						</ul>
						{planTier === 'free' ? (
							<div className="bx-notice bx-notice--accent" role="status">
								<p>
									<strong>Server-side crawl and sitemap stay on Pro.</strong> Installed capture works on the free
									plan for sites you control.
								</p>
								<button
									type="button"
									className="btn btn-secondary btn-sm"
									onClick={() =>
										void startProCheckout().then((r) => {
											if (r.checkoutUrl) window.location.href = r.checkoutUrl;
										})
									}
								>
									Upgrade to Pro
								</button>
							</div>
						) : null}
					</>
				) : null}

				{step === 1 && wizard.method === 'capture' ? (
					<>
						<h2>Configure installed capture</h2>
						<p>
							Ingestion-only token bound to <code>{new URL(websiteUrl).origin}</code>. Not a GitHub or admin
							secret.
						</p>
						<label className="website-import__check">
							<input
								type="checkbox"
								checked={wizard.screenshots}
								onChange={(e) => persistWizard({ ...wizard, screenshots: e.target.checked })}
							/>
							<span>Include opt-in page screenshots (JPEG, fields masked client-side before upload)</span>
						</label>
						<label className="website-import__check">
							<input
								type="checkbox"
								checked={wizard.privacyAcknowledged}
								onChange={(e) => persistWizard({ ...wizard, privacyAcknowledged: e.target.checked })}
							/>
							<span>
								I will only enable capture after visitor consent (or on staging / internal users) and understand
								what data is collected.
							</span>
						</label>
						<details className="website-import__privacy">
							<summary>What we capture · privacy defaults</summary>
							<ul>
								<li>Route URL, document title, viewport, link clicks — no keystrokes</li>
								<li>All form values masked; passwords and payment fields never captured</li>
								<li>Script idle until <code>Bareframe.consent(true)</code>; honours DNT / GPC</li>
								<li>No third-party cookies; pseudonymous session id; default 90-day retention</li>
								<li>EU/UK processing on bareframe.org — you remain the controller</li>
							</ul>
							<pre className="website-import__snippet">{snippets.privacy}</pre>
						</details>
					</>
				) : null}

				{step === 1 && wizard.method === 'github-pr' ? (
					<>
						<h2>Configure GitHub install</h2>
						<WebsiteImportGitHubPickers
							repo={wizard.repo}
							branch={wizard.branch}
							filePath={wizard.filePath}
							returnTo={returnTo}
							onRepoChange={(fullName, defaultBranch) =>
								persistWizard({ ...wizard, repo: fullName, branch: defaultBranch || wizard.branch })
							}
							onBranchChange={(b) => persistWizard({ ...wizard, branch: b })}
							onFilePathChange={(p) => persistWizard({ ...wizard, filePath: p })}
						/>
					</>
				) : null}

				{step === 1 && (wizard.method === 'server-crawl' || wizard.method === 'server-sitemap') ? (
					<>
						<h2>Configure server-side import</h2>
						<p className="bx-hint">
							Bareframe fetches public pages from our infrastructure (SSRF-safe). Only URLs on{' '}
							<code>{hostname}</code> are imported.
						</p>
						{wizard.method === 'server-crawl' ? (
							<button type="button" className="btn btn-primary" disabled={busy} onClick={() => void runPublicCrawl()}>
								Run public crawl now
							</button>
						) : (
							<button type="button" className="btn btn-primary" disabled={busy} onClick={() => void runSitemap()}>
								Import sitemap now
							</button>
						)}
					</>
				) : null}

				{step === 2 && wizard.method === 'capture' ? (
					<>
						<h2>Install &amp; verify</h2>
						<button
							type="button"
							className="btn btn-primary"
							disabled={busy || wizard.tokenIssued}
							onClick={() => void issueToken()}
						>
							{wizard.tokenIssued || setup ? 'Token issued' : 'Generate capture token & script'}
						</button>
						{setup ? (
							<>
								<p className="bx-hint">
									Token prefix <code>{setup.tokenPrefix}</code> · scopes: {setup.scopes.join(', ')}
								</p>
								<pre className="website-import__snippet" data-testid="capture-snippet">
									{snippets.script}
								</pre>
							</>
						) : null}
						<div className="website-import__status" role="status" data-testid="capture-status">
							{connected ? (
								<p>
									<strong>Connected.</strong> {status?.distinctUrlCount ?? 0} URLs seen
									{hasScreens
										? ` · ${status?.screenshotCount} with screenshots`
										: ' · metadata only so far'}
									.
								</p>
							) : (
								<p>
									<strong>Waiting for first event.</strong> Install the script, call{' '}
									<code>Bareframe.consent(true)</code> after consent, then navigate your staging or production
									app.
								</p>
							)}
						</div>
					</>
				) : null}

				{step === 2 && wizard.method === 'github-pr' ? (
					<>
						<h2>Preview install pull request</h2>
						<p className="bx-hint">
							{wizard.tokenIssued || setup
								? 'Using your capture script snippet in the patch below.'
								: 'Generate a capture token in the Installed capture path first, or paste will use the template without a live token.'}
						</p>
						<button
							type="button"
							className="btn btn-secondary"
							disabled={busy || !wizard.repo.trim()}
							onClick={() => void previewPr()}
						>
							{setup ? 'Preview install PR' : 'Preview install PR (needs token for live snippet)'}
						</button>
						{!setup ? (
							<button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void issueToken()}>
								Issue capture token for snippet
							</button>
						) : null}
						{prPreview ? <pre className="website-import__snippet">{prPreview}</pre> : null}
					</>
				) : null}

				{step === 2 && (wizard.method === 'server-crawl' || wizard.method === 'server-sitemap') ? (
					<>
						<h2>Review imported pages</h2>
						<p>
							Import requested. Open the flow map to see new structure when processing completes.
						</p>
						<div className="website-import__review-actions">
							<Link className="btn btn-primary" to={`/app/project/${projectId}`}>
								Open flow map
							</Link>
						</div>
					</>
				) : null}

				{step === 3 ? (
					<>
						<h2>Review imported pages</h2>
						<p>
							{connected || (status?.distinctUrlCount ?? 0) > 0 ? (
								<>
									<strong>{status?.distinctUrlCount ?? 0}</strong> distinct URLs captured. Open the flow map to
									arrange screens and connectors.
								</>
							) : (
								<>No pages yet — complete install or server import, then return here.</>
							)}
						</p>
						<div className="website-import__review-actions">
							<Link className="btn btn-primary" to={`/app/project/${projectId}`}>
								Open flow map
							</Link>
							<button type="button" className="btn btn-ghost" onClick={() => void refreshStatus()}>
								Refresh status
							</button>
						</div>
					</>
				) : null}
			</div>

			<footer className="website-import__nav">
				<button type="button" className="btn btn-ghost" disabled={step === 0 || busy} onClick={goBack}>
					Back
				</button>
				<button
					type="button"
					className="btn btn-primary"
					disabled={
						busy ||
						step === 0 ||
						(step === 1 && !canContinueStep1) ||
						step >= maxStepForMethod(wizard.method)
					}
					onClick={goNext}
					data-testid="import-next"
				>
					Next
				</button>
			</footer>

			{notice ? <p className="bx-hint">{notice}</p> : null}
			{error ? (
				<div className="bx-notice bx-notice--warn" role="alert">
					<p>{error}</p>
				</div>
			) : null}
		</div>
	);
}
