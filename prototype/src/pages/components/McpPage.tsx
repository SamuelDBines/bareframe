import { Link } from 'react-router-dom';

export function McpPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Connect your agent</h1>
				<p className="lead">
					Bareframe exposes an MCP server so coding agents can read components, themes, and tokens
					without brittle HTML scraping.
				</p>
			</div>

			<div className="grid-2">
				<div className="card">
					<h3>1. Add the server</h3>
					<pre className="code-block">{`{
  "mcpServers": {
    "bareframe": {
      "url": "https://mcp.bareframe.dev/v1"
    }
  }
}`}</pre>
				</div>
				<div className="card">
					<h3>2. Authenticate</h3>
					<p>
						Generate a read token in Designer → Settings → Agent connections. Scope it to
						<code> components:read</code> and <code>themes:read</code>.
					</p>
					<Link to="/designer/settings/agent" className="btn btn-secondary">
						Open connection settings
					</Link>
				</div>
			</div>

			<section style={{ marginTop: '2rem' }}>
				<h2>Example tools</h2>
				<div className="table-wrap" style={{ marginTop: '0.75rem' }}>
					<table className="props-table">
						<thead>
							<tr>
								<th>Tool</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td><code>list_components</code></td>
								<td>Returns slugs, categories, and stability for @bareframe/react.</td>
							</tr>
							<tr>
								<td><code>get_component</code></td>
								<td>Props table, variants, and usage snippet for one component.</td>
							</tr>
							<tr>
								<td><code>list_themes</code></td>
								<td>Theme ids and CSS variable bundles.</td>
							</tr>
							<tr>
								<td><code>export_tokens</code></td>
								<td>JSON token manifest aligned with tokens.json.</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>
		</>
	);
}
