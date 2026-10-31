export function AgentSettingsPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Agent & MCP connections</h1>
				<p className="lead">
					The hosted MCP server is public and read-only — no tokens to mint here yet. Point your IDE
					or Claude config at <code>https://bareframe.org/mcp</code>.
				</p>
			</div>
			<div className="card" style={{ maxWidth: 560 }}>
				<h3>Hosted server</h3>
				<p>
					See <a href="#/components/mcp">Connect agent</a> for Cursor and Claude snippets, tool list,
					and rate-limit notes.
				</p>
				<p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'var(--bf-theme-text-2)' }}>
					Designer-scoped write tokens (<code>designer:write</code>) for canvas mutations are planned
					for a later milestone.
				</p>
			</div>
		</>
	);
}
