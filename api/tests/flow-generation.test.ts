import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import type { ProjectDocument } from '@bareframe/designer-core';
import { createApp } from '../src/app.js';
import { createPool } from '../src/db/index.js';
import { setupTestDb, testConfig, mockGitHubUser } from '../src/test-utils.js';
import { setFlowLlmForTests, type FlowLlm } from '../src/flow-gen/llm.js';
import type { GitHubClient } from '../src/auth/github.js';
import { cookieHeaderFromResponse } from './helpers.js';

const DESCRIPTION = 'Habitual: a habit tracker for busy parents who want to build small daily routines.';

describe('describe → flow generation', () => {
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
		setFlowLlmForTests(null);
	});

	afterEach(() => setFlowLlmForTests(null));

	afterAll(async () => {
		server?.close();
		await pool.end();
	});

	it('generates a laid-out, editable flow on an empty project', async () => {
		const project = await newProject();
		const res = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION, platform: 'tablet' });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { version: number; document: ProjectDocument; screens: number; repairs: string[] };
		expect(body.version).toBe(project.version + 1);
		expect(body.screens).toBe(5);
		expect(body.repairs).toEqual([]);

		const stored = (await (await api(`/projects/${project.id}`)).json()) as { version: number; document: ProjectDocument };
		const { pages, frames, connectors, productBrief } = stored.document.project;
		expect(stored.version).toBe(body.version);
		expect(pages.map((p) => p.name)).toEqual(['Welcome', 'Sign up', 'Home', 'Item detail', 'Settings']);
		expect(pages.every((p) => p.brief && p.brief.states.includes('default'))).toBe(true);
		expect(frames).toHaveLength(5);
		expect(frames.every((f) => f.devicePresetId === 'tablet')).toBe(true);
		expect(new Set(frames.map((f) => `${f.x},${f.y}`)).size).toBe(5);
		expect(connectors.map((c) => c.label)).toContain('Get started');
		expect(productBrief).toMatchObject({ description: DESCRIPTION, platform: 'tablet' });

		const plan = (await (await api('/plan')).json()) as { usage: { flowGenerationsThisMonth: number } };
		expect(plan.usage.flowGenerationsThisMonth).toBe(1);
	});

	it('limits the free plan to one flow generation a month', async () => {
		const project = await newProject();
		const first = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION });
		expect(first.status).toBe(200);
		const { version } = (await first.json()) as { version: number };
		const second = await generate(project.id, { baseVersion: version, instruction: 'add a reminders screen' });
		expect(second.status).toBe(429);
		expect(await second.json()).toMatchObject({ error: 'flow_generation_limit' });
	});

	it('refines the current flow on Pro, keeping existing screens', async () => {
		await setTier('pro');
		const project = await newProject();
		const first = (await (await generate(project.id, { baseVersion: project.version, description: DESCRIPTION })).json()) as {
			version: number;
			document: ProjectDocument;
		};
		const homeId = first.document.project.pages.find((p) => p.brief?.key === 'home')!.id;
		const res = await generate(project.id, { baseVersion: first.version, instruction: 'add a reminders screen' });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { document: ProjectDocument; refined: boolean };
		expect(body.refined).toBe(true);
		const pages = body.document.project.pages;
		expect(pages.find((p) => p.brief?.key === 'home')!.id).toBe(homeId);
		expect(pages.map((p) => p.name)).toContain('Reminders');
		expect(body.document.project.productBrief?.description).toBe(DESCRIPTION);
	});

	it('repairs fixable model output and reports what it changed', async () => {
		setFlowLlmForTests({
			generateFlow: async () => ({
				screens: [{ name: 'Start' }, { id: 'Start', name: 'Start again' }, { id: 'done', name: 'Done', states: ['finished?'] }],
				connections: [{ from: 'start', to: 'done' }, { from: 'start', to: 'ghost' }],
			}),
		});
		const project = await newProject();
		const res = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { screens: number; connections: number; repairs: string[] };
		expect(body.screens).toBe(3);
		expect(body.connections).toBe(1);
		expect(body.repairs.join('\n')).toMatch(/duplicate id/);
		expect(body.repairs.join('\n')).toMatch(/unknown screen "ghost"/);
	});

	it('retries once with the validation problems, then rejects and refunds', async () => {
		const prompts: (string[] | undefined)[] = [];
		const flaky: FlowLlm = {
			generateFlow: async (input) => {
				prompts.push(input.feedback);
				return prompts.length === 1 ? { screens: 'nope' } : { screens: [{ id: 'only', name: 'Only screen' }] };
			},
		};
		setFlowLlmForTests(flaky);
		const project = await newProject();
		const ok = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION });
		expect(ok.status).toBe(200);
		expect(((await ok.json()) as { attempts: number }).attempts).toBe(2);
		expect(prompts[1]).toEqual(['screens: expected an array']);

		await pool.query('DELETE FROM ai_generation_usage');
		setFlowLlmForTests({ generateFlow: async () => 'not json at all' });
		const fresh = await newProject();
		const bad = await generate(fresh.id, { baseVersion: fresh.version, description: DESCRIPTION });
		expect(bad.status).toBe(502);
		expect(await bad.json()).toMatchObject({ error: 'flow_invalid' });
		const plan = (await (await api('/plan')).json()) as { usage: { flowGenerationsThisMonth: number } };
		expect(plan.usage.flowGenerationsThisMonth).toBe(0);
		const stored = (await (await api(`/projects/${fresh.id}`)).json()) as { version: number };
		expect(stored.version).toBe(fresh.version);
	});

	it('refunds usage when the model call fails', async () => {
		setFlowLlmForTests({
			generateFlow: async () => {
				throw new Error('upstream 500');
			},
		});
		const project = await newProject();
		const res = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION });
		expect(res.status).toBe(502);
		expect(await res.json()).toMatchObject({ error: 'llm_failed' });
		const { rows } = await pool.query(`SELECT count FROM ai_generation_usage`);
		expect(rows[0]?.count ?? 0).toBe(0);
	});

	it('keeps free-plan flows within the screen limit', async () => {
		setFlowLlmForTests({
			generateFlow: async () => ({
				screens: Array.from({ length: 14 }, (_, i) => ({ id: `s${i}`, name: `Screen ${i}` })),
				connections: [{ from: 's0', to: 's13' }, { from: 's0', to: 's1' }],
			}),
		});
		const project = await newProject();
		const res = await generate(project.id, { baseVersion: project.version, description: DESCRIPTION });
		expect(res.status).toBe(200);
		const body = (await res.json()) as { screens: number; connections: number; repairs: string[] };
		expect(body.screens).toBe(10);
		expect(body.connections).toBe(1);
		expect(body.repairs.at(-1)).toMatch(/plan limit/);
	});

	it('rejects bad requests and stale versions without using the allowance', async () => {
		const project = await newProject();
		expect((await generate(project.id, { baseVersion: project.version, description: 'short' })).status).toBe(400);
		expect((await generate(project.id, { baseVersion: project.version })).status).toBe(400);
		expect(
			(await generate(project.id, { baseVersion: project.version, description: DESCRIPTION, platform: 'watch' })).status,
		).toBe(400);
		const stale = await generate(project.id, { baseVersion: project.version + 5, description: DESCRIPTION });
		expect(stale.status).toBe(409);
		const plan = (await (await api('/plan')).json()) as { usage: { flowGenerationsThisMonth: number } };
		expect(plan.usage.flowGenerationsThisMonth).toBe(0);
	});
});
