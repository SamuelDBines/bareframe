import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import {
	createProject,
	listProjects,
	loadLocalProject,
	migrateLocalProjectToServer,
	type ApiProjectSummary,
} from '../../designer/projectApi';
import { fromProjectDocument } from '../../designer/localProject';
import { createInitialProject } from '../../designer/initialProject';
import { designerPath } from '../../sites/urls';

export function DesignerDashboard() {
	const { status } = useAuth();
	const navigate = useNavigate();
	const [projects, setProjects] = useState<ApiProjectSummary[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (status !== 'authenticated') return;
		listProjects()
			.then(setProjects)
			.catch((err) => setError(err instanceof Error ? err.message : 'Failed to load projects'));
	}, [status]);

	async function handleCreate() {
		setBusy(true);
		setError(null);
		try {
			const created = await createProject('Untitled project');
			navigate(designerPath(`/editor/${created.id}`));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Could not create project');
		} finally {
			setBusy(false);
		}
	}

	async function handleMigrateLocal() {
		const local = loadLocalProject();
		const project = local
			? fromProjectDocument(local.document)
			: createInitialProject();
		setBusy(true);
		try {
			const migrated = await migrateLocalProjectToServer(project);
			navigate(designerPath(`/editor/${migrated.id}`));
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Migration failed');
		} finally {
			setBusy(false);
		}
	}

	return (
		<>
			<div className="page-hero" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
				<div style={{ flex: 1 }}>
					<h1>Projects</h1>
					<p className="lead">
						Signed-in projects sync to Bareframe. When signed out, the canvas stays in this browser only.
					</p>
				</div>
				<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
					<Link to={designerPath('/editor')} className="btn btn-secondary">
						Local canvas
					</Link>
					{status === 'authenticated' && (
						<>
							<Link to={designerPath('/product/new')} className="btn btn-primary">
								New product
							</Link>
							<button type="button" className="btn btn-secondary" disabled={busy} onClick={handleMigrateLocal}>
								Migrate local → cloud
							</button>
							<button type="button" className="btn btn-secondary" disabled={busy} onClick={handleCreate}>
								New project
							</button>
						</>
					)}
				</div>
			</div>
			{error && (
				<p className="card" style={{ color: 'var(--bf-theme-danger, #b42318)' }}>
					{error}
				</p>
			)}
			{status !== 'authenticated' && (
				<p className="card">Sign in with GitHub to create server-saved projects and MCP tokens.</p>
			)}
			<div className="grid-2">
				{projects.map((p) => (
					<article key={p.id} className="card">
						<h3>{p.name}</h3>
						<p>
							Version {p.version}
							{p.updatedAt ? ` · Updated ${new Date(p.updatedAt).toLocaleString()}` : null}
						</p>
						<div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
							<Link to={designerPath(`/editor/${p.id}`)} className="btn btn-secondary">
								Open in canvas
							</Link>
							<Link to={designerPath(`/settings/project/${p.id}`)} className="btn btn-ghost">
								Project settings
							</Link>
							<Link to={designerPath(`/recordings/${p.id}`)} className="btn btn-ghost">
								Recordings
							</Link>
						</div>
					</article>
				))}
			</div>
		</>
	);
}
