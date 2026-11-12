import { describe, expect, it, vi } from 'vitest';
import { buildInstallPrPreview } from '../src/capture/setup.js';
import { createGitHubApi, detectEntryFiles } from '../src/auth/github.js';

describe('buildInstallPrPreview', () => {
	it('marks simulated when GitHub App is not connected', () => {
		const preview = buildInstallPrPreview(
			{ repo: 'acme/app', branch: 'main', snippetHtml: '<script></script>' },
			{ githubAppConnected: false },
		);
		expect(preview.simulated).toBe(true);
		expect(preview.githubAppConnected).toBe(false);
	});

	it('can mark app-connected when configured', () => {
		const preview = buildInstallPrPreview(
			{ repo: 'acme/app', branch: 'main', snippetHtml: '<script></script>' },
			{ githubAppConnected: true },
		);
		expect(preview.simulated).toBe(false);
	});
});

describe('createGitHubApi', () => {
	it('maps repository listings', async () => {
		const fetchImpl = vi.fn(async (url: string) => {
			if (url.includes('/user/repos')) {
				return new Response(
					JSON.stringify([
						{
							id: 1,
							full_name: 'acme/shop',
							private: false,
							default_branch: 'main',
							html_url: 'https://github.com/acme/shop',
						},
					]),
					{ status: 200 },
				);
			}
			return new Response('{}', { status: 404 });
		});
		const api = createGitHubApi('token', fetchImpl as typeof fetch);
		const repos = await api.listRepos();
		expect(repos[0]?.fullName).toBe('acme/shop');
	});
});

describe('detectEntryFiles', () => {
	it('returns defaults when no files exist', async () => {
		const fetchImpl = vi.fn(async () => new Response('Not Found', { status: 404 }));
		const api = createGitHubApi('token', fetchImpl as typeof fetch);
		const files = await detectEntryFiles(api, 'acme', 'app');
		expect(files).toEqual(['index.html']);
	});
});
