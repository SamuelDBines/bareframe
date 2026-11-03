import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@bareframe/react';
import { createProject, listProjects } from '../../designer/projectApi';
import { createFlowMap, fetchPlan, importFigmaDesign, startProCheckout } from '../../app/reviewApi';
import { NewProductPage } from '../designer/NewProductPage';

export function AppHomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [mode, setMode] = useState<'hub' | 'brief' | 'url' | 'figma'>('hub');
  const [importUrl, setImportUrl] = useState('');
  const [figmaUrl, setFigmaUrl] = useState('https://www.figma.com/design/demo/Hookoh');
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

  async function startFigmaImport() {
    if (!figmaUrl.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const p = await createProject('Figma import');
      await importFigmaDesign(p.id, figmaUrl.trim(), p.version);
      navigate(`/app/project/${p.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Figma import failed');
    } finally {
      setBusy(false);
    }
  }

  if (mode === 'figma') {
    return (
      <div className="app-shell-inner app-card">
        <h1>Import from Figma</h1>
        <p className="lead">
          Paste a Figma file or frame URL. We pull frames as screens and prototype links as flow connectors.
        </p>
        <label className="field">
          <span>Figma design URL</span>
          <input
            value={figmaUrl}
            onChange={(e) => setFigmaUrl(e.target.value)}
            placeholder="https://www.figma.com/design/…"
            data-testid="app-figma-url"
          />
        </label>
        <p className="ds-meta">Use a personal access token in project settings, or set FIGMA_ACCESS_TOKEN on the server.</p>
        {error ? <p className="app-error">{error}</p> : null}
        <div className="app-actions">
          <Button variant="secondary" onPress={() => setMode('hub')}>
            Cancel
          </Button>
          <Button variant="primary" isDisabled={busy} onPress={() => void startFigmaImport()}>
            Import from Figma
          </Button>
        </div>
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
        <p className="lead">Start from Figma, a product brief, a live site, or a blank flow map.</p>
      </header>
      <div className="grid-3">
        <article className="card app-start-card">
          <h3>Import Figma</h3>
          <p>Bring real frames and prototype links into a polished journey map.</p>
          <Button variant="primary" onPress={() => setMode('figma')}>
            Import from Figma
          </Button>
        </article>
        <article className="card app-start-card">
          <h3>Product brief</h3>
          <p>Generate journeys and screens with the Bareframe package pipeline.</p>
          <Button variant="secondary" onPress={() => setMode('brief')}>
            Start from brief
          </Button>
        </article>
        <article className="card app-start-card">
          <h3>Import URL</h3>
          <p>Screenshot pages and link them into a draft map (Pro).</p>
          <Button variant="ghost" onPress={() => setMode('url')}>
            Import website
          </Button>
        </article>
      </div>
      <div className="grid-3" style={{ marginTop: '1rem' }}>
        <article className="card app-start-card">
          <h3>Blank flow map</h3>
          <p>Place screens, draw connectors, and prototype click-throughs yourself.</p>
          <Button variant="ghost" isDisabled={busy} onPress={() => void startBlank()}>
            New blank project
          </Button>
        </article>
      </div>
      {error ? <p className="app-error">{error}</p> : null}
      {projects.length > 0 ? (
        <section className="app-card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
            <h2 style={{ margin: 0 }}>Your projects</h2>
            {planTier === 'free' ? (
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => void startProCheckout().then((r) => {
                if (r.checkoutUrl) window.location.href = r.checkoutUrl;
                else setError(r.message ?? 'Checkout unavailable');
              })}>
                Upgrade · £20/mo
              </button>
            ) : null}
          </div>
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
