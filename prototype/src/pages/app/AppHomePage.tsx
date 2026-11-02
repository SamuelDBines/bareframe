import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@bareframe/react';
import { createProject, listProjects } from '../../designer/projectApi';
import { fetchPlan } from '../../app/reviewApi';
import { NewProductPage } from '../designer/NewProductPage';

export function AppHomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [mode, setMode] = useState<'hub' | 'brief' | 'url'>('hub');
  const [importUrl, setImportUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [planTier, setPlanTier] = useState<'free' | 'pro' | null>(null);

  useEffect(() => {
    listProjects()
      .then((rows) => setProjects(rows))
      .catch(() => setProjects([]));
    fetchPlan()
      .then((p) => setPlanTier(p.tier === 'pro' ? 'pro' : 'free'))
      .catch(() => setPlanTier(null));
  }, []);

  async function startBlank() {
    setBusy(true);
    setError(null);
    try {
      const p = await createProject('Untitled journey');
      navigate(`/app/project/${p.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create project');
    } finally {
      setBusy(false);
    }
  }

  async function startUrlImport() {
    if (!importUrl.trim()) return;
    if (planTier === 'free') {
      setError('URL import requires Bareframe Pro (£20/month).');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const p = await createProject(`Import: ${new URL(importUrl).hostname}`);
      const { createFlowMap } = await import('../../app/reviewApi');
      await createFlowMap(p.id, importUrl.trim(), p.version);
      navigate(`/app/project/${p.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed');
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'brief') {
    return (
      <div className="app-shell-inner">
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMode('hub')}>
          ← Back
        </button>
        <NewProductPage appMode />
      </div>
    );
  }

  if (mode === 'url') {
    return (
      <div className="app-shell-inner app-card">
        <h1>Import a live URL</h1>
        <p className="lead">We screenshot pages and follow links to draft a journey map on your canvas.</p>
        <label className="field">
          <span>Website URL</span>
          <input value={importUrl} onChange={(e) => setImportUrl(e.target.value)} placeholder="https://example.com" />
        </label>
        {error ? <p className="app-error">{error}</p> : null}
        <div className="app-actions">
          <Button variant="secondary" onPress={() => setMode('hub')}>
            Cancel
          </Button>
          <Button variant="primary" isDisabled={busy} onPress={() => void startUrlImport()}>
            Import journey
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell-inner">
      <header className="app-hero">
        <p className="badge-pill success">Journey canvas</p>
        <h1>Map flows. Review with AI.</h1>
        <p className="lead">Start from a brief, import a live site, or open a blank canvas.</p>
      </header>
      <div className="grid-3">
        <article className="card app-start-card">
          <h3>Product brief</h3>
          <p>Generate journeys and screens with the Bareframe package pipeline.</p>
          <Button variant="primary" onPress={() => setMode('brief')}>
            Start from brief
          </Button>
        </article>
        <article className="card app-start-card">
          <h3>Import URL</h3>
          <p>Screenshot pages and link them into a draft map (Pro).</p>
          <Button variant="secondary" onPress={() => setMode('url')}>
            Import website
          </Button>
        </article>
        <article className="card app-start-card">
          <h3>Blank canvas</h3>
          <p>Place screens, connectors, and journeys yourself.</p>
          <Button variant="ghost" isDisabled={busy} onPress={() => void startBlank()}>
            New blank project
          </Button>
        </article>
      </div>
      {error ? <p className="app-error">{error}</p> : null}
      {projects.length > 0 ? (
        <section className="app-card" style={{ marginTop: '2rem' }}>
          <h2>Your projects</h2>
          <ul className="app-project-list">
            {projects.map((p) => (
              <li key={p.id}>
                <Link to={`/app/project/${p.id}`}>{p.name}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
