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

const STUDIO_SNIPPET = `{
  "mcpServers": {
    "bareframe-studio": {
      "url": "https://bareframe.org/mcp/studio",
      "headers": {
        "Authorization": "Bearer bf_acc_<account token from App → Settings>"
      }
    }
  }
}`;

const PUBLIC_TOOLS = [
	['list_components', 'Catalog list with optional detail=full.'],
	['get_component', 'Props and .example.tsx sources.'],
	['list_themes', 'Built-in theme ids and CSS paths.'],
	['get_design_tokens', 'Semantic tokens from themes/*.css.'],
	['scaffold_screen', 'Generate a @bareframe/react page layout (TSX).'],
	['export_tokens', 'Legacy flat token manifest.'],
	['search_docs', 'Search guides and component reference.'],
	['get_install_steps', 'Install and CSS import steps.'],
	['get_migration_guide', 'Repkit → Bareframe migration guide.'],
	['review_project', 'Hint to call studio review_project for canvas UX reviews.'],
	['check_url', 'Screenshot metrics and flow-map audit for a public URL.'],
] as const;

const STUDIO_TOOLS = [
	['create_project', 'Create a project (account token, projects:create).'],
	['create_share_link', 'Mint share URL; play=true opens the prototype player.'],
	['generate_flow', 'Describe → flow map (plan limits apply).'],
	['generate_screen_design', 'AI screen design for one page/device.'],
	['generate_all_designs', 'Design every screen on a device preset.'],
	['create_click_through_prototype', 'One-shot project + flow + designs + play URL.'],
	['list_projects', 'Projects visible to the token.'],
	['get_project', 'Project document and version.'],
	['add_screen', 'Add a device frame / screen.'],
	['add_component', 'Insert catalog component instance.'],
	['add_connector', 'Link screens (optional fromNodeId for button hotspots).'],
	['add_annotation', 'Callouts and notes on frames.'],
	['update_node', 'Patch node layout, content, variant.'],
	['delete_node', 'Remove a node.'],
	['import_screenshots', 'Build screens from uploaded PNGs.'],
	['create_flow_map', 'Async flow-map job from recording or sitemap.'],
	['render_frame', 'PNG render of a frame.'],
	['screenshot_url', 'Capture a live URL to PNG.'],
	['review_project', 'AI UX review (Pro).'],
	['check_url', 'URL audit via studio credentials.'],
] as const;

function ToolTable({ rows }: { rows: readonly (readonly [string, string])[] }) {
	return (
		<div className="table-wrap" style={{ marginTop: '0.75rem' }}>
			<table className="props-table">
				<thead>
					<tr>
						<th>Tool</th>
						<th>Description</th>
					</tr>
				</thead>
				<tbody>
					{rows.map(([name, description]) => (
						<tr key={name}>
							<td>
								<code>{name}</code>
							</td>
							<td>{description}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

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
				<h2>Public endpoint</h2>
				<ul className="doc-prose">
					<li>
						MCP (Streamable HTTP): <code>https://bareframe.org/mcp</code>
					</li>
					<li>
						Health: <code>https://bareframe.org/mcp/healthz</code>
					</li>
					<li>Auth: none (read-only; per-IP rate limits)</li>
				</ul>
				<h3 style={{ marginTop: '1.25rem' }}>Public tools</h3>
				<ToolTable rows={PUBLIC_TOOLS} />
			</section>

			<section style={{ marginTop: '2.5rem' }}>
				<h2>Studio endpoint (canvas &amp; prototypes)</h2>
				<p>
					<code>https://bareframe.org/mcp/studio</code> accepts a Bearer token: account-level{' '}
					<code>bf_acc_…</code> (create projects and playable links from{' '}
					<Link to="/app/settings">Account settings</Link>) or project-scoped <code>bf_proj_…</code>{' '}
					for a single project.
				</p>
				<pre className="code-block">{STUDIO_SNIPPET}</pre>
				<h3 style={{ marginTop: '1.25rem' }}>Studio tools</h3>
				<ToolTable rows={STUDIO_TOOLS} />
			</section>

			<p style={{ marginTop: '1.5rem' }}>
				Migrating from <code>@repkit/components</code>? Read{' '}
				<Link to="/components/migrating">Migrating to @bareframe/react</Link>.
			</p>
		</>
	);
}