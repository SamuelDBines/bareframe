import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '@bareframe/react';
import { AppPage, AppPageHeader } from '../../app/AppUi';

const PLANS = [
	{
		name: 'Free',
		price: '£0',
		blurb: 'Try journey mapping and AI review on one project.',
		features: ['1 project', 'Up to 10 screens', '3 AI reviews / month', 'Public share links'],
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
		<AppPage>
			<AppPageHeader
				title="Pricing"
				lead="One product: journey canvas plus AI UX review. Upgrade inside the app when you are ready for Pro."
			/>
			<div className="app-pricing-grid">
				{PLANS.map((plan) => (
					<Card
						key={plan.name}
						variant={plan.highlight ? 'elevated' : 'outlined'}
						title={plan.name}
						className={`app-pricing-card${plan.highlight ? ' app-pricing-card--pro' : ''}`}
					>
						{plan.highlight ? <Badge variant="success">Recommended</Badge> : null}
						<p className="app-pricing-price">
							{plan.price}
							<span style={{ fontSize: '0.9rem', fontWeight: 500 }}>/mo</span>
						</p>
						<p>{plan.blurb}</p>
						<ul className="app-pricing-features">
							{plan.features.map((f) => (
								<li key={f}>{f}</li>
							))}
						</ul>
						<Link to={plan.to} className="app-hero-cta">
							<Button variant={plan.highlight ? 'primary' : 'secondary'}>{plan.cta}</Button>
						</Link>
					</Card>
				))}
			</div>
			<p className="app-muted-block">
				<Link to="/">← Back to home</Link>
			</p>
		</AppPage>
	);
}
