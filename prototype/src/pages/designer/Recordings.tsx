import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProject, listRecordings, type RecordingRow } from '../../designer/projectApi';

export function RecordingsPage() {
	const { projectId } = useParams<{ projectId: string }>();
	const [rows, setRows] = useState<RecordingRow[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [projectName, setProjectName] = useState('');

	useEffect(() => {
		if (!projectId) return;
		void (async () => {
			try {
				const project = await fetchProject(projectId);
				setProjectName(project.name);
				const list = await listRecordings(projectId);
				setRows(list);
			} catch (e) {
				setError(e instanceof Error ? e.message : 'Failed to load recordings');
			}
		})();
	}, [projectId]);

	return (
		<div className="designer-panel" style={{ maxWidth: 720, margin: '2rem auto' }}>
			<p>
				<Link to="/designer">Projects</Link>
				{projectId ? (
					<>
						{' '}
						/ <Link to={`/designer/editor/${projectId}`}>{projectName || projectId}</Link>
					</>
				) : null}
			</p>
			<h1>Recordings</h1>
			<p className="muted">
				Install the Chrome extension in <code>extension/</code>, paste a project upload token with{' '}
				<code>recordings:upload</code>, and upload a recorded journey. Recordings expire after 90 days.
			</p>
			{error ? <p className="error">{error}</p> : null}
			<table className="table" style={{ width: '100%' }}>
				<thead>
					<tr>
						<th>Name</th>
						<th>Status</th>
						<th>Created</th>
						<th>Expires</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((r) => (
						<tr key={r.id}>
							<td>{r.name}</td>
							<td>{r.status}</td>
							<td>{new Date(r.created_at).toLocaleString()}</td>
							<td>{new Date(r.expires_at).toLocaleString()}</td>
						</tr>
					))}
				</tbody>
			</table>
			{rows.length === 0 && !error ? <p>No recordings yet.</p> : null}
		</div>
	);
}
