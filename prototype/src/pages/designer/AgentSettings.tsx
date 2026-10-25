import { Link } from 'react-router-dom';

export function AgentSettingsPage() {
	return (
		<>
			<div className="page-hero">
				<h1>Agent & MCP connections</h1>
				<p className="lead">Issue scoped tokens so AI tools can read your library and themes safely.</p>
			</div>
			<div className="card form-stack" style={{ maxWidth: 520 }}>
				<div className="field">
					<label>Connection name</label>
					<input defaultValue="Cursor — design system" />
				</div>
				<div className="field">
					<label>API token</label>
					<input readOnly value="bf_mcp_••••••••••••4f9c" />
				</div>
				<div className="field">
					<label>Scopes</label>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.9rem' }}>
						<label><input type="checkbox" checked readOnly /> components:read</label>
						<label><input type="checkbox" checked readOnly /> themes:read</label>
						<label><input type="checkbox" readOnly /> designer:write</label>
					</div>
				</div>
				<button type="button" className="btn btn-primary">Rotate token</button>
			</div>
			<p style={{ marginTop: '1.5rem' }}>
				See also <Link to="/components/mcp">Components MCP docs</Link>
			</p>
		</>
	);
}
