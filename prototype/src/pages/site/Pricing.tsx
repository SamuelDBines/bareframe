import { Link } from 'react-router-dom';

const PLANS = [
	{
		name: 'Free',
		price: '£0',
		blurb: 'Try journey mapping and AI review on one project.',
		features: [
			'1 project',
			'Up to 10 screens',
			'3 AI reviews / month',
			'Public share links',
		],
		cta: 'Start free',
		to: '/sign-up',
	},
	{
		name: 'Bareframe Pro',
		price: '£20',
		blurb: 'For teams shipping journeys every week.',
		features: [
			'Unlimited projects',
			'50 AI reviews / month',
			'URL import & private canvases',
			'Export & MCP studio tools',
		],
		highlight: true,
		cta: 'Upgrade in app',
		to: '/app',
	},
];

export function PricingPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Pricing</h1>
				<p className="lead">
					One product: journey canvas plus AI UX review. Stripe checkout activates when{' '}
					<code>STRIPE_SECRET_KEY</code> and <code>STRIPE_PRICE_ID</code> are configured on the server.
				</p>
			</div>
			<div className="grid-2" style={{ maxWidth: 880, margin: '0 auto' }}>
				{PLANS.map((plan) => (
					<article
						key={plan.name}
						className="card"
						style={
							plan.highlight
								? {
										borderColor: 'var(--bf-theme-button-primary-bg)',
										boxShadow:
											'0 12px 40px color-mix(in srgb, var(--bf-theme-button-primary-bg) 15%, transparent)',
									}
								: undefined
						}
					>
						{plan.highlight && <span className="badge-pill success">Pro</span>}
						<h3 style={{ marginTop: '0.5rem' }}>{plan.name}</h3>
						<p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--bf-theme-text-1)' }}>
							{plan.price}
							<span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/mo</span>
						</p>
						<p>{plan.blurb}</p>
						<ul style={{ paddingLeft: '1.1rem', color: 'var(--bf-theme-text-2)' }}>
							{plan.features.map((f) => (
								<li key={f}>{f}</li>
							))}
						</ul>
						<Link to={plan.to} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
							{plan.cta}
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
