import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchPackageConfig, fetchPackageUsage, startPackageGeneration } from '../../designer/packageApi';
import { DsCard, DsHero, DsPage } from '../../designer/DesignerUiPrimitives';
import { designerPath } from '../../sites/urls';
import { friendlyError } from '../../app/apiError';

const QUESTION_IDS = [
  'q1_problem',
  'q2_audience',
  'q3_first_action',
  'q4_money',
  'q5_feel',
  'q6_must_haves',
  'q7_avoid',
  'q8_existing_assets',
] as const;

export function NewProductPage({ appMode }: { appMode?: boolean } = {}) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [idea, setIdea] = useState('');
  const [audience, setAudience] = useState('');
  const [constraints, setConstraints] = useState('');
  const [refs, setRefs] = useState(['', '', '']);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<Awaited<ReturnType<typeof fetchPackageConfig>> | null>(null);
  const [usage, setUsage] = useState<{ packagesThisMonth: number; monthlyLimit: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetchPackageConfig().then(setConfig).catch(() => setConfig(null));
    if (status === 'authenticated') {
      fetchPackageUsage().then(setUsage).catch(() => undefined);
    }
  }, [status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (status !== 'authenticated') {
      setError('Sign in with GitHub to generate a product package.');
      return;
    }
    if (config && !config.llmConfigured) {
      setError('AI generation is taking a break right now. Your brief is safe here — try again later.');
      return;
    }
    setBusy(true);
    try {
      const references = refs
        .map((url, i) => ({ url: url.trim(), note: i === 0 ? 'Primary reference' : undefined }))
        .filter((r) => r.url);
      const answerMap: Record<string, string> = {};
      for (const id of QUESTION_IDS) {
        if (answers[id]?.trim()) answerMap[id] = answers[id].trim();
      }
      const { jobId } = await startPackageGeneration({
        idea,
        audience,
        constraints: constraints
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean),
        references,
        answers: answerMap,
      });
      navigate(appMode ? `/app/product/generating/${jobId}` : designerPath(`/product/generating/${jobId}`));
    } catch (err) {
      setError(friendlyError(err, 'Could not start generation'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <DsPage>
      <DsHero
        eyebrow="New project · Brief"
        title="Start from a short brief"
        lead="Describe what you’re building. We’ll draft the journeys and screens so you can map and review them." 
      />

      {config && !config.llmConfigured && (
        <div className="bx-notice" role="status" style={{ marginBottom: '1rem' }}>
          <span className="bx-notice__icon" aria-hidden>i</span>
          <p>
            <strong>AI generation is paused for now.</strong> You can still write your brief, or start from a Figma
            file or a live URL from your <Link to="/app">projects</Link>.
          </p>
        </div>
      )}

      {usage && (
        <DsCard>
          <p className="ds-meta" style={{ margin: 0 }}>
            Packages this month: {usage.packagesThisMonth} / {usage.monthlyLimit}
          </p>
        </DsCard>
      )}

      <DsCard className="ds-form-card">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label>
            Idea brief — what are you building?
            <textarea
              required
              rows={3}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g. A barber booking site for walk-in shops…"
            />
          </label>
          <label>
            Who is it for?
            <input
              required
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Primary audience"
            />
          </label>
          <label>
            Constraints (one per line)
            <textarea rows={2} value={constraints} onChange={(e) => setConstraints(e.target.value)} />
          </label>

          <fieldset className="ds-fieldset">
            <legend>Reference URLs (up to 3)</legend>
            {refs.map((r, i) => (
              <input
                key={i}
                type="url"
                value={r}
                onChange={(e) => {
                  const next = [...refs];
                  next[i] = e.target.value;
                  setRefs(next);
                }}
                placeholder="https://…"
              />
            ))}
          </fieldset>

          <div>
            <h3 style={{ margin: '0 0 0.35rem', fontSize: '1rem' }}>Intake questions</h3>
            <p className="ds-meta">
              Leave blank to accept Bareframe defaults — assumptions are recorded in the package.
            </p>
          </div>

          {(config?.intakeQuestions ?? []).map((q) => (
            <label key={q.id}>
              {q.label}
              <textarea
                rows={2}
                value={answers[q.id] ?? ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                placeholder={q.placeholder}
              />
            </label>
          ))}

          {error && <p className="ds-error">{error}</p>}

          <div className="ds-actions">
            <button type="submit" className="btn btn-primary" disabled={busy || (config ? !config.llmConfigured : false)}>
              {busy ? 'Starting…' : 'Generate flow'}
            </button>
            <Link to={appMode ? '/app' : designerPath('/')} className="btn btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </DsCard>
    </DsPage>
  );
}
