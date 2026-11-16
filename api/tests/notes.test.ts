import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { createPool, upsertUser } from '../src/db/index.js';
import { createProject, createProjectToken } from '../src/db/projects.js';
import { setupTestDb, testConfig } from '../src/test-utils.js';
import { cookieHeaderFromResponse } from './helpers.js';
import type { GitHubClient } from '../src/auth/github.js';
import { mockGitHubUser } from '../src/test-utils.js';

describe('project notes API', () => {
	let pool: ReturnType<typeof createPool>;
	let baseUrl = '';
	let server: Server;
	let sessionCookie = '';
	let sharedProjectId = '';

	beforeAll(async () => {
		process.env.NODE_ENV = 'test';
		pool = createPool(testConfig);
		await setupTestDb(pool);
		const github: GitHubClient = {
			exchangeCode: async () => 'token',
			fetchUser: async () => mockGitHubUser({ id: 77, login: 'notes-user' }),
		};
		const app = createApp({ config: testConfig, pool, github });
		await new Promise<void>((resolve) => {
			server = serve({ fetch: app.fetch, port: 0 }, (info) => {
				baseUrl = `http://127.0.0.1:${info.port}`;
				resolve();
			});
		});

		const start = await fetch(`${baseUrl}/api/auth/github?returnTo=/`, { redirect: 'manual' });
		const oauthCookie = cookieHeaderFromResponse(start);
		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
		const callback = await fetch(
			`${baseUrl}/api/auth/github/callback?code=ok&state=${encodeURIComponent(state)}`,
			{ headers: { Cookie: oauthCookie }, redirect: 'manual' },
		);
		sessionCookie = cookieHeaderFromResponse(callback);
	});

	afterAll(async () => {
		server?.close();
		await pool.end();
	});

	it('creates, lists, filters, updates, and deletes notes', async () => {
		const created = await fetch(`${baseUrl}/api/projects`, {
			method: 'POST',
			headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: 'Notes project' }),
		});
		expect(created.status).toBe(201);
		const project = (await created.json()) as { id: string; document: { project: { frames: { id: string }[] } } };
		sharedProjectId = project.id;
		const frameId = project.document.project.frames[0]?.id ?? 'frame-1';

		const postRes = await fetch(`${baseUrl}/api/projects/${project.id}/notes`, {
			method: 'POST',
			headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				where: 'Checkout page',
				body: 'Checkout button is hard to find',
				frameId,
				tags: ['ux'],
			}),
		});
		expect(postRes.status).toBe(201);
		const { note } = (await postRes.json()) as { note: { id: string; status: string; where: string } };
		expect(note.status).toBe('open');
		expect(note.where).toBe('Checkout page');

		const listRes = await fetch(`${baseUrl}/api/projects/${project.id}/notes?status=open&frameId=${frameId}`, {
			headers: { Cookie: sessionCookie },
		});
		const list = (await listRes.json()) as { notes: { id: string }[] };
		expect(list.notes.some((n) => n.id === note.id)).toBe(true);

		const patchRes = await fetch(`${baseUrl}/api/projects/${project.id}/notes/${note.id}`, {
			method: 'PATCH',
			headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'done' }),
		});
		expect(patchRes.status).toBe(200);

		const openOnly = await fetch(`${baseUrl}/api/projects/${project.id}/notes?status=open`, {
			headers: { Cookie: sessionCookie },
		});
		const openBody = (await openOnly.json()) as { notes: unknown[] };
		expect(openBody.notes.length).toBe(0);

		const delRes = await fetch(`${baseUrl}/api/projects/${project.id}/notes/${note.id}`, {
			method: 'DELETE',
			headers: { Cookie: sessionCookie },
		});
		expect(delRes.status).toBe(200);
	});

	it('respects token scopes for notes', async () => {
		const user = await upsertUser(pool, {
			githubId: 88,
			login: 'scope-user',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const project = await createProject(pool, user.id, 'Scoped');
		const readToken = `bf_proj_${'b'.repeat(48)}`;
		await createProjectToken(pool, project.id, user.id, 'read', ['projects:read'], readToken);
		const forbidden = await fetch(`${baseUrl}/api/projects/${project.id}/notes`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${readToken}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ body: 'Should fail' }),
		});
		expect(forbidden.status).toBe(403);

		const writeToken = `bf_proj_${'c'.repeat(48)}`;
		await createProjectToken(pool, project.id, user.id, 'write', ['notes:write'], writeToken);
		const ok = await fetch(`${baseUrl}/api/projects/${project.id}/notes`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${writeToken}`, 'Content-Type': 'application/json' },
			body: JSON.stringify({ body: 'From MCP' }),
		});
		expect(ok.status).toBe(201);
	});

	it('capture endpoint stores where, selector, and screenshot asset', async () => {
		expect(sharedProjectId).toBeTruthy();
		const png =
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
		const cap = await fetch(`${baseUrl}/api/projects/${sharedProjectId}/notes/capture`, {
			method: 'POST',
			headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
			body: JSON.stringify({
				where: 'app/Billing',
				issue: 'Tax row missing',
				pageUrl: 'https://example.com/billing',
				elementSelector: 'table.totals tr.tax',
				screenshot: png,
			}),
		});
		expect(cap.status).toBe(201);
		const body = (await cap.json()) as {
			note: { where: string; body: string; screenshotAssetId: string | null; elementSelector: string | null };
		};
		expect(body.note.where).toBe('app/Billing');
		expect(body.note.screenshotAssetId).toBeTruthy();
		expect(body.note.elementSelector).toContain('tax');
	});
});