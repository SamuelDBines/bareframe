import { Link } from 'react-router-dom';

const CURSOR_SNIPPET = `{
  "mcpServers": {
    "bareframe": {
      "url": "https://bareframe.org/mcp"
    }
  }
}`;

const CLAUDE_SNIPPET = `{
  "mcpServers": {
    "bareframe": {
      "type": "http",
      "url": "https://bareframe.org/mcp"
    }
  }
}`;

export function McpPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Connect your agent</h1>
				<p className="lead">
					Bareframe hosts a public, read-only MCP server on the same origin as the docs. Agents can
					list components, read real doc examples, search guides, and fetch the Repkit → Bareframe
					migration guide — no HTML scraping and no API keys.
				</p>
			</div>

			<div className="grid-2">
				<div className="card">
					<h3>Cursor</h3>
					<p>Add to your MCP config (Settings → MCP, or project <code>.cursor/mcp.json</code>):</p>
					<pre className="code-block">{CURSOR_SNIPPET}</pre>
				</div>
				<div className="card">
					<h3>Claude Desktop</h3>
					<p>
						Add under <code>mcpServers</code> in Claude&apos;s config (see Anthropic docs for the file
						location on your OS):
					</p>
					<pre className="code-block">{CLAUDE_SNIPPET}</pre>
				</div>
			</div>

			<section style={{ marginTop: '2rem' }}>
				<h2>Endpoint</h2>
				<ul className="doc-prose">
					<li>
						MCP (Streamable HTTP): <code>https://bareframe.org/mcp</code>
					</li>
					<li>
						Health: <code>https://bareframe.org/mcp/healthz</code>
					</li>
					<li>Auth: none (public read-only; per-IP rate limits apply)</li>
				</ul>
			</section>

			<section style={{ marginTop: '2rem' }}>
				<h2>Tools</h2>
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
								<td>Slugs, categories, stability, and @bareframe/react export names.</td>
							</tr>
							<tr>
								<td><code>get_component</code></td>
								<td>Props plus real <code>.example.tsx</code> sources from the docs app.</td>
							</tr>
							<tr>
								<td><code>list_themes</code></td>
								<td>Built-in theme ids and CSS import paths.</td>
							</tr>
							<tr>
								<td><code>export_tokens</code></td>
								<td>Token manifest (<code>tokens.json</code>) or per-theme values.</td>
							</tr>
							<tr>
								<td><code>search_docs</code></td>
								<td>Search markdown guides and component reference text.</td>
							</tr>
							<tr>
								<td><code>get_install_steps</code></td>
								<td>Install and CSS import steps for @bareframe/react.</td>
							</tr>
							<tr>
								<td><code>get_migration_guide</code></td>
								<td>
									Full &quot;Migrating to @bareframe/react&quot; guide (Repkit → Bareframe).
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			</section>

			<p style={{ marginTop: '1.5rem' }}>
				Migrating from <code>@repkit/components</code>? Read{' '}
				<Link to="/components/migrating">Migrating to @bareframe/react</Link>.
			</p>
		</>
	);
}
