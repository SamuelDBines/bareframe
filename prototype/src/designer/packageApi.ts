const API = '/api';

export type PackageSummary = {
  id: string;
  name: string;
  status: string;
  revision: number;
  updatedAt?: string;
};

export type PackageConfig = {
  llmConfigured: boolean;
  llmAdapter: string | null;
  monthlyLimit: number;
  intakeQuestions: { id: string; label: string; defaultAnswer: string; placeholder: string }[];
};

export async function fetchPackageConfig(): Promise<PackageConfig> {
  const res = await fetch(`${API}/packages/config`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load package config');
  return res.json() as Promise<PackageConfig>;
}

export async function fetchPackageUsage(): Promise<{ packagesThisMonth: number; monthlyLimit: number }> {
  const res = await fetch(`${API}/packages/usage`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to load usage');
  return res.json() as Promise<{ packagesThisMonth: number; monthlyLimit: number }>;
}

export async function listProductPackages(): Promise<PackageSummary[]> {
  const res = await fetch(`${API}/packages`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to list packages');
  const data = (await res.json()) as { packages: PackageSummary[] };
  return data.packages;
}

export async function startPackageGeneration(body: Record<string, unknown>): Promise<{ jobId: string }> {
  const res = await fetch(`${API}/packages/generate`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { message?: string }).message ?? (data as { error?: string }).error ?? 'Generation failed';
    throw new Error(msg);
  }
  return data as { jobId: string };
}

export async function fetchPackageJob(jobId: string) {
  const res = await fetch(`${API}/packages/jobs/${jobId}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Job not found');
  return res.json();
}

export function subscribePackageJobEvents(jobId: string, onEvent: (data: Record<string, unknown>) => void) {
  const es = new EventSource(`${API}/packages/jobs/${jobId}/events`, { withCredentials: true });
  es.onmessage = (ev) => {
    try {
      onEvent(JSON.parse(ev.data) as Record<string, unknown>);
    } catch {
      /* ignore */
    }
  };
  return () => es.close();
}

export async function fetchProductPackage(id: string) {
  const res = await fetch(`${API}/packages/${id}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Package not found');
  return res.json();
}

export async function patchProductPackage(id: string, body: Record<string, unknown>) {
  const res = await fetch(`${API}/packages/${id}`, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error('Update failed');
  return res.json();
}

export async function createShareLink(id: string) {
  const res = await fetch(`${API}/packages/${id}/share`, { method: 'POST', credentials: 'include' });
  if (!res.ok) throw new Error('Share failed');
  return res.json() as Promise<{ url: string }>;
}

export async function fetchPublicPackage(token: string) {
  const res = await fetch(`${API}/packages/public/${token}`);
  if (!res.ok) throw new Error('Not found');
  return res.json();
}

export function exportZipUrl(id: string) {
  return `${API}/packages/${id}/export.zip`;
}

export function deliveryFlowUrl(id: string) {
  return `${API}/packages/${id}/delivery-flow.json`;
}

export async function requestRevision(id: string, deliverable: string, feedback: string) {
  const res = await fetch(`${API}/packages/${id}/revise`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deliverable, feedback }),
  });
  if (!res.ok) throw new Error('Revision request failed');
  return res.json();
}
