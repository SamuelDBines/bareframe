export async function createProjectShare(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/share`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Could not create share link');
  return res.json() as Promise<{ token: string; sharePath: string; publicUrl: string }>;
}

export async function fetchPlan() {
  const res = await fetch('/api/plan', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load plan');
  return res.json();
}

export async function startReview(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/reviews`, {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Review failed to start');
  }
  return res.json() as Promise<{ runId: string; status: string }>;
}

export async function getReviewRun(projectId: string, runId: string) {
  const res = await fetch(`/api/projects/${projectId}/reviews/${runId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Review not found');
  return res.json();
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
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

export async function importSitemap(projectId: string, url: string, baseVersion: number) {
  const res = await fetch(`/api/projects/${projectId}/sitemap-import`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, baseVersion }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Sitemap import failed');
  }
  return res.json() as Promise<{
    version: number;
    pageId: string;
    routeCount: number;
    connectorCount: number;
  }>;
}

export async function createFlowMap(projectId: string, url: string, baseVersion: number) {
  const res = await fetch(`/api/projects/${projectId}/flow-maps`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, baseVersion }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(data.message ?? 'Import failed');
  }
  return res.json();
}

export async function fetchFigmaTokenStatus() {
  const res = await fetch('/api/me/figma-token', { credentials: 'include' });
  if (!res.ok) throw new Error('Could not load Figma settings');
  return res.json() as Promise<{ configured: boolean; source: 'user' | 'server' | null }>;
}

export async function saveFigmaToken(token: string) {
  const res = await fetch('/api/me/figma-token', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) throw new Error('Could not save token');
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
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
    throw new Error(data.message ?? data.error ?? 'Figma import failed');
  }
  return res.json() as Promise<{
    version: number;
    framesImported: number;
    connectorsImported: number;
    fileName: string;
  }>;
}

export async function fetchPublicShare(token: string) {
  const res = await fetch(`/api/share/${token}`);
  if (!res.ok) throw new Error('Share link not found');
  return res.json();
}

export async function fetchBillingConfig() {
  const res = await fetch('/api/billing/config');
  if (!res.ok) throw new Error('Billing config unavailable');
  return res.json() as Promise<{ stripeEnabled: boolean; priceLabel: string; planName: string }>;
}

export async function startProCheckout(): Promise<{
  checkoutUrl?: string;
  message?: string;
  disabled?: boolean;
}> {
  const res = await fetch('/api/billing/checkout', { method: 'POST', credentials: 'include' });
  const data = (await res.json().catch(() => ({}))) as {
    checkoutUrl?: string;
    message?: string;
    disabled?: boolean;
  };
  if (res.status === 503) {
    return { disabled: true, message: data.message ?? 'Stripe is not configured on this deployment.' };
  }
  if (!res.ok) {
    throw new Error(data.message ?? 'Checkout failed');
  }
  return data;
}

export async function listReviewRuns(projectId: string) {
  const res = await fetch(`/api/projects/${projectId}/reviews`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to list reviews');
  return res.json() as Promise<{ runs: { id: string; status: string }[] }>;
}
