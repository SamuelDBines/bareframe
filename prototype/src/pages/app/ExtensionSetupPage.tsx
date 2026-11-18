import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { friendlyError } from '../../app/apiError';
import { createProjectToken, fetchProject } from '../../designer/projectApi';

const EXTENSION_SCOPES = ['capture:write', 'notes:write', 'assets:upload', 'projects:read'];

export function ExtensionSetupPage() {
	const { projectId = '' } = useParams<{ projectId: string }>();
	const [projectName, setProjectName] = useState('');
	const [token, setToken] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bareframe.org';
	const zipUrl = `${origin}/extension/bareframe-extension.zip`;
	const storeUrl = 'https://chromewebstore.google.com/detail/bareframe-capture-placeholder';

	const steps = useMemo(
		() => [
			'Build or download the extension zip from this repo (`pnpm extension:zip`).',
			'In Chrome, open `chrome://extensions`, enable Developer mode, and choose Load unpacked (`extension/dist`) or load the zip contents.',
			'Paste the project token below, pick this project, then record a flow or send a quick note.',
		],
		[],
	);

	useEffect(() => {
		if (!projectId) return;
		void fetchProject(projectId)
			.then((p) => setProjectName(p.name))
			.catch((e) => setError(friendlyError(e, 'Could not load project')));
	}, [projectId]);

	async function mint() {
		if (!projectId) return;
		setBusy(true);
		setError(null);
		setToken(null);
		try {
			const created = await createProjectToken(projectId, 'Chrome extension', EXTENSION_SCOPES);
			setToken(created.token);
		} catch (e) {
			setError(friendlyError(e, 'Could not create token'));
		} finally {
			setBusy(false);
		}
	}

	return (
		<div className="bx-page" style={{ maxWidth: 760, margin: '0 auto', padding: '2rem 1rem' }}>
			<p className="ds-meta">
				<Link to={`/app/project/${projectId}`}>← Project</Link>
			</p>
			<h1>Chrome extension</h1>
			<p className="bx-lead">
				Record yourself clicking through {projectName || 'your site'} so Bareframe gets real screens,
				connectors, and quick UX notes. Recording runs only while you start it in the popup, with a visible
				indicator and blurred password fields.
			</p>

			<div className="bx-card" style={{ marginTop: '1.5rem' }}>
				<h2>Install</h2>
				<ul>
					{steps.map((s) => (
						<li key={s} style={{ marginBottom: '0.5rem' }}>
							{s}
						</li>
					))}
				</ul>
				<p>
					<a className="btn btn-secondary" href={zipUrl}>
						Download built zip
					</a>{' '}
					<a className="btn btn-ghost" href={storeUrl} rel="noreferrer">
						Chrome Web Store (placeholder)
					</a>
				</p>
			</div>

			<div className="bx-card" style={{ marginTop: '1rem' }}>
				<h2>Project token</h2>
				<p className="ds-meta">
					Scopes: {EXTENSION_SCOPES.map((s) => (
						<code key={s} style={{ marginRight: '0.35rem' }}>
							{s}
						</code>
					))}
					Shown once; store in your password manager.
				</p>
				<button type="button" className="btn btn-primary" disabled={busy || !projectId} onClick={mint}>
					Create extension token
				</button>
				{token ? (
					<pre className="code-block" style={{ marginTop: '1rem', wordBreak: 'break-all' }}>
						{token}
					</pre>
				) : null}
				{error ? (
					<p className="ds-error" style={{ marginTop: '0.75rem' }}>
						{error}
					</p>
				) : null}
			</div>
		</div>
	);
}