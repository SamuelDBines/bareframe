import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
	createProjectToken,
	listProjectTokens,
	revokeProjectToken,
	type ProjectTokenSummary,
} from '../../designer/projectApi';
import { designerPath } from '../../sites/urls';

const CAPTURE_SCOPES = ['capture:write', 'assets:upload', 'projects:read'];

export function ProjectSettingsPage() {
	const { projectId = '' } = useParams<{ projectId: string }>();
	const [tokens, setTokens] = useState<ProjectTokenSummary[]>([]);
	const [mintedMcpToken, setMintedMcpToken] = useState<string | null>(null);
	const [mintedCaptureToken, setMintedCaptureToken] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	const studioUrl = 'https://bareframe.org/mcp/studio';
	const captureScriptOrigin =
		typeof window !== 'undefined' ? window.location.origin : 'https://bareframe.org';

	useEffect(() => {
		if (!projectId) return;
		listProjectTokens(projectId)
			.then(setTokens)
			.catch((err) => setError(err instanceof Error ? err.message : 'Failed to load tokens'));
	}, [projectId]);

	async function mintMcpToken() {
		setBusy(true);
		setError(null);
		setMintedMcpToken(null);
		try {
			const created = await createProjectToken(projectId, 'MCP assistant');
			setMintedMcpToken(created.token);
			setTokens(await listProjectTokens(projectId));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not create token');
		} finally {
			setBusy(false);
		}
	}

	async function mintCaptureToken() {
		setBusy(true);
		setError(null);
		setMintedCaptureToken(null);
		try {
			const created = await createProjectToken(projectId, 'App capture', CAPTURE_SCOPES);
			setMintedCaptureToken(created.token);
			setTokens(await listProjectTokens(projectId));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not create capture token');
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

	const mcpSnippet = mintedMcpToken
		? `{
  "mcpServers": {
    "bareframe-studio": {
      "url": "${studioUrl}",
      "headers": {
        "Authorization": "Bearer ${mintedMcpToken}"
      }
    }
  }
}`
		: `{
  "mcpServers": {
    "bareframe-studio": {
      "url": "${studioUrl}",
      "headers": {
        "Authorization": "Bearer bf_proj_<paste MCP token>"
      }
    }
  }
}`;

	const captureTokenForSnippet = mintedCaptureToken ?? 'bf_proj_<paste capture token>';
	const captureSnippet = `<script
  src="${captureScriptOrigin}/bareframe-capture.js"
  data-token="${captureTokenForSnippet}"
  data-endpoint="${captureScriptOrigin}/api/v1/capture/events"
  async
></script>`;

	return (
		<>
			<div className="page-hero">
				<h1>Project settings</h1>
				<p className="lead">
					Project-scoped tokens (<code>bf_proj_…</code>) power MCP assistants and in-app capture. Each
					token is shown once — store it in your secrets manager.
				</p>
				<p>
					<Link to={designerPath('/')}>← All projects</Link>
				</p>
			</div>
			{error && <p className="card">{error}</p>}
			<div className="card" style={{ maxWidth: 720 }}>
				<h3>API tokens</h3>
				<div className="app-actions" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
					<button type="button" className="btn btn-primary" disabled={busy || !projectId} onClick={mintMcpToken}>
						Create MCP token
					</button>
					<button
						type="button"
						className="btn btn-secondary"
						disabled={busy || !projectId}
						onClick={mintCaptureToken}
					>
						Create capture token
					</button>
				</div>
				{(mintedMcpToken || mintedCaptureToken) && (
					<p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
						<strong>Token minted.</strong> Copy it now — it will not be shown again.
					</p>
				)}
				<ul style={{ marginTop: '1rem' }}>
					{tokens.map((t) => (
						<li key={t.id} style={{ marginBottom: '0.5rem' }}>
							<code>{t.token_prefix}</code> · {t.name}
							{t.scopes?.includes('capture:write') ? ' · capture' : ''}
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
				<h3>App capture snippet</h3>
				<p>
					Drop this script into your product (staging or production). It posts navigation events to{' '}
					<code>/api/v1/capture/events</code> and refreshes the <strong>App capture</strong> canvas on this
					project.
				</p>
				<pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>{captureSnippet}</pre>
				<p style={{ fontSize: '0.85rem', color: 'var(--bf-theme-text-2)' }}>
					Scopes: <code>capture:write</code>, <code>assets:upload</code>. Optional screenshots can be added
					later via the same API batch payload.
				</p>
			</div>
			<div className="card" style={{ maxWidth: 720, marginTop: '1rem' }}>
				<h3>MCP connection snippet</h3>
				<pre style={{ overflow: 'auto', fontSize: '0.85rem' }}>{mcpSnippet}</pre>
				<p style={{ fontSize: '0.85rem', color: 'var(--bf-theme-text-2)' }}>
					Public read tools stay at <code>/mcp</code>; writes use <code>/mcp/studio</code>. Additional scopes:{' '}
					<code>flowmap:write</code>, <code>render</code>, <code>recordings:upload</code>.
				</p>
			</div>
		</>
	);
}
