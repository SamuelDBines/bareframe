export function AgentSettingsPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Agent & MCP connections</h1>
				<p className="lead">
					Public catalog tools live at <code>https://bareframe.org/mcp</code> (read-only). Canvas writes use{' '}
					<code>https://bareframe.org/mcp/studio</code> with a project token from project settings.
				</p>
			</div>
			<div className="card" style={{ maxWidth: 560 }}>
				<h3>Hosted servers</h3>
				<p>
					See <a href="#/components/mcp">Connect agent</a> for the public MCP snippet, tool list, and rate-limit
					notes.
				</p>
				<p style={{ marginTop: '1rem' }}>
					Open a cloud project and choose <strong>Project settings</strong> to mint a <code>bf_proj_…</code> token and
					copy the studio MCP config.
				</p>
			</div>
		</>
	);
}
