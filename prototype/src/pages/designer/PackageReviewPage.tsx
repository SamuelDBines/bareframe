import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  createShareLink,
  deliveryFlowUrl,
  exportZipUrl,
  fetchProductPackage,
  patchProductPackage,
  requestRevision,
} from '../../designer/packageApi';
import { designerPath } from '../../sites/urls';

const TABS = [
  { id: 'product', label: 'Product' },
  { id: 'naming', label: 'Naming' },
  { id: 'branding', label: 'Branding' },
  { id: 'design', label: 'Design directions' },
  { id: 'ia', label: 'IA' },
  { id: 'journeys', label: 'Journeys' },
  { id: 'prototype', label: 'Prototype' },
  { id: 'copy', label: 'Copy' },
  { id: 'handoff', label: 'Handoff' },
  { id: 'review', label: 'Review' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export function PackageReviewPage() {
  const { packageId } = useParams<{ packageId: string }>();
  const [tab, setTab] = useState<TabId>('prototype');
  const [doc, setDoc] = useState<Record<string, unknown> | null>(null);
  const [meta, setMeta] = useState<{ name: string; designerProjectId?: string } | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [playJourneyId, setPlayJourneyId] = useState<string | null>(null);
  const [playStep, setPlayStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!packageId) return;
    fetchProductPackage(packageId)
      .then((res) => {
        setDoc(res.document as Record<string, unknown>);
        setMeta({ name: res.name, designerProjectId: res.designerProjectId });
        const journeys = (res.document as { journeys?: { id: string }[] }).journeys;
        if (journeys?.[0]) setPlayJourneyId(journeys[0].id);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [packageId]);

  const journeys = (doc?.journeys ?? []) as {
    id: string;
    name: string;
    steps: { screen_id: string; action: string; next_screen_id: string | null }[];
  }[];
  const screens = (doc?.prototype as { screens?: { id: string; name: string }[] })?.screens ?? [];
  const designOptions = (doc?.design_options ?? []) as { id: string; name: string; bareframe_theme?: { base_theme: string } }[];

  const activeJourney = useMemo(
    () => journeys.find((j) => j.id === playJourneyId) ?? journeys[0],
    [journeys, playJourneyId],
  );

  const playScreenId = activeJourney?.steps[playStep]?.screen_id;
  const playScreen = screens.find((s) => s.id === playScreenId);

  async function selectDirection(id: string) {
    if (!packageId) return;
    await patchProductPackage(packageId, { selectedDirection: id });
    setDoc((d) => (d ? { ...d, selected_direction: id } : d));
  }

  async function approve() {
    if (!packageId) return;
    await patchProductPackage(packageId, { status: 'approved' });
    setDoc((d) => (d ? { ...d, status: 'approved' } : d));
  }

  if (error) return <p className="card">{error}</p>;
  if (!doc || !meta) return <p className="card">Loading package…</p>;

  return (
    <div className="package-review">
      <div className="page-hero" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <p className="badge-pill success">Package review</p>
          <h1>{meta.name}</h1>
          <p className="lead">{String(doc.summary)}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {meta.designerProjectId && (
            <Link to={designerPath(`/editor/${meta.designerProjectId}`)} className="btn btn-secondary">
              Open in Designer
            </Link>
          )}
          <a className="btn btn-secondary" href={exportZipUrl(packageId!)}>
            Download zip
          </a>
          <a className="btn btn-secondary" href={deliveryFlowUrl(packageId!)}>
            Delivery Flow JSON
          </a>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => createShareLink(packageId!).then((r) => setShareUrl(r.url))}
          >
            Share link
          </button>
          <button type="button" className="btn btn-primary" onClick={() => approve()}>
            Approve package
          </button>
        </div>
      </div>

      {shareUrl && (
        <p className="card">
          Read-only share: <a href={shareUrl}>{shareUrl}</a>
        </p>
      )}

      <nav className="subnav" aria-label="Deliverables" style={{ marginBottom: '1rem' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'active' : undefined}
            onClick={() => setTab(t.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0.75rem' }}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'prototype' && (
        <div className="grid-2">
          <section className="card">
            <h2>Play journeys</h2>
            <label>
              Journey
              <select
                value={playJourneyId ?? ''}
                onChange={(e) => {
                  setPlayJourneyId(e.target.value);
                  setPlayStep(0);
                }}
                style={{ display: 'block', marginTop: '0.35rem' }}
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
                <p style={{ marginTop: '1rem' }}>
                  Step {playStep + 1} of {activeJourney.steps.length}:{' '}
                  <strong>{playScreen?.name ?? playScreenId}</strong>
                </p>
                <p style={{ fontSize: '0.9rem' }}>{activeJourney.steps[playStep]?.action}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={playStep === 0}
                    onClick={() => setPlayStep((s) => s - 1)}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={playStep >= activeJourney.steps.length - 1}
                    onClick={() => setPlayStep((s) => s + 1)}
                  >
                    {activeJourney.steps[playStep]?.action ?? 'Next'}
                  </button>
                </div>
              </>
            )}
          </section>
          <section className="card">
            <h2>Design direction (live theme)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {designOptions.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`btn ${doc.selected_direction === d.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => selectDirection(d.id)}
                >
                  {d.name} · {d.bareframe_theme?.base_theme ?? 'theme'}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {tab !== 'prototype' && (
        <pre className="card" style={{ overflow: 'auto', maxHeight: '70vh', fontSize: '0.8rem' }}>
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
      )}

      {tab === 'review' && (
        <section className="card" style={{ marginTop: '1rem' }}>
          <h3>Request a revision</h3>
          <RevisionForm
            onSubmit={async (deliverable, feedback) => {
              await requestRevision(packageId!, deliverable, feedback);
              const refreshed = await fetchProductPackage(packageId!);
              setDoc(refreshed.document as Record<string, unknown>);
            }}
          />
        </section>
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
      style={{ display: 'grid', gap: '0.5rem' }}
    >
      <select value={deliverable} onChange={(e) => setDeliverable(e.target.value)}>
        {TABS.filter((t) => t.id !== 'review').map((t) => (
          <option key={t.id} value={t.label}>
            {t.label}
          </option>
        ))}
      </select>
      <textarea required rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What should change?" />
      <button type="submit" className="btn btn-secondary" disabled={busy}>
        Submit revision (uses 1 round)
      </button>
    </form>
  );
}
