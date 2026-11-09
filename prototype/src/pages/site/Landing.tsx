import { Link } from 'react-router-dom';
import { LiveFlowDemo } from '../../marketing/LiveFlowDemo';
import { LogoStrip } from '../../marketing/LogoStrip';
import {
	ACCESSIBILITY_DISCLAIMER,
	HERO_HEADLINE,
	HERO_SUBHEAD,
	PRO_PRICE_LABEL,
} from '../../marketing/offer';
import '../../marketing/marketing.css';

const STEPS = [
	{
		n: '01',
		title: 'Map the journey',
		body: 'Import from Figma or start on a blank canvas. Screens and connectors show the path users take.',
		art: 'import',
	},
	{
		n: '02',
		title: 'Review on the map',
		body: 'Run AI review on the whole flow. Flags sit on the screens they refer to — missing steps, drop-off risk and accessibility issues.',
		art: 'review',
	},
	{
		n: '03',
		title: 'Share with stakeholders',
		body: 'Turn the map into a click-through prototype when you are ready. One link for feedback or user tests.',
		art: 'share',
	},
] as const;

const CATCHES = [
	{ sev: 'critical', label: 'Missing steps', body: 'Screens and states the journey needs but does not show yet.' },
	{ sev: 'major', label: 'Drop-off risk', body: 'Steps where people are likely to give up, with a short reason.' },
	{ sev: 'minor', label: 'Accessibility', body: 'Contrast, focus order and labelling checked against WCAG 2.2 AA guidance.' },
	{ sev: 'info', label: 'UX friction', body: 'Competing calls to action, extra steps and unclear copy.' },
] as const;

function StepArt({ kind }: { kind: (typeof STEPS)[number]['art'] }) {
	if (kind === 'import') {
		return (
			<div className="step-art step-art--import" aria-hidden>
				<div className="sa-figma">
					<span className="sa-figma__logo" />
					<span className="sa-url">figma.com/design/…</span>
				</div>
				<div className="sa-frames">
					<i />
					<i />
					<i />
				</div>
			</div>
		);
	}
	if (kind === 'review') {
		return (
			<div className="step-art step-art--review" aria-hidden>
				<i className="sa-node" />
				<span className="sa-line" />
				<i className="sa-node sa-node--flag">
					<b>!</b>
				</i>
				<span className="sa-line" />
				<i className="sa-node sa-node--ghost" />
			</div>
		);
	}
	return (
		<div className="step-art step-art--share" aria-hidden>
			<div className="sa-phone">
				<span className="sa-hotspot" />
			</div>
			<div className="sa-link">
				<span>bareframe.org/share/…</span>
				<b>Copied</b>
			</div>
		</div>
	);
}

export function LandingPage() {
	return (
		<div className="landing">
			<section className="hero bx-container">
				<p className="bx-eyebrow bx-reveal">Flow map · AI review</p>
				<h1 className="hero__title bx-reveal">{HERO_HEADLINE}</h1>
				<p className="hero__lead bx-reveal">{HERO_SUBHEAD}</p>
				<div className="hero__cta bx-reveal">
					<Link to="/app" className="btn btn-primary btn-lg">
						Start free
					</Link>
					<span className="hero__note">Free · your first flow · 3 AI reviews a month · Pro {PRO_PRICE_LABEL}</span>
				</div>
				<div className="hero__demo bx-reveal">
					<LiveFlowDemo />
				</div>
			</section>

			<LogoStrip />

			<section className="bx-section" aria-labelledby="how-title">
				<div className="bx-container">
					<div className="bx-section-head">
						<span className="bx-kicker">How it works</span>
						<h2 id="how-title">One canvas for the whole journey</h2>
						<p>Map the flow, review it on the map, then share a prototype when you need feedback.</p>
					</div>
					<ol className="steps">
						{STEPS.map((s) => (
							<li key={s.n} className="step">
								<StepArt kind={s.art} />
								<span className="step__n">{s.n}</span>
								<h3>{s.title}</h3>
								<p>{s.body}</p>
							</li>
						))}
					</ol>
				</div>
			</section>

			<section className="bx-section bx-section--tint" aria-labelledby="catch-title">
				<div className="bx-container catch">
					<div className="catch__copy">
						<span className="bx-kicker">AI review</span>
						<h2 id="catch-title">Findings stay on the screen they refer to</h2>
						<p>
							No separate report to cross-reference. Each flag has a severity, a short explanation and a
							suggested fix you can track on the map.
						</p>
						<Link to="/demo/journey-review" className="btn btn-secondary">
							Open the example project
						</Link>
					</div>
					<ul className="catch__list">
						{CATCHES.map((c) => (
							<li key={c.label} className="catch__item">
								<span className={`bx-sev bx-sev--${c.sev}`}>{c.sev}</span>
								<div>
									<h3>{c.label}</h3>
									<p>{c.body}</p>
								</div>
							</li>
						))}
					</ul>
					<p className="bx-hint catch__disclaimer">{ACCESSIBILITY_DISCLAIMER}</p>
				</div>
			</section>

			<section className="bx-section bx-section--tint" aria-labelledby="extras-title">
				<div className="bx-container">
					<div className="bx-section-head">
						<span className="bx-kicker">Also</span>
						<h2 id="extras-title">Component library &amp; agent docs</h2>
						<p>
							Bareframe includes a React component gallery and MCP docs for agents — useful once your flow is
							mapped, but not part of the core offer.
						</p>
						<Link to="/components" className="btn btn-secondary">
							Browse components
						</Link>
					</div>
				</div>
			</section>

			<section className="bx-section">
				<div className="bx-container">
					<div className="cta-band">
						<h2>Map your first flow today</h2>
						<p>Start free. Upgrade to Pro ({PRO_PRICE_LABEL}) when you need more projects and server imports.</p>
						<div className="cta-band__actions">
							<Link to="/app" className="btn btn-lg cta-band__primary">
								Start free
							</Link>
							<Link to="/pricing" className="cta-band__link">
								See pricing →
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
