import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { friendlyError, isAiUnavailable } from '../../app/apiError';
import { importFigmaDesign, importSitemap } from '../../app/reviewApi';
import { fetchPackageConfig, startPackageGeneration } from '../../designer/packageApi';
import { createProject } from '../../designer/projectApi';
import { looksLikeWebsiteUrl, websiteHostname } from './websiteImportUtils';

export type StartKind = 'brief' | 'figma' | 'url' | 'sitemap';

const STARTS: { id: StartKind; title: string; body: string; icon: string }[] = [
	{ id: 'figma', title: 'Figma file', body: 'Frames become screens, prototype links become connectors.', icon: 'F' },
	{ id: 'brief', title: 'Short brief', body: 'Describe the product and we draft the journey for you.', icon: '✎' },
	{ id: 'url', title: 'Live website', body: 'We capture pages and the links between them.', icon: '↗' },
	{ id: 'sitemap', title: 'Sitemap', body: 'Fast structure-only map from sitemap.xml (Pro).', icon: '☰' },
];

type Props = {
	initial?: StartKind;
	planTier: 'free' | 'pro' | null;
	onClose: () => void;
};

export function NewProjectDialog({ initial = 'figma', planTier, onClose }: Props) {
	const navigate = useNavigate();
	const [kind, setKind] = useState<StartKind>(initial);
	const [figmaUrl, setFigmaUrl] = useState('');
	const [figmaToken, setFigmaToken] = useState('');
	const [siteUrl, setSiteUrl] = useState('');
	const [idea, setIdea] = useState('');
	const [audience, setAudience] = useState('');
	const [aiReady, setAiReady] = useState<boolean | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const dialogRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetchPackageConfig()
			.then((c) => setAiReady(Boolean(c.llmConfigured)))
			.catch(() => setAiReady(false));
	}, []);

	useEffect(() => {
		const prev = document.activeElement as HTMLElement | null;
		dialogRef.current?.querySelector<HTMLElement>('[role="radio"][aria-checked="true"]')?.focus();
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !busy) onClose();
		};
		window.addEventListener('keydown', onKey);
		return () => {
			window.removeEventListener('keydown', onKey);
			prev?.focus();
		};
	}, [busy, onClose]);

	const siteUrlValid = looksLikeWebsiteUrl(siteUrl);
	const sitemapRequiresPro = planTier === 'free';
	const canSubmit =
		!busy &&
		((kind === 'figma' && /figma\.com\//.test(figmaUrl)) ||
			(kind === 'url' && siteUrlValid) ||
			(kind === 'sitemap' && !sitemapRequiresPro && siteUrlValid) ||
			(kind === 'brief' && aiReady === true && idea.trim().length > 8));

	async function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!canSubmit) return;
		setBusy(true);
		setError(null);
		try {
			if (kind === 'figma') {
				const p = await createProject('Figma import');
				await importFigmaDesign(p.id, figmaUrl.trim(), p.version, figmaToken.trim() || undefined);
				navigate(`/app/project/${p.id}`);
			} else if (kind === 'url') {
				const url = siteUrl.trim();
				const p = await createProject(websiteHostname(url));
				navigate(`/app/project/${p.id}/website-setup?url=${encodeURIComponent(url)}`);
			} else if (kind === 'sitemap') {
				const url = siteUrl.trim();
				const p = await createProject(`Sitemap: ${new URL(url).hostname}`);
				await importSitemap(p.id, url, p.version);
				navigate(`/app/project/${p.id}`);
			} else {
				const { jobId } = await startPackageGeneration({
					idea: idea.trim(),
					audience: audience.trim() || 'Not specified',
					constraints: [],
					references: [],
					answers: {},
				});
				navigate(`/app/product/generating/${jobId}`);
			}
		} catch (err) {
			if (kind === 'brief' && isAiUnavailable(err)) setAiReady(false);
			setError(friendlyError(err, 'We couldn’t start that project. Please try again.'));
			setBusy(false);
		}
	}

	async function startBlank() {
		setBusy(true);
		setError(null);
		try {
			const p = await createProject('Untitled flow');
			navigate(`/app/project/${p.id}`);
		} catch (err) {
			setError(friendlyError(err, 'We couldn’t create the project. Please try again.'));
			setBusy(false);
		}
	}

	const onRadioKey = (e: React.KeyboardEvent, index: number) => {
		if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].includes(e.key)) return;
		e.preventDefault();
		const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
		const next = STARTS[(index + step + STARTS.length) % STARTS.length]!;
		setKind(next.id);
		dialogRef.current?.querySelector<HTMLElement>(`[data-start="${next.id}"]`)?.focus();
	};

	return (
		<div
			className="bx-dialog-backdrop"
			onMouseDown={(e) => {
				if (e.target === e.currentTarget && !busy) onClose();
			}}
		>
			<div
				ref={dialogRef}
				className="bx-dialog new-project"
				role="dialog"
				aria-modal="true"
				aria-labelledby="new-project-title"
				data-testid="new-project-dialog"
			>
				<div className="bx-dialog__head">
					<div>
						<h2 id="new-project-title">New project</h2>
						<p>Pick a starting point. You’ll land on your flow map.</p>
					</div>
					<button type="button" className="btn btn-ghost btn-icon" aria-label="Close" onClick={onClose}>
						✕
					</button>
				</div>

				<div className="start-options" role="radiogroup" aria-label="Start from">
					{STARTS.map((s, i) => (
						<button
							key={s.id}
							type="button"
							role="radio"
							data-start={s.id}
							aria-checked={kind === s.id}
							tabIndex={kind === s.id ? 0 : -1}
							className="start-option"
							onClick={() => {
								setKind(s.id);
								setError(null);
							}}
							onKeyDown={(e) => onRadioKey(e, i)}
						>
							<span className={`start-option__icon start-option__icon--${s.id}`} aria-hidden>
								{s.icon}
							</span>
							<strong>{s.title}</strong>
							<span>{s.body}</span>
						</button>
					))}
				</div>

				<form className="new-project__form" onSubmit={(e) => void submit(e)}>
					{kind === 'figma' ? (
						<>
							<label className="field">
								<span>Figma file or frame link</span>
								<input
									value={figmaUrl}
									onChange={(e) => setFigmaUrl(e.target.value)}
									placeholder="https://www.figma.com/design/…"
									data-testid="app-figma-url"
									inputMode="url"
								/>
							</label>
							<details className="new-project__more">
								<summary>Use a personal access token</summary>
								<label className="field">
									<span>Figma access token</span>
									<input
										type="password"
										value={figmaToken}
										onChange={(e) => setFigmaToken(e.target.value)}
										placeholder="figd_…"
										autoComplete="off"
									/>
								</label>
								<p className="bx-hint">Only needed if your workspace hasn’t connected Figma yet.</p>
							</details>
						</>
					) : null}

					{kind === 'url' ? (
						<>
							<label className="field">
								<span>Website address</span>
								<input
									value={siteUrl}
									onChange={(e) => setSiteUrl(e.target.value)}
									placeholder="https://yourproduct.com"
									inputMode="url"
									data-testid="app-website-url"
								/>
							</label>
							{siteUrl.trim() && !siteUrlValid ? (
								<p className="bx-hint" role="status">
									Enter a full address starting with https://
								</p>
							) : null}
							{planTier === 'free' ? (
								<div className="bx-notice bx-notice--accent" role="status">
									<span className="bx-notice__icon" aria-hidden>
										★
									</span>
									<p>
										<strong>Public crawl (server screenshots) is Pro.</strong> You can still set up{' '}
										<strong>installed capture</strong> on the free plan — add our script to your site and
										pages flow onto the canvas as you navigate.
									</p>
								</div>
							) : (
								<p className="bx-hint">
									Next: choose installed capture or a Pro server crawl from the setup page.
								</p>
							)}
						</>
					) : null}

					{kind === 'sitemap' ? (
						<>
							<label className="field">
								<span>Website or sitemap URL</span>
								<input
									value={siteUrl}
									onChange={(e) => setSiteUrl(e.target.value)}
									placeholder="https://example.com or https://example.com/sitemap.xml"
									inputMode="url"
									data-testid="app-sitemap-url"
								/>
							</label>
							{sitemapRequiresPro ? (
								<div className="bx-notice bx-notice--accent" role="status">
									<span className="bx-notice__icon" aria-hidden>
										★
									</span>
									<p>
										<strong>Sitemap import is part of Pro.</strong> Start from Figma or a brief on the
										free plan, or upgrade any time from your projects page.
									</p>
								</div>
							) : (
								<p className="bx-hint">
									We map URLs to screens and link parent paths — structure only, no screenshots.
								</p>
							)}
						</>
					) : null}

					{kind === 'brief' ? (
						<>
							<label className="field">
								<span>What are you building?</span>
								<textarea
									rows={3}
									value={idea}
									onChange={(e) => setIdea(e.target.value)}
									placeholder="A booking app for independent barbers, with walk-in queues and reminders."
									disabled={aiReady === false}
								/>
							</label>
							<label className="field">
								<span>
									Who is it for? <em className="bx-hint">Optional</em>
								</span>
								<input
									value={audience}
									onChange={(e) => setAudience(e.target.value)}
									placeholder="Shop owners and their regulars"
									disabled={aiReady === false}
								/>
							</label>
							{aiReady === false ? (
								<div className="bx-notice" role="status" data-testid="brief-unavailable">
									<span className="bx-notice__icon" aria-hidden>
										i
									</span>
									<p>
										<strong>Drafting from a brief is paused for now.</strong> You can still start from a
										Figma file or a blank map.
									</p>
								</div>
							) : null}
						</>
					) : null}

					{error ? (
						<div className="bx-notice bx-notice--warn" role="alert">
							<span className="bx-notice__icon" aria-hidden>
								!
							</span>
							<p>{error}</p>
						</div>
					) : null}

					<div className="bx-dialog__actions new-project__actions">
						<button type="button" className="btn-link" onClick={() => void startBlank()} disabled={busy}>
							Or start with a blank map
						</button>
						<button type="submit" className="btn btn-primary" disabled={!canSubmit}>
							{busy
								? 'Setting up…'
								: kind === 'brief'
									? 'Draft my flow'
									: kind === 'url'
										? 'Continue to website setup'
										: 'Create flow map'}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
