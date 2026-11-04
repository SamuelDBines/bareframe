import { apiFail } from './apiError';

export type ReviewIssue = {
  id: string;
  category: string;
  severity: 'critical' | 'major' | 'minor' | 'info' | string;
  title: string;
  explanation: string;
  fix: string;
  status: 'open' | 'resolved' | 'dismissed' | string;
  frameId?: string;
  annotationId?: string;
};

export async function createProjectShare(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/share`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) await apiFail(res, 'Could not create share link');
  return res.json() as Promise<{ token: string; sharePath: string; publicUrl: string }>;
}

export async function fetchPlan() {
  const res = await fetch('/api/plan', { credentials: 'include' });
  if (!res.ok) await apiFail(res, 'Failed to load plan');
  return res.json();
}

export async function startReview(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/reviews`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) await apiFail(res, 'Review failed to start');
  return res.json() as Promise<{ runId: string; status: string }>;
}

export async function getReviewRun(projectId: string, runId: string) {
  const res = await fetch(`/api/projects/${projectId}/reviews/${runId}`, { credentials: 'include' });
  if (!res.ok) await apiFail(res, 'Review not found');
  return res.json() as Promise<{
    status: string;
    issues?: ReviewIssue[];
    summary?: { changedFromPrevious?: boolean; diff?: unknown } | null;
  }>;
}

export async function patchReviewIssue(
  projectId: string,
  runId: string,
  issueId: string,
  status: 'open' | 'resolved' | 'dismissed',
) {
  const res = await fetch(`/api/projects/${projectId}/reviews/${runId}/issues/${issueId}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) await apiFail(res, 'Update failed');
  return res.json();
}

export async function createFlowMap(projectId: string, url: string, baseVersion: number) {
  const res = await fetch(`/api/projects/${projectId}/flow-maps`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, baseVersion }),
  });
  if (!res.ok) await apiFail(res, 'Import failed');
  return res.json();
}

export async function fetchFigmaTokenStatus() {
  const res = await fetch('/api/me/figma-token', { credentials: 'include' });
  if (!res.ok) await apiFail(res, 'Could not load Figma settings');
  return res.json() as Promise<{ configured: boolean; source: 'user' | 'server' | null }>;
}

export async function saveFigmaToken(token: string) {
  const res = await fetch('/api/me/figma-token', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) await apiFail(res, 'Could not save token');
  return res.json() as Promise<{ ok: boolean; configured: boolean }>;
}

export async function importFigmaDesign(
  projectId: string,
  url: string,
  baseVersion: number,
  token?: string,
) {
  const res = await fetch(`/api/projects/${projectId}/figma-import`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, baseVersion, token }),
  });
  if (!res.ok) await apiFail(res, 'Figma import failed');
  return res.json() as Promise<{
    version: number;
    framesImported: number;
    connectorsImported: number;
    fileName: string;
  }>;
}

export async function fetchPublicShare(token: string) {
  const res = await fetch(`/api/share/${token}`);
  if (!res.ok) await apiFail(res, 'Share link not found');
  const type = res.headers.get('content-type') ?? '';
  // Static hosting without the API answers with index.html; treat that as "not found".
  if (!type.includes('json')) await apiFail(new Response(null, { status: 404 }), 'Share link not found');
  return res.json();
}

export async function fetchBillingConfig() {
  const res = await fetch('/api/billing/config');
  if (!res.ok) await apiFail(res, 'Billing config unavailable');
  return res.json() as Promise<{ stripeEnabled: boolean; priceLabel: string; planName: string }>;
}

export async function startProCheckout(): Promise<{
  checkoutUrl?: string;
  message?: string;
  disabled?: boolean;
}> {
  const res = await fetch('/api/billing/checkout', { method: 'POST', credentials: 'include' });
  if (res.status === 503) {
    return { disabled: true, message: 'Upgrades open soon. Your free plan keeps working in the meantime.' };
  }
  if (!res.ok) await apiFail(res, 'Checkout failed');
  return res.json();
}

export async function listReviewRuns(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/reviews`, { credentials: 'include' });
  if (!res.ok) await apiFail(res, 'Failed to list reviews');
  return res.json() as Promise<{ runs: { id: string; status: string }[] }>;
}
