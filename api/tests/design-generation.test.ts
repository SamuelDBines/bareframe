import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import type { ProjectDocument } from '@bareframe/designer-core';
import { createApp } from '../src/app.js';
import { createPool } from '../src/db/index.js';
import { setupTestDb, testConfig, mockGitHubUser } from '../src/test-utils.js';
import { setDesignLlmForTests } from '../src/design-gen/llm.js';
import type { GitHubClient } from '../src/auth/github.js';
import { cookieHeaderFromResponse } from './helpers.js';

const DESCRIPTION = 'Habitual: a habit tracker for busy parents who want to build small daily routines.';

describe('screen design generation', () => {
	let pool: ReturnType<typeof createPool>;
	let server: Server;
	let baseUrl = '';
	let cookie = '';

	const api = (path: string, init: RequestInit = {}) =>
		fetch(`${baseUrl}/api${path}`, {
			...init,
			headers: { Cookie: cookie, 'Content-Type': 'application/json', ...(init.headers ?? {}) },
		});

	async function newProject(): Promise<{ id: string; version: number }> {
		await pool.query('DELETE FROM projects');
		const res = await api('/projects', { method: 'POST', body: JSON.stringify({ name: 'Habitual' }) });
		expect(res.status).toBe(201);
		const body = (await res.json()) as { id: string; version: number };
		return { id: body.id, version: body.version };
	}

	const generate = (projectId: string, body: Record<string, unknown>) =>
		api(`/projects/${projectId}/flow/generate`, { method: 'POST', body: JSON.stringify(body) });

	const setTier = (tier: 'free' | 'pro') => pool.query(`UPDATE users SET plan_tier = $1`, [tier]);

	beforeAll(async () => {
		process.env.NODE_ENV = 'test';
		pool = createPool(testConfig);
		await setupTestDb(pool);
		const github: GitHubClient = { exchangeCode: async () => 'token', fetchUser: async () => mockGitHubUser() };
		const app = createApp({ config: testConfig, pool, github });
		await new Promise<void>((resolve) => {
			server = serve({ fetch: app.fetch, port: 0 }, (info) => {
				baseUrl = `http://127.0.0.1:${info.port}`;
				resolve();
			});
		});
		const start = await fetch(`${baseUrl}/api/auth/github?returnTo=/`, { redirect: 'manual' });
		const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
		const callback = await fetch(`${baseUrl}/api/auth/github/callback?code=ok&state=${encodeURIComponent(state)}`, {
			headers: { Cookie: cookieHeaderFromResponse(start) },
			redirect: 'manual',
		});
		cookie = cookieHeaderFromResponse(callback);
	});

	beforeEach(async () => {
		await pool.query('DELETE FROM ai_generation_usage');
		await setTier('free');
		setDesignLlmForTests(null);
	});

	afterEach(() => setDesignLlmForTests(null));

	afterAll(async () => {
		server?.close();
		await pool.end();
	});

	async function projectWithFlow() {
		const project = await newProject();
		const res = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION });
		expect(res.status).toBe(200);
		const flow = (await res.json()) as { version: number; document: ProjectDocument };
		await pool.query('DELETE FROM ai_generation_usage');
		return { id: project.id, version: flow.version, document: flow.document };
	}

	const design = (projectId: string, pageId: string, body: Record<string, unknown>) =>
		api(`/projects/${projectId}/screens/${pageId}/design`, { method: 'POST', body: JSON.stringify(body) });

	it('designs a screen with Bareframe components, for the chosen device', async () => {
		const flow = await projectWithFlow();
		const signUp = flow.document.project.pages.find((p) => p.brief?.key === 'sign-up')!;
		const res = await design(flow.id, signUp.id, { baseVersion: flow.version, device: 'desktop' });
		expect(res.status).toBe(200);
		const body = (await res.json()) as {
			version: number;
			document: ProjectDocument;
			design: { device: string; states: string[]; repairs: string[] };
		};
		expect(body.design.states).toEqual(['default', 'loading', 'error']);
		const page = body.document.project.pages.find((p) => p.id === signUp.id)!;
		const nodes = Object.values(page.nodes);
		const slugs = nodes.filter((n) => n.type === 'instance').map((n) => n.instance!.definitionId);
		expect(slugs).toEqual(expect.arrayContaining(['input', 'button']));
		expect(slugs.every((s) => ['button', 'input', 'card', 'badge', 'alert'].includes(s))).toBe(true);
		// The outgoing link label becomes the primary button.
		expect(nodes.some((n) => n.instance?.props?.children === 'Create account')).toBe(true);
		const frame = body.document.project.frames.find((f) => f.pageId === signUp.id)!;
		expect(frame).toMatchObject({ devicePresetId: 'desktop-1440', width: 1440 });

		const list = (await (await api(`/projects/${flow.id}/screen-designs`)).json()) as {
			designs: { screenKey: string; device: string; states: string[] }[];
		};
		expect(list.designs).toEqual([expect.objectContaining({ screenKey: 'sign-up', device: 'desktop', states: ['default', 'loading', 'error'] })]);
	});

	it('limits the free plan to three screen designs a month', async () => {
		const flow = await projectWithFlow();
		let version = flow.version;
		const pages = flow.document.project.pages;
		for (const page of pages.slice(0, 3)) {
			const res = await design(flow.id, page.id, { baseVersion: version, device: 'phone' });
			expect(res.status).toBe(200);
			version = ((await res.json()) as { version: number }).version;
		}
		const fourth = await design(flow.id, pages[3]!.id, { baseVersion: version, device: 'phone' });
		expect(fourth.status).toBe(429);
		expect(await fourth.json()).toMatchObject({ error: 'screen_design_limit' });
		const plan = (await (await api('/plan')).json()) as { usage: { screenDesignsThisMonth: number } };
		expect(plan.usage.screenDesignsThisMonth).toBe(3);
	});

	it('drops invented components and raw HTML, and rejects unusable output with a refund', async () => {
		setDesignLlmForTests({
			generateDesign: async () => ({
				states: {
					default: {
						type: 'stack',
						children: [
							{ type: 'Carousel', props: { label: 'x' } },
							{ type: 'text', text: '<img src=x onerror=alert(1)>Welcome back' },
							{ type: 'button', props: { label: 'Continue' } },
						],
					},
				},
			}),
		});
		const flow = await projectWithFlow();
		const page = flow.document.project.pages[0]!;
		const res = await design(flow.id, page.id, { baseVersion: flow.version, device: 'phone' });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { document: ProjectDocument; design: { repairs: string[] } };
		expect(body.design.repairs.join('\n')).toMatch(/carousel/);
		const texts = Object.values(body.document.project.pages[0]!.nodes).map((n) => n.content?.text).filter(Boolean);
		expect(texts).toEqual(['Welcome back']);

		setDesignLlmForTests({ generateDesign: async () => ({ states: { default: { type: 'iframe' } } }) });
		const stored = (await (await api(`/projects/${flow.id}`)).json()) as { version: number };
		await pool.query('DELETE FROM ai_generation_usage');
		const bad = await design(flow.id, page.id, { baseVersion: stored.version, device: 'phone' });
		expect(bad.status).toBe(502);
		expect(await bad.json()).toMatchObject({ error: 'design_invalid' });
		const { rows } = await pool.query(`SELECT count FROM ai_generation_usage`);
		expect(rows[0]?.count ?? 0).toBe(0);
	});

	it('rejects unknown screens, devices and stale versions', async () => {
		const flow = await projectWithFlow();
		const page = flow.document.project.pages[0]!;
		expect((await design(flow.id, 'page-missing', { baseVersion: flow.version, device: 'phone' })).status).toBe(404);
		expect((await design(flow.id, page.id, { baseVersion: flow.version, device: 'watch' })).status).toBe(400);
		expect((await design(flow.id, page.id, { baseVersion: flow.version - 1, device: 'phone' })).status).toBe(409);
	});
});
