import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { friendlyError } from '../../app/apiError';
import { fetchBillingConfig, fetchPlan } from '../../app/reviewApi';
import { useAuth } from '../../auth/AuthContext';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';

export function AccountSettingsPage() {
	const { user, status } = useAuth();
	const [planTier, setPlanTier] = useState<string | null>(null);
	const [stripeEnabled, setStripeEnabled] = useState<boolean | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (status !== 'authenticated') return;
		Promise.all([fetchPlan(), fetchBillingConfig()])
			.then(([plan, billing]) => {
				setPlanTier(plan.tier === 'pro' ? 'Pro' : 'Free');
				setStripeEnabled(Boolean(billing.stripeEnabled));
			})
			.catch((e) => setError(friendlyError(e, 'Could not load account details.')));
	}, [status]);

	if (status === 'loading') {
		return (
			<div className="bx-page app-home" aria-busy="true">
				<p className="auth-muted">Loading account…</p>
			</div>
		);
	}

	if (status !== 'authenticated' || !user) {
		return (
			<div className="bx-page app-home">
				<h1>Account settings</h1>
				<p>
					<Link to="/sign-in">Sign in</Link> to view account settings.
				</p>
			</div>
		);
	}

	return (
		<div className="bx-page account-settings" data-testid="account-settings-page">
			<header className="app-home__head">
				<div>
					<h1>Account settings</h1>
					<p>Signed in with GitHub. Plan and display preferences for this browser.</p>
				</div>
				<Link to="/app" className="btn btn-secondary">
					← Projects
				</Link>
			</header>

			{error ? (
				<div className="bx-notice bx-notice--warn" role="alert" style={{ marginBottom: '1rem' }}>
					<p>{error}</p>
				</div>
			) : null}

			<div className="account-settings__grid">
				<section className="card">
					<h2>Profile</h2>
					<dl className="account-settings__dl">
						<div>
							<dt>GitHub</dt>
							<dd>{user.login}</dd>
						</div>
						{user.name ? (
							<div>
								<dt>Name</dt>
								<dd>{user.name}</dd>
							</div>
						) : null}
						{user.email ? (
							<div>
								<dt>Email</dt>
								<dd>{user.email}</dd>
							</div>
						) : null}
					</dl>
					<p className="bx-hint">Profile fields come from GitHub and are not editable here.</p>
				</section>

				<section className="card">
					<h2>Plan</h2>
					<p>
						Current plan: <strong data-testid="account-plan-tier">{planTier ?? '…'}</strong>
					</p>
					<p className="bx-hint">
						Upgrades and billing are managed through Bareframe Pro checkout when enabled on this deployment.
						{stripeEnabled === false ? ' Checkout is not configured on the server yet.' : null}
					</p>
					<Link to="/pricing" className="btn btn-secondary btn-sm">
						Compare plans
					</Link>
				</section>

				<section className="card">
					<h2>Appearance</h2>
					<p className="bx-hint">Theme is saved locally in this browser.</p>
					<ThemeSwitcher />
				</section>
			</div>
		</div>
	);
}
