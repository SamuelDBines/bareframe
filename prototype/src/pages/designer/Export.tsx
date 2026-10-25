import { Link } from 'react-router-dom';

export function ExportPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Export & handoff</h1>
				<p className="lead">Ship screens to React, Figma, or your repo with theme context attached.</p>
			</div>
			<div className="grid-3">
				<article className="card">
					<h3>React + @bareframe/react</h3>
					<p>Generates TSX using real imports and your active theme class.</p>
					<pre className="code-block" style={{ fontSize: '0.75rem' }}>
						npx bareframe export --format=tsx
					</pre>
				</article>
				<article className="card">
					<h3>Design tokens</h3>
					<p>JSON aligned with npm <code>tokens.json</code>.</p>
					<button type="button" className="btn btn-secondary">Download tokens</button>
				</article>
				<article className="card">
					<h3>Share link</h3>
					<p>Read-only prototype URL for stakeholders.</p>
					<input readOnly value="https://bareframe.dev/p/demo-7f2a" />
				</article>
			</div>
			<p style={{ marginTop: '1.5rem' }}>
				<Link to="/designer/editor">← Back to editor</Link>
			</p>
		</>
	);
}
