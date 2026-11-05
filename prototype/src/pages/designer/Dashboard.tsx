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
import { listProductPackages, type PackageSummary } from '../../designer/packageApi';
import { fromProjectDocument } from '../../designer/localProject';
import { createInitialProject } from '../../designer/initialProject';
import { designerPath } from '../../sites/urls';
import { DsCard, DsHero, DsPage } from '../../designer/DesignerUiPrimitives';
import { friendlyError } from '../../app/apiError';

export function DesignerDashboard() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ApiProjectSummary[]>([]);
  const [packages, setPackages] = useState<PackageSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    listProjects()
      .then(setProjects)
      .catch((err) => setError(friendlyError(err, 'Failed to load projects')));
    listProductPackages()
      .then(setPackages)
      .catch(() => setPackages([]));
  }, [status]);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      const created = await createProject('Untitled project');
      navigate(designerPath(`/editor/${created.id}`));
    } catch (err) {
      setError(friendlyError(err, 'Could not create project'));
    } finally {
      setBusy(false);
    }
  }

  async function handleMigrateLocal() {
    const local = loadLocalProject();
    const project = local ? fromProjectDocument(local.document) : createInitialProject();
    setBusy(true);
    try {
      const migrated = await migrateLocalProjectToServer(project);
      navigate(designerPath(`/editor/${migrated.id}`));
    } catch (err) {
      setError(friendlyError(err, 'Migration failed'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DsPage>
      <DsHero
        eyebrow="Bareframe Designer"
        title="Prototype-first product design"
        lead="Turn a brief into a reviewable package: journeys, playable screens, and handoff — built from real @bareframe/react components."
        actions={
          <>
            <Link to={designerPath('/product/new')} className="btn btn-primary">
              New product
            </Link>
            <Link to={designerPath('/editor')} className="btn btn-secondary">
              Open canvas
            </Link>
          </>
        }
      />

      {error && (
        <DsCard>
          <p style={{ color: 'var(--bf-theme-danger, #b42318)', margin: 0 }}>{error}</p>
        </DsCard>
      )}

      {status !== 'authenticated' && (
        <DsCard>
          <p className="ds-meta" style={{ margin: 0 }}>
            Sign in with GitHub to sync projects, generate packages, and share review links.
          </p>
        </DsCard>
      )}

      {packages.length > 0 && (
        <section>
          <h2 style={{ fontSize: '1.125rem', marginBottom: '0.75rem' }}>Product packages</h2>
          <div className="ds-grid">
            {packages.map((pkg) => (
              <DsCard key={pkg.id} className="ds-project-card">
                <h3>{pkg.name}</h3>
                <p className="ds-meta">
                  {pkg.status} · revision {pkg.revision}
                </p>
                <div className="ds-actions">
                  <Link to={designerPath(`/product/${pkg.id}`)} className="btn btn-primary">
                    Review package
                  </Link>
                </div>
              </DsCard>
            ))}
          </div>
        </section>
      )}

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.125rem', margin: 0 }}>Canvas projects</h2>
          {status === 'authenticated' && (
            <div className="ds-actions">
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={handleMigrateLocal}>
                Migrate local
              </button>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={handleCreate}>
                New project
              </button>
            </div>
          )}
        </div>
        <div className="ds-grid">
          {projects.map((p) => (
            <DsCard key={p.id} className="ds-project-card">
              <h3>{p.name}</h3>
              <p className="ds-meta">
                v{p.version}
                {p.updatedAt ? ` · ${new Date(p.updatedAt).toLocaleDateString()}` : null}
              </p>
              <div className="ds-actions">
                <Link to={designerPath(`/editor/${p.id}`)} className="btn btn-primary">
                  Open canvas
                </Link>
                <Link to={designerPath(`/recordings/${p.id}`)} className="btn btn-ghost">
                  Flow map
                </Link>
              </div>
            </DsCard>
          ))}
          {projects.length === 0 && status === 'authenticated' && (
            <DsCard>
              <p className="ds-meta" style={{ margin: 0 }}>
                No cloud projects yet — start from the canvas or generate a product package.
              </p>
            </DsCard>
          )}
        </div>
      </section>
    </DsPage>
  );
}
