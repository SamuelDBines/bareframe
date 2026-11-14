import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { friendlyError } from '../../app/apiError';
import { fetchBillingConfig, fetchPlan } from '../../app/reviewApi';
import { useAuth } from '../../auth/AuthContext';
import { ThemeSwitcher } from '../../components/ThemeSwitcher';
import {
	createAccountToken,
	listAccountTokens,
	revokeAccountToken,
	type AccountTokenSummary,
} from '../../app/accountApi';

export function AccountSettingsPage() {
	const { user, status } = useAuth();
	const [planTier, setPlanTier] = useState<string | null>(null);
	const [stripeEnabled, setStripeEnabled] = useState<boolean | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [accountTokens, setAccountTokens] = useState<AccountTokenSummary[]>([]);
	const [mintedToken, setMintedToken] = useState<string | null>(null);
	const [tokenBusy, setTokenBusy] = useState(false);

	const studioUrl =
		typeof window !== 'undefined'
			? `${window.location.origin}/mcp/studio`
			: 'https://bareframe.org/mcp/studio';

	useEffect(() => {
		if (status !== 'authenticated') return;
		Promise.all([fetchPlan(), fetchBillingConfig()])
			.then(([plan, billing]) => {
				setPlanTier(plan.tier === 'pro' ? 'Pro' : 'Free');
				setStripeEnabled(Boolean(billing.stripeEnabled));
			})
			.catch((e) => setError(friendlyError(e, 'Could not load account details.')));
		listAccountTokens()
			.then(setAccountTokens)
			.catch(() => undefined);
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

				<section className="card account-settings__mcp" data-testid="account-mcp-tokens">
					<h2>Agent &amp; MCP</h2>
					<p className="bx-hint">
						Account tokens (<code>bf_acc_…</code>) can create projects, generate flows and designs, and mint
						playable share links for studio MCP at <code>/mcp/studio</code>.
					</p>
					<button
						type="button"
						className="btn btn-primary btn-sm"
						disabled={tokenBusy}
						data-testid="create-account-mcp-token"
						onClick={() => {
							setTokenBusy(true);
							void createAccountToken('MCP assistant')
								.then((t) => {
									setMintedToken(t.token);
									return listAccountTokens();
								})
								.then(setAccountTokens)
								.finally(() => setTokenBusy(false));
						}}
					>
						Create MCP token
					</button>
					{mintedToken ? (
						<p className="bx-notice" role="status">
							Copy this token now — it won&apos;t be shown again: <code>{mintedToken}</code>
						</p>
					) : null}
					<h3 style={{ marginTop: '1rem' }}>Cursor / Claude studio config</h3>
					<pre className="code-block" data-testid="account-mcp-snippet">
						{`{
  "mcpServers": {
    "bareframe-studio": {
      "url": "${studioUrl}",
      "headers": {
        "Authorization": "Bearer ${mintedToken ?? 'bf_acc_<paste token>'}"
      }
    }
  }
}`}
					</pre>
					<ul className="account-settings__token-list">
						{accountTokens.map((t) => (
							<li key={t.id}>
								<span>{t.name}</span>
								<code>{t.token_prefix}</code>
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									disabled={tokenBusy || Boolean(t.revoked_at)}
									onClick={() => {
										setTokenBusy(true);
										void revokeAccountToken(t.id)
											.then(() => listAccountTokens())
											.then(setAccountTokens)
											.finally(() => setTokenBusy(false));
									}}
								>
									Revoke
								</button>
							</li>
						))}
					</ul>
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
