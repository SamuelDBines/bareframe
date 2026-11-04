import { useState } from 'react';
import { Link } from 'react-router-dom';
import '../../marketing/marketing.css';

/** Placeholder sales inbox — confirm before launch. */
const SALES_HREF = 'mailto:hello@bareframe.org?subject=Bareframe%20Team%20%2F%20Enterprise';

type Billing = 'monthly' | 'yearly';

type Plan = {
	id: string;
	name: string;
	blurb: string;
	price: Record<Billing, string | null>;
	unit?: string;
	note?: Record<Billing, string>;
	features: string[];
	cta: { label: string; to?: string; href?: string };
	popular?: boolean;
};

const PLANS: Plan[] = [
	{
		id: 'free',
		name: 'Free',
		blurb: 'Map and review one flow.',
		price: { monthly: '$0', yearly: '$0' },
		unit: '/mo',
		note: { monthly: 'Free forever', yearly: 'Free forever' },
		features: [
			'1 project, up to 10 screens',
			'3 AI reviews a month',
			'Import from Figma',
			'Click-through prototype link',
			'Bareframe badge on shared prototypes',
		],
		cta: { label: 'Start free', to: '/app' },
	},
	{
		id: 'pro',
		name: 'Pro',
		blurb: 'For designers and PMs shipping every week.',
		price: { monthly: '$39', yearly: '$29' },
		unit: '/mo',
		note: { monthly: 'Billed monthly', yearly: 'Billed yearly ($348)' },
		features: [
			'Unlimited projects and screens',
			'50 AI reviews a month',
			'Import from a live URL',
			'Private canvases, no badge',
			'Export and MCP tools for agents',
		],
		cta: { label: 'Get Pro', to: '/app' },
		popular: true,
	},
	{
		id: 'team',
		name: 'Team',
		blurb: 'For small product teams.',
		price: { monthly: '$99', yearly: '$99' },
		unit: '/mo',
		note: { monthly: 'Includes 3 creators', yearly: 'Includes 3 creators' },
		features: ['Everything in Pro', '3 creator seats', 'Unlimited viewers on shared links', 'Priority support'],
		cta: { label: 'Talk to us', href: SALES_HREF },
	},
	{
		id: 'enterprise',
		name: 'Enterprise',
		blurb: 'For larger orgs with security needs.',
		price: { monthly: null, yearly: null },
		note: { monthly: 'Tailored to your team', yearly: 'Tailored to your team' },
		features: ['Everything in Team', 'Custom seats and limits', 'SSO and security review', 'Dedicated onboarding'],
		cta: { label: 'Contact sales', href: SALES_HREF },
	},
];

const FAQ = [
	{
		q: 'What counts as an AI review?',
		a: 'One review is one pass over a whole project. Each pass checks every screen and connection and pins findings to the map.',
	},
	{
		q: 'Do I need to stop using Figma?',
		a: 'No. Keep designing in Figma and import frames into Bareframe. We focus on the flow between screens, with light editing for quick fixes.',
	},
	{
		q: 'Can I change plans later?',
		a: 'Yes. Upgrade from inside the app at any time, and your projects carry over.',
	},
];

export function PricingPage() {
	const [billing, setBilling] = useState<Billing>('yearly');

	return (
		<div className="bx-page pricing">
			<header className="bx-page-head pricing__head">
				<span className="bx-kicker">Pricing</span>
				<h1>Simple plans that grow with your flows</h1>
				<p className="bx-lead">Start free. Upgrade when you need more projects, reviews and private sharing.</p>
				<div className="flow-seg pricing__toggle" role="radiogroup" aria-label="Billing period">
					{(['monthly', 'yearly'] as const).map((b) => (
						<button
							key={b}
							type="button"
							role="radio"
							aria-checked={billing === b}
							onClick={() => setBilling(b)}
						>
							{b === 'monthly' ? 'Monthly' : 'Yearly'}
							{b === 'yearly' ? <span className="pricing__save">Save 25%</span> : null}
						</button>
					))}
				</div>
			</header>

			<div className="plans">
				{PLANS.map((plan) => {
					const price = plan.price[billing];
					return (
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
								{price ? (
									<>
										<span className="plan__amount">{price}</span>
										<span className="plan__unit">{plan.unit}</span>
									</>
								) : (
									<span className="plan__amount">Custom</span>
								)}
							</p>
							<p className="plan__note">{plan.note?.[billing]}</p>
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
					);
				})}
			</div>

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
