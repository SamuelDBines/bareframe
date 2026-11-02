import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { fetchPackageConfig, fetchPackageUsage, startPackageGeneration } from '../../designer/packageApi';
import { designerPath } from '../../sites/urls';

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

export function NewProductPage() {
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
      setError(
        'Generation is not available: the server LLM is not configured (LLM_API_BASE_URL, LLM_API_KEY, LLM_MODEL).',
      );
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
      navigate(designerPath(`/product/generating/${jobId}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start generation');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-hero">
        <p className="badge-pill">Bareframe product</p>
        <h1>New product</h1>
        <p className="lead">
          One brief in — a reviewable <code>bareframe.package</code> out: definition, brand, journeys, and a playable
          prototype built from real @bareframe/react components.
        </p>
      </div>

      {config && !config.llmConfigured && (
        <div className="card" role="alert" style={{ borderColor: 'var(--bf-theme-warning, #b45309)' }}>
          <strong>LLM not configured.</strong> Generation is disabled until production secrets are set on the API. The
          form below is visible so you can prepare a brief; submit will not run until the server is configured.
        </div>
      )}

      {usage && (
        <p className="card" style={{ fontSize: '0.9rem' }}>
          Packages this month: {usage.packagesThisMonth} / {usage.monthlyLimit}
        </p>
      )}

      <form className="card" onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
        <label>
          <strong>Idea brief — what are you building?</strong>
          <textarea
            required
            rows={3}
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. A barber booking site for walk-in shops…"
            style={{ width: '100%', marginTop: '0.35rem' }}
          />
        </label>
        <label>
          <strong>Who is it for?</strong>
          <input
            required
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="Primary audience"
            style={{ width: '100%', marginTop: '0.35rem' }}
          />
        </label>
        <label>
          <strong>Constraints (one per line)</strong>
          <textarea
            rows={2}
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            style={{ width: '100%', marginTop: '0.35rem' }}
          />
        </label>
        <fieldset>
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
              style={{ width: '100%', marginBottom: '0.35rem' }}
            />
          ))}
        </fieldset>

        <h3>Intake questions</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--bf-theme-text-2, #64748b)' }}>
          Leave blank to accept Bareframe defaults — assumptions are recorded in the package.
        </p>
        {(config?.intakeQuestions ?? []).map((q) => (
          <label key={q.id}>
            {q.label}
            <textarea
              rows={2}
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
              placeholder={q.placeholder}
              style={{ width: '100%', marginTop: '0.35rem' }}
            />
          </label>
        ))}

        {error && <p style={{ color: 'var(--bf-theme-danger, #b42318)' }}>{error}</p>}

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="submit" className="btn btn-primary" disabled={busy}>
            Generate package
          </button>
          <Link to={designerPath('/')} className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
