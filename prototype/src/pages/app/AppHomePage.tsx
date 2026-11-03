import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Badge, Button, Card, Field } from '@bareframe/react';
import { createProject, listProjects } from '../../designer/projectApi';
import { createFlowMap, fetchPlan, importFigmaDesign, startProCheckout } from '../../app/reviewApi';
import {
  AppFormActions,
  AppFormPanel,
  AppInlineNotice,
  AppPage,
  AppPageHeader,
} from '../../app/AppUi';

export function AppHomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [mode, setMode] = useState<'hub' | 'url' | 'figma'>('hub');
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
      setError('URL import is included with Bareframe Pro (£20/month).');
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
      <AppPage narrow>
        <button type="button" className="app-back-link" onClick={() => setMode('hub')}>
          ← Back to hub
        </button>
        <AppPageHeader
          title="Import from Figma"
          lead="Paste a Figma file or frame URL. We pull frames as screens and prototype links as flow connectors."
        />
        <AppFormPanel>
          <div className="app-form-stack">
            <div data-testid="app-figma-url">
            <Field
              label="Figma design URL"
              value={figmaUrl}
              onChange={setFigmaUrl}
              hint="https://www.figma.com/design/…"
            />
            </div>
            <p className="app-muted-inline">
              Add a personal access token in project settings, or ask your admin to configure Figma on the server.
            </p>
            {error ? (
              <p className="app-field-error" role="alert">
                {error}
              </p>
            ) : null}
            <AppFormActions>
              <Button variant="secondary" onPress={() => setMode('hub')}>
                Cancel
              </Button>
              <Button variant="primary" isDisabled={busy} onPress={() => void startFigmaImport()}>
                Import from Figma
              </Button>
            </AppFormActions>
          </div>
        </AppFormPanel>
      </AppPage>
    );
  }

  if (mode === 'url') {
    return (
      <AppPage narrow>
        <button type="button" className="app-back-link" onClick={() => setMode('hub')}>
          ← Back to hub
        </button>
        <AppPageHeader
          title="Import a live URL"
          lead="We capture pages and follow links to draft a journey map on your canvas."
        />
        <AppFormPanel>
          <div className="app-form-stack">
            <Field
              label="Website URL"
              value={importUrl}
              onChange={setImportUrl}
              hint="https://example.com"
            />
            {error ? (
              <p className="app-field-error" role="alert">
                {error}
              </p>
            ) : null}
            <AppFormActions>
              <Button variant="secondary" onPress={() => setMode('hub')}>
                Cancel
              </Button>
              <Button variant="primary" isDisabled={busy} onPress={() => void startUrlImport()}>
                Import journey
              </Button>
            </AppFormActions>
          </div>
        </AppFormPanel>
      </AppPage>
    );
  }

  return (
    <AppPage>
      <AppPageHeader
        eyebrow="Journey canvas"
        title="Map flows. Review with AI."
        lead="Start from Figma, a short brief, a live site, or a blank flow map — then run a structured UX review."
        actions={
          <Link to="/demo/flow-map" className="app-hero-cta">
            <Button variant="primary">Try live demo</Button>
          </Link>
        }
      />

      <Card variant="elevated" className="app-demo-spotlight">
        <div className="app-demo-spotlight__copy">
          <Badge variant="success">No sign-in</Badge>
          <h2>See the flow map product</h2>
          <p>
            Cards, connectors, minimap, and sample AI callouts — the same canvas signed-in users get on every project.
          </p>
        </div>
        <Link to="/demo/flow-map">
          <Button variant="secondary">Open flow map demo</Button>
        </Link>
      </Card>

      <div className="app-start-grid">
        <Card variant="outlined" className="app-start-card" title="Import Figma">
          <p>Bring real frames and prototype links into a polished journey map.</p>
          <Button variant="primary" onPress={() => setMode('figma')}>
            Import from Figma
          </Button>
        </Card>
        <Card variant="outlined" className="app-start-card" title="Start from brief">
          <p>Describe the journey in plain language and open a flow canvas to refine it.</p>
          <Button variant="secondary" onPress={() => navigate('/app/product/new')}>
            New project brief
          </Button>
        </Card>
        <Card variant="outlined" className="app-start-card" title="Import URL">
          <p>Screenshot pages and link them into a draft map.</p>
          <Badge variant="outline">Pro</Badge>
          <Button variant="ghost" onPress={() => setMode('url')}>
            Import website
          </Button>
        </Card>
        <Card variant="outlined" className="app-start-card" title="Blank flow map">
          <p>Place screens, draw connectors, and prototype click-throughs yourself.</p>
          <Button variant="ghost" isDisabled={busy} onPress={() => void startBlank()}>
            New blank project
          </Button>
        </Card>
      </div>

      {error ? (
        <p className="app-field-error" role="alert">
          {error}
        </p>
      ) : null}

      {projects.length > 0 ? (
        <AppFormPanel title="Your projects">
          <div className="app-project-list-header">
            {planTier === 'free' ? (
              <Button
                variant="secondary"
                size="sm"
                onPress={() =>
                  void startProCheckout().then((r) => {
                    if (r.checkoutUrl) window.location.href = r.checkoutUrl;
                    else setError(r.message ?? 'Checkout unavailable');
                  })
                }
              >
                Upgrade · £20/mo
              </Button>
            ) : null}
          </div>
          <ul className="app-project-list app-project-list--polished">
            {projects.map((p) => (
              <li key={p.id}>
                <Link to={`/app/project/${p.id}`}>{p.name}</Link>
                <span className="app-muted-inline">Open canvas →</span>
              </li>
            ))}
          </ul>
        </AppFormPanel>
      ) : (
        <AppInlineNotice variant="info" title="No projects yet">
          Pick an option above, or explore the{' '}
          <Link to="/demo/flow-map">public flow map demo</Link> to see the canvas in action.
        </AppInlineNotice>
      )}
    </AppPage>
  );
}
