import { Link } from 'react-router-dom';

export function LandingPage() {
	return (
		<>
			<section className="page-hero landing-hero">
				<p className="badge-pill success">Product prototype</p>
				<h1>Design systems that agents and teams share</h1>
				<p className="lead">
					Bareframe unifies your marketing site, React component library, and visual designer —
					with themes, tokens, and MCP connections built in.
				</p>
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.25rem' }}>
					<Link to="/sign-up" className="btn btn-primary">Get started</Link>
					<Link to="/components" className="btn btn-secondary">Browse components</Link>
				</div>
			</section>

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Three products, one brand</h2>
				<div className="grid-3" style={{ marginTop: '1rem' }}>
					<article className="card product-card">
						<h3>Marketing site</h3>
						<p>Launch pages, pricing, and docs on your domain with Bareframe themes.</p>
						<Link to="/pricing">View pricing →</Link>
					</article>
					<article className="card product-card">
						<h3>@bareframe/react</h3>
						<p>Accessible components, live docs, token export, and agent-readable APIs.</p>
						<Link to="/components">Open gallery →</Link>
					</article>
					<article className="card product-card">
						<h3>Bareframe Designer</h3>
						<p>Compose screens with real components, edit themes, and hand off to code.</p>
						<Link to="/designer">Open designer →</Link>
					</article>
				</div>
			</section>

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Built for humans and agents</h2>
				<div className="grid-2" style={{ marginTop: '1rem' }}>
					<div className="card">
						<h3>Theme-aware</h3>
						<p>
							Switch among 16 curated themes — the same CSS variables power site, docs, and
							designer previews.
						</p>
					</div>
					<div className="card">
						<h3>MCP-ready</h3>
						<p>
							Agents connect to list components, read props, and apply themes without scraping
							docs.
						</p>
						<Link to="/components/mcp">Connect your agent →</Link>
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
				<h2>Ready to try Bareframe?</h2>
				<p style={{ margin: '0 auto 1rem', maxWidth: '40ch' }}>
					Create a free account, pick a theme, and open your first project in Designer.
				</p>
				<Link to="/sign-up" className="btn btn-primary">Start free</Link>
			</section>
		</>
	);
}
