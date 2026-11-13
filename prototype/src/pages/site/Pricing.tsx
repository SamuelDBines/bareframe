import { Link } from 'react-router-dom';
import {
	ACCESSIBILITY_DISCLAIMER,
	PRO_PLAN_NAME,
	PRO_PRICE_DISPLAY,
	PRO_PRICE_LABEL,
} from '../../marketing/offer';
import '../../marketing/marketing.css';

const SALES_HREF = 'mailto:hello@bareframe.org?subject=Bareframe%20Enterprise';

type Plan = {
	id: string;
	name: string;
	blurb: string;
	price: string | null;
	unit?: string;
	note?: string;
	features: string[];
	cta: { label: string; to?: string; href?: string };
	popular?: boolean;
};

const PLANS: Plan[] = [
	{
		id: 'free',
		name: 'Free',
		blurb: 'Your first flow on one canvas.',
		price: '£0',
		unit: '/mo',
		note: 'Free forever',
		features: [
			'1 project, up to 10 screens',
			'3 AI reviews a month',
			'Flow map + findings on the map',
			'Import from Figma',
			'Installed website capture (script on your site)',
			'Click-through prototype link',
		],
		cta: { label: 'Start free', to: '/app' },
	},
	{
		id: 'pro',
		name: PRO_PLAN_NAME,
		blurb: 'For people shipping flows every week.',
		price: PRO_PRICE_DISPLAY,
		unit: '/mo',
		note: 'Billed monthly in GBP',
		features: [
			'Unlimited projects and screens',
			'50 AI reviews a month',
			'Server-side URL crawl and sitemap import',
			'Private canvases, no badge',
			'Export and MCP tools for agents',
		],
		cta: { label: `Get ${PRO_PLAN_NAME}`, to: '/app' },
		popular: true,
	},
];

const FAQ = [
	{
		q: 'What counts as an AI review?',
		a: 'One review is one pass over a whole project. Each pass checks screens and connections and pins findings to the map.',
	},
	{
		q: 'Is this an accessibility audit?',
		a: ACCESSIBILITY_DISCLAIMER,
	},
	{
		q: 'Can I change plans later?',
		a: `Yes. Upgrade to ${PRO_PLAN_NAME} (${PRO_PRICE_LABEL}) from inside the app when checkout is enabled on this deployment.`,
	},
];

export function PricingPage() {
	return (
		<div className="bx-page pricing" data-testid="pricing-page">
			<header className="bx-page-head pricing__head">
				<span className="bx-kicker">Pricing</span>
				<h1>Free to start. One Pro price.</h1>
				<p className="bx-lead">
					Map and review your first flow for free. Pro is {PRO_PRICE_LABEL} — no separate Team tier.
				</p>
			</header>

			<div className="plans plans--two">
				{PLANS.map((plan) => (
					<article
						key={plan.id}
						className={`plan${plan.popular ? ' plan--popular' : ''}`}
						aria-labelledby={`plan-${plan.id}`}
					>
						{plan.popular ? <span className="plan__badge">Popular</span> : null}
						<h2 id={`plan-${plan.id}`} className="plan__name">
							{plan.name}
						</h2>
						<p className="plan__blurb">{plan.blurb}</p>
						<p className="plan__price">
							{plan.price ? (
								<>
									<span className="plan__amount" data-testid={plan.id === 'pro' ? 'plan-pro-amount' : undefined}>
										{plan.price}
									</span>
									<span className="plan__unit">{plan.unit}</span>
								</>
							) : (
								<span className="plan__amount">Custom</span>
							)}
						</p>
						<p className="plan__note">{plan.note}</p>
						{plan.cta.to ? (
							<Link to={plan.cta.to} className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} plan__cta`}>
								{plan.cta.label}
							</Link>
						) : (
							<a href={plan.cta.href} className="btn btn-secondary plan__cta">
								{plan.cta.label}
							</a>
						)}
						<ul className="plan__features">
							{plan.features.map((f) => (
								<li key={f}>{f}</li>
							))}
						</ul>
					</article>
				))}
			</div>

			<p className="pricing__enterprise bx-hint">
				Need SSO, security review or a larger org rollout?{' '}
				<a href={SALES_HREF}>Contact us</a> — we quote separately; there is no self-serve Team plan.
			</p>

			<section className="faq" aria-labelledby="faq-title">
				<h2 id="faq-title">Questions</h2>
				<dl>
					{FAQ.map((item) => (
						<div key={item.q} className="faq__item">
							<dt>{item.q}</dt>
							<dd>{item.a}</dd>
						</div>
					))}
				</dl>
			</section>
		</div>
	);
}
