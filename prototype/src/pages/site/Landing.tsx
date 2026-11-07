import { Link } from 'react-router-dom';
import { LiveFlowDemo } from '../../marketing/LiveFlowDemo';
import { LogoStrip } from '../../marketing/LogoStrip';
import '../../marketing/marketing.css';

const STEPS = [
	{
		n: '01',
		title: 'Import from Figma',
		body: 'Paste a Figma link. Frames become screens and prototype links become connectors. No redrawing.',
		art: 'import',
	},
	{
		n: '02',
		title: 'Map & review',
		body: 'See the whole journey on one canvas. AI flags missing screens, drop-off risk and accessibility issues right where they happen.',
		art: 'review',
	},
	{
		n: '03',
		title: 'Share a prototype',
		body: 'One click turns the map into a click-through prototype. Send the link to stakeholders or test it with users.',
		art: 'share',
	},
] as const;

const CATCHES = [
	{ sev: 'critical', label: 'Missing screens', body: 'Error, empty and edge-case states nobody designed yet.' },
	{ sev: 'major', label: 'Drop-off risk', body: 'Steps where people are likely to give up, with an estimate and a reason.' },
	{ sev: 'minor', label: 'Accessibility', body: 'Contrast, focus order and labelling checked against WCAG 2.2 AA.' },
	{ sev: 'info', label: 'UX friction', body: 'Competing calls to action, extra steps and confusing copy.' },
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
				<p className="bx-eyebrow bx-reveal">
					<span className="bx-eyebrow__tag">New</span>
					AI review, pinned to your flow map
				</p>
				<h1 className="hero__title bx-reveal">
					See your whole user journey.
					<br />
					<span>Fix it before people drop off.</span>
				</h1>
				<p className="hero__lead bx-reveal">
					Bring your screens in from Figma, map how they connect, and let AI flag missing screens, drop-off
					risks and accessibility issues right on the map. Then share it as a click-through prototype.
				</p>
				<div className="hero__cta bx-reveal">
					<Link to="/app" className="btn btn-primary btn-lg">
						Start free
					</Link>
					<span className="hero__note">Free plan · 1 project · 3 AI reviews a month</span>
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
						<h2 id="how-title">From Figma file to shareable prototype in three steps</h2>
						<p>Bareframe is built around flows, not pixels. Keep designing in Figma; use Bareframe to see, review and share the journey.</p>
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
						<h2 id="catch-title">Every finding lives on the screen it’s about</h2>
						<p>
							No separate report to cross-reference. Each flag sits on the map with a severity, a short
							reason and a suggested fix you can apply in one click.
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
				</div>
			</section>

			<section className="bx-section">
				<div className="bx-container">
					<div className="cta-band">
						<h2>Map your first flow today</h2>
						<p>Start on the free plan. Upgrade when your team needs more projects and reviews.</p>
						<div className="cta-band__actions">
							<Link to="/app" className="btn btn-lg cta-band__primary">
								Start free
							</Link>
							<Link to="/pricing" className="cta-band__link">
								Compare plans →
							</Link>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
