import { useEffect, useMemo, useState } from 'react';
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
import { DsCard, DsHero, DsPage } from '../../designer/DesignerUiPrimitives';
import { FramePreview } from '../../designer/components/FramePreview';
import { createInitialProject } from '../../designer/initialProject';
import type { ThemeId } from '../../theme/themes';
import { designerPath } from '../../sites/urls';
import type { Frame, Page } from '../../designer/types';

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

export function PackageReviewPage({ demo }: { demo?: boolean }) {
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

  const demoProject = useMemo(() => createInitialProject(), []);

  useEffect(() => {
    if (demo || !packageId) return;
    fetchProductPackage(packageId)
      .then((res) => {
        setDoc(res.document as Record<string, unknown>);
        setMeta({ name: res.name, designerProjectId: res.designerProjectId });
        const journeys = (res.document as { journeys?: { id: string }[] }).journeys;
        if (journeys?.[0]) setPlayJourneyId(journeys[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
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
    if (!playScreen) {
      setPreviewPage(demoProject.pages[0] ?? null);
      setPreviewFrame(demoProject.frames[0] ?? null);
      return;
    }
    const designerProjectId = meta?.designerProjectId;
    if (!designerProjectId || demo) {
      setPreviewPage(demoProject.pages[0] ?? null);
      setPreviewFrame(demoProject.frames[0] ?? null);
      return;
    }
    fetchProject(designerProjectId).then((res) => {
      const pages = res.document.project.pages;
      const page = pages.find((p) => p.routePath === playScreen.route || p.name === playScreen.name) ?? pages[0];
      const frame = res.document.project.frames.find((f) => f.pageId === page?.id) ?? res.document.project.frames[0];
      setPreviewPage(page ?? null);
      setPreviewFrame((frame ?? null) as Frame | null);
    });
  }, [playScreen, meta?.designerProjectId, demo, demoProject]);

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

  if (error) return <DsPage><DsCard><p style={{ margin: 0 }}>{error}</p></DsCard></DsPage>;
  if (!doc || !meta) return <DsPage><DsCard><p className="ds-meta" style={{ margin: 0 }}>Loading package…</p></DsCard></DsPage>;

  return (
    <DsPage>
      <DsHero
        eyebrow="Package review"
        title={meta.name}
        lead={String(doc.summary)}
        actions={
          <>
            {meta.designerProjectId && !demo && (
              <Link to={designerPath(`/editor/${meta.designerProjectId}`)} className="btn btn-secondary">
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
          </>
        }
      />

      {shareUrl && (
        <DsCard>
          <p className="ds-meta" style={{ margin: 0 }}>
            Share: <a href={shareUrl}>{shareUrl}</a>
          </p>
        </DsCard>
      )}

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

      {tab === 'prototype' && (
        <div className="ds-split">
          <DsCard>
            <h2 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Play journeys</h2>
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Journey</span>
              <select
                value={playJourneyId ?? ''}
                onChange={(e) => {
                  setPlayJourneyId(e.target.value);
                  setPlayStep(0);
                }}
                style={{ width: '100%', marginTop: '0.35rem', padding: '0.5rem' }}
              >
                {journeys.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name}
                  </option>
                ))}
              </select>
            </label>
            {activeJourney && (
              <>
                <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                  Step {playStep + 1} of {activeJourney.steps.length}:{' '}
                  <strong>{playScreen?.name ?? playScreenId}</strong>
                </p>
                <p className="ds-meta">{activeJourney.steps[playStep]?.action}</p>
                <div className="ds-actions" style={{ marginTop: '1rem' }}>
                  <Button variant="secondary" isDisabled={playStep === 0} onPress={() => setPlayStep((s) => s - 1)}>
                    Back
                  </Button>
                  <Button
                    variant="primary"
                    isDisabled={playStep >= activeJourney.steps.length - 1}
                    onPress={() => setPlayStep((s) => s + 1)}
                  >
                    {activeJourney.steps[playStep]?.action ?? 'Next'}
                  </Button>
                </div>
              </>
            )}
            <h3 style={{ fontSize: '0.875rem', marginTop: '1.5rem', marginBottom: '0.5rem' }}>Design direction</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {designOptions.map((d) => (
                <Button
                  key={d.id}
                  variant={doc.selected_direction === d.id ? 'primary' : 'secondary'}
                  onPress={() => selectDirection(d.id)}
                >
                  {d.name}
                </Button>
              ))}
            </div>
          </DsCard>
          <DsCard className="ds-play-frame">
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
          </DsCard>
        </div>
      )}

      {tab !== 'prototype' && (
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
      )}

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
    </DsPage>
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
