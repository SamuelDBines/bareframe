import { apiFail } from './apiError';

export type AccountTokenSummary = {
	id: string;
	name: string;
	token_prefix: string;
	scopes: string[];
	created_at: string;
	revoked_at: string | null;
	last_used_at: string | null;
};

export async function listAccountTokens() {
	const res = await fetch('/api/account/tokens', { credentials: 'include' });
	if (!res.ok) await apiFail(res, 'Failed to load account tokens');
	const data = await res.json();
	return data.tokens as AccountTokenSummary[];
}

export async function createAccountToken(name?: string, scopes?: string[]) {
	const res = await fetch('/api/account/tokens', {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name, scopes }),
	});
	if (!res.ok) await apiFail(res, 'Could not create token');
	return res.json() as Promise<{ id: string; token: string; scopes: string[] }>;
}

export async function revokeAccountToken(tokenId: string) {
	const res = await fetch(`/api/account/tokens/${tokenId}`, {
		method: 'DELETE',
		credentials: 'include',
	});
	if (!res.ok) await apiFail(res, 'Revoke failed');
}