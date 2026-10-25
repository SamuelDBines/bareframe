import { Link } from 'react-router-dom';

const PLANS = [
	{
		name: 'Starter',
		price: '$0',
		blurb: 'For exploring components and themes.',
		features: ['Public component docs', '3 Designer projects', 'Community themes'],
	},
	{
		name: 'Team',
		price: '$29',
		blurb: 'For product teams shipping together.',
		features: ['Private packages', 'Unlimited projects', 'Token export & CI hooks', 'MCP seats'],
		highlight: true,
	},
	{
		name: 'Enterprise',
		price: 'Custom',
		blurb: 'SSO, audit logs, and dedicated support.',
		features: ['Custom SLAs', 'On-prem token registry', 'Design system consulting'],
	},
];

export function PricingPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Pricing</h1>
				<p className="lead">Simple plans for sites, libraries, and designer workspaces.</p>
			</div>
			<div className="grid-3">
				{PLANS.map((plan) => (
					<article
						key={plan.name}
						className="card"
						style={
							plan.highlight
								? {
										borderColor: 'var(--bf-theme-button-primary-bg)',
										boxShadow: '0 12px 40px color-mix(in srgb, var(--bf-theme-button-primary-bg) 15%, transparent)',
									}
								: undefined
						}
					>
						{plan.highlight && <span className="badge-pill success">Popular</span>}
						<h3 style={{ marginTop: '0.5rem' }}>{plan.name}</h3>
						<p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--bf-theme-text-1)' }}>
							{plan.price}
							{plan.price.startsWith('$') && (
								<span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/mo</span>
							)}
						</p>
						<p>{plan.blurb}</p>
						<ul style={{ paddingLeft: '1.1rem', color: 'var(--bf-theme-text-2)' }}>
							{plan.features.map((f) => (
								<li key={f}>{f}</li>
							))}
						</ul>
						<Link to="/sign-up" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
							Choose {plan.name}
						</Link>
					</article>
				))}
			</div>
			<p className="footer-note">
				<Link to="/">← Back to home</Link>
			</p>
		</>
	);
}
