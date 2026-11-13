import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { friendlyError } from '../../app/apiError';
import { fetchPlan, openBillingPortal, startProCheckout } from '../../app/reviewApi';
import { githubSignInUrl, useAuth } from '../../auth/AuthContext';
import { listProjects, type ApiProjectSummary } from '../../designer/projectApi';
import { githubAuthReturnTo } from '../../sites/urls';
import { NewProjectDialog, type StartKind } from './NewProjectDialog';

function EmptyMapArt() {
	return (
		<div className="empty-art" aria-hidden>
			<i className="empty-art__card" />
			<span className="empty-art__line" />
			<i className="empty-art__card empty-art__card--accent">
				<b>+</b>
			</i>
			<span className="empty-art__line" />
			<i className="empty-art__card empty-art__card--ghost" />
		</div>
	);
}

function formatUpdated(iso?: string) {
	if (!iso) return null;
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return null;
	return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

export function AppHomePage() {
	const { status } = useAuth();
	const [projects, setProjects] = useState<ApiProjectSummary[] | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [planTier, setPlanTier] = useState<'free' | 'pro' | null>(null);
	const [dialog, setDialog] = useState<StartKind | null>(null);
	const [notice, setNotice] = useState<string | null>(null);

	useEffect(() => {
		if (status !== 'authenticated') return;
		listProjects()
			.then((rows) => setProjects(rows))
			.catch((e) => {
				setProjects([]);
				setLoadError(friendlyError(e, 'We couldn’t load your projects.'));
			});
		fetchPlan()
			.then((p) => setPlanTier(p.tier === 'pro' ? 'pro' : 'free'))
			.catch(() => setPlanTier(null));
	}, [status]);

	async function upgrade() {
		try {
			const r = await startProCheckout();
			if (r.checkoutUrl) window.location.href = r.checkoutUrl;
			else setNotice(r.message ?? 'Checkout isn’t available right now.');
		} catch (e) {
			setNotice(friendlyError(e, 'Checkout isn’t available right now.'));
		}
	}

	async function manageBilling() {
		try {
			const r = await openBillingPortal();
			if (r.portalUrl) window.location.href = r.portalUrl;
			else setNotice(r.message ?? 'Billing portal isn’t available right now.');
		} catch (e) {
			setNotice(friendlyError(e, 'Billing portal isn’t available right now.'));
		}
	}

	if (status === 'loading') {
		return (
			<div className="bx-page app-home" aria-busy="true">
				<div className="app-home__skeleton" />
			</div>
		);
	}

	if (status !== 'authenticated') {
		return (
			<div className="bx-page app-home">
				<section className="app-empty" data-testid="app-signed-out">
					<EmptyMapArt />
					<h1>Map your first user flow</h1>
					<p>
						Sign in to save projects, import from Figma and run AI reviews. Or look around the example project
						first — no account needed.
					</p>
					<div className="app-empty__actions">
						{status === 'unavailable' ? (
							<button type="button" className="btn btn-primary btn-lg" disabled aria-describedby="signin-paused">
								Sign in with GitHub
							</button>
						) : (
							<a className="btn btn-primary btn-lg" href={githubSignInUrl(githubAuthReturnTo('/app'))}>
								Sign in with GitHub
							</a>
						)}
						<Link to="/demo/journey-review" className="btn btn-secondary btn-lg">
							Explore the example
						</Link>
					</div>
					{status === 'unavailable' ? (
						<p id="signin-paused" className="bx-hint app-empty__hint">
							Sign-in is unavailable right now. Please try again in a few minutes.
						</p>
					) : null}
				</section>
			</div>
		);
	}

	const list = projects ?? [];

	return (
		<div className="bx-page app-home">
			<header className="app-home__head">
				<div>
					<h1>Projects</h1>
					<p>One canvas per project. Map the flow, review it, share it.</p>
				</div>
				<div className="app-home__actions">
					{planTier === 'free' ? (
						<button
							type="button"
							className="btn btn-secondary"
							data-testid="app-upgrade-pro"
							onClick={() => void upgrade()}
						>
							Upgrade to Pro · £20/mo
						</button>
					) : planTier === 'pro' ? (
						<button
							type="button"
							className="btn btn-secondary"
							onClick={() => void manageBilling()}
							data-testid="manage-billing"
						>
							Manage billing
						</button>
					) : null}
					<button type="button" className="btn btn-primary" onClick={() => setDialog('figma')} data-testid="new-project">
						New project
					</button>
				</div>
			</header>

			{planTier === 'free' ? (
				<div
					className="bx-notice bx-notice--accent"
					role="status"
					data-testid="free-plan-capabilities"
					style={{ marginBottom: '1.25rem' }}
				>
					<span className="bx-notice__icon" aria-hidden>
						↗
					</span>
					<p>
						<strong>Live website import on Free:</strong> choose <strong>New project → Live website</strong>, then{' '}
						<strong>installed capture</strong> (add our script to your site).{' '}
						<strong>Public server crawl</strong> and <strong>sitemap import</strong> stay on Pro.
					</p>
				</div>
			) : null}

			{notice ? (
				<div className="bx-notice" role="status" data-testid="upgrade-unavailable-notice" style={{ marginBottom: '1.5rem' }}>
					<span className="bx-notice__icon" aria-hidden>
						i
					</span>
					<p>{notice}</p>
				</div>
			) : null}

			{loadError ? (
				<div className="bx-notice bx-notice--warn" role="alert" style={{ marginBottom: '1.5rem' }}>
					<span className="bx-notice__icon" aria-hidden>
						!
					</span>
					<p>{loadError}</p>
				</div>
			) : null}

			{projects === null ? (
				<div className="project-grid" aria-busy="true">
					<div className="project-card project-card--skeleton" />
					<div className="project-card project-card--skeleton" />
					<div className="project-card project-card--skeleton" />
				</div>
			) : list.length === 0 ? (
				<section className="app-empty app-empty--inline">
					<EmptyMapArt />
					<h2>Create your first flow map</h2>
					<p>Start from a Figma file, a short brief, a live website or a sitemap.</p>
					<div className="start-quick">
						<button type="button" className="start-quick__btn" onClick={() => setDialog('figma')}>
							<span className="start-option__icon start-option__icon--figma" aria-hidden>
								F
							</span>
							Import from Figma
						</button>
						<button type="button" className="start-quick__btn" onClick={() => setDialog('brief')}>
							<span className="start-option__icon start-option__icon--brief" aria-hidden>
								✎
							</span>
							Start from a brief
						</button>
						<button type="button" className="start-quick__btn" onClick={() => setDialog('url')}>
							<span className="start-option__icon start-option__icon--url" aria-hidden>
								↗
							</span>
							Import a website
						</button>
						<button type="button" className="start-quick__btn" onClick={() => setDialog('sitemap')} data-testid="import-sitemap">
							<span className="start-option__icon start-option__icon--sitemap" aria-hidden>
								☰
							</span>
							Import sitemap
						</button>
					</div>
				</section>
			) : (
				<ul className="project-grid">
					{list.map((p) => (
						<li key={p.id}>
							<Link to={`/app/project/${p.id}`} className="project-card">
								<span className="project-card__thumb" aria-hidden>
									<i />
									<span />
									<i />
									<span />
									<i />
								</span>
								<span className="project-card__name">{p.name}</span>
								{formatUpdated(p.updatedAt) ? (
									<span className="project-card__meta">Edited {formatUpdated(p.updatedAt)}</span>
								) : null}
							</Link>
						</li>
					))}
					<li>
						<button type="button" className="project-card project-card--new" onClick={() => setDialog('figma')}>
							<span aria-hidden>+</span>
							New project
						</button>
					</li>
				</ul>
			)}

			{dialog ? <NewProjectDialog initial={dialog} planTier={planTier} onClose={() => setDialog(null)} /> : null}
		</div>
	);
}
