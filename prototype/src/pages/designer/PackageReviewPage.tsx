import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@bareframe/react';
import {
  createShareLink,
  deliveryFlowUrl,
  exportZipUrl,
  fetchProductPackage,
  patchProductPackage,
  requestRevision,
} from '../../designer/packageApi';
import { fetchProject } from '../../designer/projectApi';
import { DEMO_PACKAGE_DOC } from '../../designer/demoPackageFixture';
import { getHookohDemoPreview } from '../../designer/demoHookohPreview';
import { swatchForTheme } from '../../designer/themeSwatches';
import { DsCard } from '../../designer/DesignerUiPrimitives';
import { FramePreview } from '../../designer/components/FramePreview';
import type { ThemeId } from '../../theme/themes';
import { designerPath } from '../../sites/urls';
import type { Frame, Page } from '../../designer/types';
import { friendlyError } from '../../app/apiError';

const TABS = [
  { id: 'product', label: 'Product' },
  { id: 'naming', label: 'Naming' },
  { id: 'branding', label: 'Branding' },
  { id: 'design', label: 'Directions' },
  { id: 'ia', label: 'IA' },
  { id: 'journeys', label: 'Journeys' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'copy', label: 'Copy' },
  { id: 'handoff', label: 'Handoff' },
  { id: 'review', label: 'Review' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function PackageReviewPage({ demo, appMode }: { demo?: boolean; appMode?: boolean } = {}) {
  const { packageId } = useParams<{ packageId: string }>();
  const [tab, setTab] = useState<TabId>('prototype');
  const [doc, setDoc] = useState<Record<string, unknown> | null>(demo ? DEMO_PACKAGE_DOC : null);
  const [meta, setMeta] = useState<{ name: string; designerProjectId?: string } | null>(
    demo ? { name: 'Hookoh', designerProjectId: undefined } : null,
  );
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [playJourneyId, setPlayJourneyId] = useState<string | null>('j_signup');
  const [playStep, setPlayStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [previewPage, setPreviewPage] = useState<Page | null>(null);
  const [previewFrame, setPreviewFrame] = useState<Frame | null>(null);

  useEffect(() => {
    if (demo || !packageId) return;
    fetchProductPackage(packageId)
      .then((res) => {
        setDoc(res.document as Record<string, unknown>);
        setMeta({ name: res.name, designerProjectId: res.designerProjectId });
        const journeys = (res.document as { journeys?: { id: string }[] }).journeys;
        if (journeys?.[0]) setPlayJourneyId(journeys[0].id);
      })
      .catch((e) => setError(friendlyError(e, 'Load failed')));
  }, [packageId, demo]);

  const journeys = (doc?.journeys ?? []) as {
    id: string;
    name: string;
    steps: { screen_id: string; action: string; next_screen_id: string | null }[];
  }[];
  const screens = (doc?.prototype as { screens?: { id: string; name: string; route: string }[] })?.screens ?? [];
  const designOptions = (doc?.design_options ?? []) as {
    id: string;
    name: string;
    bareframe_theme?: { base_theme: string };
  }[];

  const activeJourney = journeys.find((j) => j.id === playJourneyId) ?? journeys[0];
  const playScreenId = activeJourney?.steps[playStep]?.screen_id;
  const playScreen = screens.find((s) => s.id === playScreenId);

  const themeId = (() => {
    const selected = doc?.selected_direction as string | undefined;
    const opt = designOptions.find((d) => d.id === selected) ?? designOptions[0];
    return (opt?.bareframe_theme?.base_theme ?? 'simple') as ThemeId;
  })();

  useEffect(() => {
    const screenKey = playScreenId ?? playScreen?.id;
    if (!screenKey) {
      setPreviewPage(null);
      setPreviewFrame(null);
      return;
    }
    if (demo || !meta?.designerProjectId) {
      const { page, frame } = getHookohDemoPreview(screenKey);
      setPreviewPage(page);
      setPreviewFrame(frame);
      return;
    }
    if (!playScreen) return;
    fetchProject(meta.designerProjectId).then((res) => {
      const pages = res.document.project.pages;
      const page = pages.find((p) => p.routePath === playScreen.route || p.name === playScreen.name) ?? pages[0];
      const frame = res.document.project.frames.find((f) => f.pageId === page?.id) ?? res.document.project.frames[0];
      setPreviewPage(page ?? null);
      setPreviewFrame((frame ?? null) as Frame | null);
    });
  }, [playScreen, playScreenId, meta?.designerProjectId, demo]);

  async function selectDirection(id: string) {
    if (demo || !packageId) {
      setDoc((d) => (d ? { ...d, selected_direction: id } : d));
      return;
    }
    await patchProductPackage(packageId, { selectedDirection: id });
    setDoc((d) => (d ? { ...d, selected_direction: id } : d));
  }

  async function approve() {
    if (demo || !packageId) return;
    await patchProductPackage(packageId, { status: 'approved' });
    setDoc((d) => (d ? { ...d, status: 'approved' } : d));
  }

  if (error) {
    return (
      <div className="ds-review-workspace">
        <DsCard>
          <p style={{ margin: 0 }}>{error}</p>
        </DsCard>
      </div>
    );
  }
  if (!doc || !meta) {
    return (
      <div className="ds-review-workspace">
        <DsCard>
          <p className="ds-meta" style={{ margin: 0 }}>
            Loading package…
          </p>
        </DsCard>
      </div>
    );
  }

  return (
    <div className="ds-review-workspace">
      <header className="ds-review-topbar">
        <div className="ds-review-topbar__main">
          <p className="ds-eyebrow">Package review</p>
          <h1>{meta.name}</h1>
          <p className="ds-lead">{String(doc.summary)}</p>
        </div>
        <div className="ds-actions ds-review-topbar__actions">
          {meta.designerProjectId && !demo && (
            <Link
              to={
                appMode
                  ? `/app/project/${meta.designerProjectId}`
                  : designerPath(`/editor/${meta.designerProjectId}`)
              }
              className="btn btn-secondary"
            >
              Open in Designer
            </Link>
          )}
          {!demo && packageId && (
            <>
              <a className="btn btn-secondary" href={exportZipUrl(packageId)}>
                Download zip
              </a>
              <a className="btn btn-secondary" href={deliveryFlowUrl(packageId)}>
                Delivery Flow
              </a>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => createShareLink(packageId!).then((r) => setShareUrl(r.url))}
              >
                Share
              </button>
              <button type="button" className="btn btn-primary" onClick={() => approve()}>
                Approve
              </button>
            </>
          )}
        </div>
      </header>

      {shareUrl && (
        <div className="ds-review-banner">
          <p className="ds-meta" style={{ margin: 0 }}>
            Share: <a href={shareUrl}>{shareUrl}</a>
          </p>
        </div>
      )}

      <div className="ds-review-tabs-wrap">
        <div className="ds-tabs" role="tablist">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              className={tab === t.id ? 'active' : undefined}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'prototype' ? (
        <div className="ds-review-layout">
          <aside className="ds-review-sidebar">
            <section className="ds-review-panel">
              <h2>Journey</h2>
              <label className="ds-review-select">
                <span>Flow</span>
                <select
                  value={playJourneyId ?? ''}
                  onChange={(e) => {
                    setPlayJourneyId(e.target.value);
                    setPlayStep(0);
                  }}
                >
                  {journeys.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.name}
                    </option>
                  ))}
                </select>
              </label>

              {activeJourney ? (
                <ol className="ds-journey-steps" aria-label="Journey steps">
                  {activeJourney.steps.map((step, index) => {
                    const screen = screens.find((s) => s.id === step.screen_id);
                    const active = index === playStep;
                    return (
                      <li key={`${step.screen_id}-${index}`}>
                        <button
                          type="button"
                          className={`ds-journey-step${active ? ' active' : ''}`}
                          onClick={() => setPlayStep(index)}
                        >
                          <span className="ds-journey-step-num">{index + 1}</span>
                          <span className="ds-journey-step-body">
                            <strong>{screen?.name ?? step.screen_id}</strong>
                            <span className="ds-meta">{step.action}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              ) : null}

              <div className="ds-review-play-controls">
                <Button variant="secondary" isDisabled={playStep === 0} onPress={() => setPlayStep((s) => s - 1)}>
                  Back
                </Button>
                <Button
                  variant="primary"
                  isDisabled={!activeJourney || playStep >= activeJourney.steps.length - 1}
                  onPress={() => setPlayStep((s) => s + 1)}
                >
                  {activeJourney?.steps[playStep]?.action ?? 'Next'}
                </Button>
              </div>
            </section>

            <section className="ds-review-panel">
              <h2>Design direction</h2>
              <p className="ds-meta">Palette and typography preview — updates the playable prototype.</p>
              <div className="ds-direction-list">
                {designOptions.map((d) => {
                  const tid = (d.bareframe_theme?.base_theme ?? 'simple') as ThemeId;
                  const sw = swatchForTheme(tid);
                  const selected = doc.selected_direction === d.id;
                  return (
                    <button
                      key={d.id}
                      type="button"
                      className={`ds-direction-card${selected ? ' selected' : ''}`}
                      onClick={() => selectDirection(d.id)}
                    >
                      <div className="ds-direction-swatches" aria-hidden>
                        <span style={{ background: sw.surface }} title="Surface" />
                        <span style={{ background: sw.surfaceMuted }} title="Surface muted" />
                        <span style={{ background: sw.accent }} title="Accent" />
                        <span style={{ background: sw.text }} title="Text" />
                      </div>
                      <div className="ds-direction-meta">
                        <strong>{d.name}</strong>
                        <span className="ds-meta">
                          {sw.fontSample} · {tid}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="ds-review-panel ds-review-panel--muted">
              <h3>Screens in package</h3>
              <ul className="ds-screen-list">
                {screens.map((s) => (
                  <li key={s.id}>
                    <span>{s.name}</span>
                    <code>{s.route}</code>
                  </li>
                ))}
              </ul>
            </section>
          </aside>

          <main className="ds-review-stage">
            <div className="ds-review-stage__chrome">
              <span className="ds-meta">
                {playScreen?.name ?? 'Screen'} · {themeId} theme · @bareframe/react preview
              </span>
            </div>
            <div className="ds-review-stage__device">
              {previewPage && previewFrame ? (
                <FramePreview
                  frame={previewFrame}
                  page={previewPage}
                  themeId={themeId}
                  customTokens={{}}
                  selectedNodeId={null}
                  onSelectNode={() => undefined}
                />
              ) : (
                <p className="ds-meta">Preview loading…</p>
              )}
            </div>
          </main>
        </div>
      ) : (
        <div className="ds-review-body">
          <DsCard>
            <pre style={{ overflow: 'auto', maxHeight: '60vh', fontSize: '0.75rem', margin: 0 }}>
              {JSON.stringify(
                tab === 'review'
                  ? doc.review
                  : tab === 'design'
                    ? { selected: doc.selected_direction, options: doc.design_options }
                    : (doc as Record<string, unknown>)[tab === 'product' ? 'product' : tab],
                null,
                2,
              )}
            </pre>
          </DsCard>

          {tab === 'review' && !demo && packageId && (
            <DsCard>
              <h3>Request revision</h3>
              <RevisionForm
                onSubmit={async (deliverable, feedback) => {
                  await requestRevision(packageId, deliverable, feedback);
                  const refreshed = await fetchProductPackage(packageId);
                  setDoc(refreshed.document as Record<string, unknown>);
                }}
              />
            </DsCard>
          )}
        </div>
      )}
    </div>
  );
}

function RevisionForm({ onSubmit }: { onSubmit: (d: string, f: string) => Promise<void> }) {
  const [deliverable, setDeliverable] = useState('Product');
  const [feedback, setFeedback] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await onSubmit(deliverable, feedback);
          setFeedback('');
        } finally {
          setBusy(false);
        }
      }}
      className="ds-form-card"
      style={{ display: 'grid', gap: '0.75rem' }}
    >
      <label>
        <span>Deliverable</span>
        <select value={deliverable} onChange={(e) => setDeliverable(e.target.value)}>
          {TABS.filter((t) => t.id !== 'review').map((t) => (
            <option key={t.id} value={t.label}>
              {t.label}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Feedback</span>
        <textarea required rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      </label>
      <Button variant="secondary" type="submit" isDisabled={busy}>
        Submit revision
      </Button>
    </form>
  );
}
