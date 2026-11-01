import type { Config } from '../config.js';

export type StudioApiClient = {
	request<T>(path: string, init?: RequestInit): Promise<T>;
};

export function createStudioApiClient(apiBaseUrl: string, bearerToken: string): StudioApiClient {
	const base = apiBaseUrl.replace(/\/$/, '');
	return {
		async request<T>(path: string, init: RequestInit = {}): Promise<T> {
			const headers = new Headers(init.headers);
			headers.set('Authorization', `Bearer ${bearerToken}`);
			if (init.body && !headers.has('Content-Type') && typeof init.body === 'string') {
				headers.set('Content-Type', 'application/json');
			}
			const res = await fetch(`${base}${path}`, { ...init, headers });
			if (!res.ok) {
				const text = await res.text();
				throw new Error(`API ${res.status}: ${text}`);
			}
			if (res.status === 204) return undefined as T;
			const ct = res.headers.get('content-type') ?? '';
			if (ct.includes('application/json')) return (await res.json()) as T;
			return (await res.text()) as T;
		},
	};
}

export function loadStudioApiBaseUrl(config: Config): string {
	return (process.env.BAREFRAME_API_URL ?? 'http://127.0.0.1:8080').replace(/\/$/, '');
}
