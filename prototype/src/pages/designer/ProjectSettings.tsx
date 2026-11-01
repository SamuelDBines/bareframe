import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
	createProjectToken,
	listProjectTokens,
	revokeProjectToken,
	type ProjectTokenSummary,
} from '../../designer/projectApi';

export function ProjectSettingsPage() {
	const { projectId = '' } = useParams<{ projectId: string }>();
	const [tokens, setTokens] = useState<ProjectTokenSummary[]>([]);
	const [mintedToken, setMintedToken] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const studioUrl = 'https://bareframe.org/mcp/studio';

	useEffect(() => {
		if (!projectId) return;
		listProjectTokens(projectId)
			.then(setTokens)
			.catch((err) => setError(err instanceof Error ? err.message : 'Failed to load tokens'));
	}, [projectId]);

	async function mintToken() {
		setBusy(true);
		setError(null);
		setMintedToken(null);
		try {
			const created = await createProjectToken(projectId, 'MCP assistant');
			setMintedToken(created.token);
			const next = await listProjectTokens(projectId);
			setTokens(next);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not create token');
		} finally {
			setBusy(false);
		}
	}

	async function revoke(tokenId: string) {
		setBusy(true);
		try {
			await revokeProjectToken(projectId, tokenId);
			setTokens(await listProjectTokens(projectId));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Revoke failed');
		} finally {
			setBusy(false);
		}
	}

	const snippet = mintedToken
		? `{
  "mcpServers": {
    "bareframe-studio": {
      "url": "${studioUrl}",
      "headers": {
        "Authorization": "Bearer ${mintedToken}"
      }
    }
  }
}`
		: `{
  "mcpServers": {
    "bareframe-studio": {
      "url": "${studioUrl}",
      "headers": {
        "Authorization": "Bearer bf_proj_<paste token from Create token>"
      }
    }
  }
}`;

	return (
		<>
			<div className="page-hero">
				<h1>Project settings</h1>
				<p className="lead">
					Project-scoped tokens (<code>bf_proj_…</code>) let an MCP assistant edit this canvas only.
					Public read tools stay at <code>/mcp</code>; writes use <code>/mcp/studio</code>.
				</p>
				<p>
					<Link to="/designer">← All projects</Link>
				</p>
			</div>
			{error && <p className="card">{error}</p>}
			<div className="card" style={{ maxWidth: 720 }}>
				<h3>API tokens</h3>
				<p>Create a token for Cursor, Claude, or another MCP client. It is shown once — store it in your secrets manager.</p>
				<button type="button" className="btn btn-primary" disabled={busy || !projectId} onClick={mintToken}>
					Create token
				</button>
				{mintedToken && (
					<p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
						<strong>Token minted.</strong> Copy it now — it will not be shown again.
					</p>
				)}
				<ul style={{ marginTop: '1rem' }}>
					{tokens.map((t) => (
						<li key={t.id} style={{ marginBottom: '0.5rem' }}>
							<code>{t.token_prefix}</code> · {t.name}
							{t.revoked_at ? ' (revoked)' : ''}
							{!t.revoked_at && (
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									style={{ marginLeft: '0.5rem' }}
									disabled={busy}
									onClick={() => revoke(t.id)}
								>
									Revoke
								</button>
							)}
						</li>
					))}
				</ul>
			</div>
			<div className="card" style={{ maxWidth: 720, marginTop: '1rem' }}>
				<h3>MCP connection snippet</h3>
				<pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>{snippet}</pre>
				<p style={{ fontSize: '0.85rem', color: 'var(--bf-theme-text-2)' }}>
					Tools: list_projects, get_project, create_canvas, add_screen, add_component, add_connector,
					add_annotation, update_node, delete_node, import_screenshots, get_upload_url,
					create_flow_map, screenshot_url, render_frame, list_recordings, build_flow_from_recording.
					Scopes: <code>flowmap:write</code>, <code>render</code>, <code>recordings:upload</code> for those features.
				</p>
			</div>
		</>
	);
}
