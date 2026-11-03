import { useEffect, useState } from 'react';
import { Button } from '@bareframe/react';
import { DEMO_REVIEW_ISSUES } from '../../designer/demoReviewProject';
import {
  getReviewRun,
  patchReviewIssue,
  startProCheckout,
  startReview,
} from '../../app/reviewApi';

type Issue = {
  id: string;
  category: string;
  severity: string;
  title: string;
  explanation: string;
  fix: string;
  status: string;
};

type ReviewDiff = {
  added: { title: string; category: string }[];
  removed: { title: string; category: string }[];
  unchanged: number;
};

type ReviewSummary = {
  changedFromPrevious?: boolean;
  diff?: ReviewDiff | null;
};

export function AppReviewPanel({
  projectId,
  demoIssues,
  showUpgrade,
}: {
  projectId: string;
  demoIssues?: boolean;
  showUpgrade?: boolean;
}) {
  const [runId, setRunId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>(demoIssues ? [...DEMO_REVIEW_ISSUES] : []);
  const [summary, setSummary] = useState<ReviewSummary | null>(
    demoIssues
      ? {
          changedFromPrevious: false,
          diff: null,
        }
      : null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!runId) return;
    const t = setInterval(() => {
      void getReviewRun(projectId, runId).then((run) => {
        setStatus(run.status);
        setIssues(run.issues ?? []);
        setSummary(run.summary ?? null);
        if (run.status === 'completed' || run.status === 'failed') clearInterval(t);
      });
    }, 800);
    return () => clearInterval(t);
  }, [projectId, runId]);

  async function runReview() {
    if (demoIssues) {
      setStatus('completed');
      setError(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await startReview(projectId);
      setRunId(res.runId);
      setStatus(res.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Review failed');
    } finally {
      setBusy(false);
    }
  }

  async function setIssueStatus(issueId: string, next: 'resolved' | 'dismissed') {
    if (!runId) return;
    await patchReviewIssue(projectId, runId, issueId, next);
    setIssues((prev) => prev.map((i) => (i.id === issueId ? { ...i, status: next } : i)));
  }

  async function upgrade() {
    try {
      const result = await startProCheckout();
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      setCheckoutMsg(result.message ?? 'Configure Stripe env vars to enable checkout.');
    } catch (e) {
      setCheckoutMsg(e instanceof Error ? e.message : 'Checkout failed');
    }
  }

  const diff = summary?.diff;

  return (
    <aside
      className={`app-review-panel${demoIssues ? ' app-review-panel--demo' : ''}`}
      aria-label="AI review"
    >
      <header>
        <h2>AI review</h2>
        <p className="app-review-panel__intro">UX gaps, accessibility, consistency, and suggested fixes on your map.</p>
      </header>
      <div className="app-form-actions">
        <Button variant="primary" isDisabled={busy} onPress={() => void runReview()}>
          {busy ? 'Starting…' : demoIssues ? 'Replay sample review' : 'Run review pass'}
        </Button>
        {showUpgrade ? (
          <Button variant="secondary" size="sm" onPress={() => void upgrade()}>
            Pro · £20/mo
          </Button>
        ) : null}
      </div>
      {demoIssues ? (
        <p className="app-review-panel__demo-hint">Interactive demo — sample issues are loaded below.</p>
      ) : null}
      {checkoutMsg ? <p className="ds-meta">{checkoutMsg}</p> : null}
      {error ? <p className="app-error">{error}</p> : null}
      {status ? <p className="ds-meta">Status: {status}</p> : null}
      {summary?.changedFromPrevious && diff ? (
        <div className="app-review-diff card" style={{ marginTop: '0.75rem', padding: '0.75rem' }}>
          <strong>Changes since last run</strong>
          {diff.added.length > 0 ? (
            <p className="ds-meta">
              New: {diff.added.map((d) => d.title).join('; ')}
            </p>
          ) : null}
          {diff.removed.length > 0 ? (
            <p className="ds-meta">
              Resolved or removed: {diff.removed.map((d) => d.title).join('; ')}
            </p>
          ) : null}
          {diff.unchanged > 0 ? <p className="ds-meta">{diff.unchanged} open issue(s) unchanged</p> : null}
        </div>
      ) : null}
      <ol className="app-review-issues">
        {issues.map((issue) => (
          <li key={issue.id} className={`app-review-issue severity-${issue.severity}`}>
            <span className="bf-badge bf-badge--outline">{issue.category.replace(/_/g, ' ')}</span>
            <strong>{issue.title}</strong>
            <p>{issue.explanation}</p>
            <p className="ds-meta">
              <strong>Fix:</strong> {issue.fix}
            </p>
            {issue.status === 'open' ? (
              <div className="app-actions">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={() => void setIssueStatus(issue.id, 'resolved')}
                >
                  Resolve
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => void setIssueStatus(issue.id, 'dismissed')}
                >
                  Dismiss
                </button>
              </div>
            ) : (
              <span className="ds-meta">{issue.status}</span>
            )}
          </li>
        ))}
      </ol>
    </aside>
  );
}
