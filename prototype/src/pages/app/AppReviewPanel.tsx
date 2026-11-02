import { useEffect, useState } from 'react';
import { Button } from '@bareframe/react';
import { DEMO_REVIEW_ISSUES } from '../../designer/demoReviewProject';
import { getReviewRun, patchReviewIssue, startReview } from '../../app/reviewApi';

type Issue = {
  id: string;
  category: string;
  severity: string;
  title: string;
  explanation: string;
  fix: string;
  status: string;
};

export function AppReviewPanel({
  projectId,
  demoIssues,
}: {
  projectId: string;
  demoIssues?: boolean;
}) {
  const [runId, setRunId] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>(demoIssues ? [...DEMO_REVIEW_ISSUES] : []);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!runId) return;
    const t = setInterval(() => {
      void getReviewRun(projectId, runId).then((run) => {
        setStatus(run.status);
        setIssues(run.issues ?? []);
        if (run.status === 'completed' || run.status === 'failed') clearInterval(t);
      });
    }, 800);
    return () => clearInterval(t);
  }, [projectId, runId]);

  async function runReview() {
    if (demoIssues) return;
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

  return (
    <aside className="app-review-panel" aria-label="AI review">
      <header>
        <h2>AI review</h2>
        <p className="ds-meta">UX, gaps, a11y, consistency, and suggested fixes.</p>
      </header>
      <Button variant="primary" isDisabled={busy} onPress={() => void runReview()}>
        Run review pass
      </Button>
      {error ? <p className="app-error">{error}</p> : null}
      {status ? <p className="ds-meta">Status: {status}</p> : null}
      <ol className="app-review-issues">
        {issues.map((issue) => (
          <li key={issue.id} className={`app-review-issue severity-${issue.severity}`}>
            <span className="badge-pill">{issue.category.replace(/_/g, ' ')}</span>
            <strong>{issue.title}</strong>
            <p>{issue.explanation}</p>
            <p className="ds-meta">
              <strong>Fix:</strong> {issue.fix}
            </p>
            {issue.status === 'open' ? (
              <div className="app-actions">
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => void setIssueStatus(issue.id, 'resolved')}>
                  Resolve
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => void setIssueStatus(issue.id, 'dismissed')}>
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
