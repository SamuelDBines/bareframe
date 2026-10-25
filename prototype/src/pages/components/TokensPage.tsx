import { TOKEN_GROUPS } from '../../data/tokens';

export function TokensPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Design tokens</h1>
				<p className="lead">
					CSS custom properties exported as <code>tokens.json</code> from the Bareframe build.
					Switch themes in the header to see values update live.
				</p>
			</div>
			{TOKEN_GROUPS.map((group) => (
				<section key={group.label} style={{ marginBottom: '2rem' }}>
					<h2>{group.label}</h2>
					<div className="grid-2" style={{ marginTop: '0.75rem' }}>
						{group.tokens.map((t) => (
							<div key={t.name} className="card">
								<code style={{ fontSize: '0.8rem' }}>{t.name}</code>
								<div className="token-swatch" style={{ marginTop: '0.5rem', background: t.sample }} />
							</div>
						))}
					</div>
				</section>
			))}
			<p className="footer-note">
				Full token list: <code>bareframe/tokens.json</code> in the npm package.
			</p>
		</>
	);
}
