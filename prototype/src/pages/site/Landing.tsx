import { Link } from 'react-router-dom';

export function LandingPage() {
	return (
		<>
			<section className="page-hero landing-hero">
				<p className="badge-pill success">Journey review</p>
				<h1>Map journeys and designs. AI shows where people get stuck.</h1>
				<p className="lead">
					Bareframe is one calm workspace for user flows, screen maps, and AI review callouts —
					what&apos;s confusing, what&apos;s missing, likely drop-offs (estimates), accessibility, and
					suggested fixes built from @bareframe/react. <strong>£20/month</strong> for Pro.
				</p>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
					<Link to="/app" className="btn btn-primary">
						Open app
					</Link>
					<Link to="/pricing" className="btn btn-secondary">
						See pricing
					</Link>
					<Link to="/examples" className="btn btn-ghost">
						Examples
					</Link>
				</div>
			</section>

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Three ways to start</h2>
				<div className="grid-3" style={{ marginTop: '1rem' }}>
					<article className="card product-card">
						<h3>Product brief</h3>
						<p>Describe your idea — we generate journeys, screens, and a canvas you can review.</p>
						<Link to="/app">Start from brief →</Link>
					</article>
					<article className="card product-card">
						<h3>Import a live URL</h3>
						<p>Screenshot pages and link them into a draft journey map (Pro).</p>
						<Link to="/app">Import website →</Link>
					</article>
					<article className="card product-card">
						<h3>Blank canvas</h3>
						<p>Place screens, connectors, and flows yourself, then run an AI review pass.</p>
						<Link to="/app">New project →</Link>
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
