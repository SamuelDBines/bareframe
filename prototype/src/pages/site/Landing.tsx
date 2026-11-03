import { Link } from 'react-router-dom';
import { Button } from '@bareframe/react';

export function LandingPage() {
	return (
		<>
			<section className="page-hero landing-hero">
				<p className="badge-pill success">Journey review</p>
				<h1>Map journeys and designs. AI shows where people get stuck.</h1>
				<p className="lead">
					Bareframe is one calm workspace for user flows, screen maps, and AI review callouts — confusing steps,
					missing states, accessibility, and suggested fixes. <strong>£20/month</strong> for Pro.
				</p>
				<div className="landing-actions">
					<Link to="/demo/flow-map" className="app-hero-cta">
						<Button variant="primary">Try live demo</Button>
					</Link>
					<Link to="/app" className="app-hero-cta">
						<Button variant="secondary">Open app</Button>
					</Link>
					<Link to="/pricing" className="app-hero-cta">
						<Button variant="ghost">See pricing</Button>
					</Link>
				</div>
			</section>

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Three ways to start</h2>
				<div className="product-card-grid">
					<article className="card product-card">
						<h3>Start from a brief</h3>
						<p>Describe the journey, then refine screens and connectors on the flow map.</p>
						<Link to="/app/product/new">New project brief →</Link>
					</article>
					<article className="card product-card">
						<h3>Import Figma or URL</h3>
						<p>Pull frames or live pages into a draft map (URL import on Pro).</p>
						<Link to="/app">Open app hub →</Link>
					</article>
					<article className="card product-card">
						<h3>See it first</h3>
						<p>Walk through the public demo with connectors, minimap, and review callouts.</p>
						<Link to="/demo/flow-map">Flow map demo →</Link>
					</article>
				</div>
			</section>

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Review categories agents understand</h2>
				<div className="grid-2" style={{ marginTop: '1rem' }}>
					<div className="card">
						<h3>UX &amp; gaps</h3>
						<p>
							Confusing steps, missing empty/error/loading states, and estimated drop-off points pinned on
							the map.
						</p>
					</div>
					<div className="card">
						<h3>A11y &amp; consistency</h3>
						<p>
							WCAG 2.2 AA signals from the render worker plus design consistency against Bareframe
							components — with alternative fixes and previews.
						</p>
						<Link to="/components/mcp">MCP tools →</Link>
					</div>
				</div>
			</section>

			<section
				className="card"
				style={{
					marginTop: '2.5rem',
					textAlign: 'center',
					padding: '2rem',
					background:
						'linear-gradient(135deg, color-mix(in srgb, var(--bf-theme-button-primary-bg) 12%, var(--bf-theme-surface-1)), var(--bf-theme-surface-1))',
				}}
			>
				<h2>Start free, upgrade when you ship</h2>
				<p style={{ margin: '0 auto 1rem', maxWidth: '44ch' }}>
					Free includes one project and three AI reviews a month. Pro unlocks URL import, private canvases,
					export, and studio MCP tools.
				</p>
				<Link to="/sign-up" className="btn btn-primary">
					Create account
				</Link>
			</section>
		</>
	);
}
