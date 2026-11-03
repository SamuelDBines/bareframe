import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchProject, listRecordings, type RecordingRow } from '../../designer/projectApi';
import { DsCard, DsHero, DsPage } from '../../designer/DesignerUiPrimitives';
import { designerPath } from '../../sites/urls';

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
    <DsPage>
      <DsHero
        eyebrow="Flow map"
        title={projectName || 'Recordings'}
        lead={
          <>
            Install the Chrome extension in <code>extension/</code>, paste a project upload token with{' '}
            <code>recordings:upload</code>, and upload a recorded journey. Recordings expire after 90 days.
          </>
        }
        actions={
          projectId ? (
            <Link to={designerPath(`/editor/${projectId}`)} className="btn btn-secondary">
              Open canvas
            </Link>
          ) : null
        }
      />

      {error ? (
        <DsCard>
          <p className="ds-error" style={{ margin: 0 }}>
            {error}
          </p>
        </DsCard>
      ) : null}

      <DsCard className="ds-table-card">
        <table className="ds-table">
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
                <td>
                  <span className="ds-badge">{r.status}</span>
                </td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
                <td>{new Date(r.expires_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && !error ? (
          <p className="ds-meta" style={{ marginTop: '1rem' }}>
            No recordings yet.
          </p>
        ) : null}
      </DsCard>
    </DsPage>
  );
}
