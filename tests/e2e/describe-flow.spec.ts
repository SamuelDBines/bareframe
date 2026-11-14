import { expect, test, type Page, type Route } from '@playwright/test';
import {
	applyFlowSpec,
	createEmptyProjectDocument,
	designToNodes,
	repairDesignSpec,
	flowSpecFromDocument,
	repairFlowSpec,
	type ProjectDocument,
} from '../../packages/designer-core/dist/index.js';

/**
 * "Describe your product" → flow map, against a mocked API whose flow endpoint uses the real
 * designer-core repair and apply functions, so the canvas renders what the server would save.
 */

const PROJECT_ID = 'p-describe';
let idSeq = 0;
const newId = (prefix: string) => `${prefix}-e2e-${++idSeq}`;

const AI_FLOW = {
	screens: [
		{ id: 'welcome', name: 'Welcome', purpose: 'Introduce the app', keyContent: ['Get started'], states: ['default'] },
		{ id: 'sign-up', name: 'Sign up', purpose: 'Create an account', keyContent: ['Email'], states: ['loading', 'error'] },
		{ id: 'home', name: 'Home', purpose: 'Today’s habits', keyContent: ['Habit list'], states: ['empty'] },
		{ id: 'habit', name: 'Habit detail', purpose: 'Edit a habit', keyContent: ['Name'], states: ['default'] },
	],
	connections: [
		{ from: 'welcome', to: 'sign-up', trigger: 'Get started' },
		{ from: 'sign-up', to: 'home', trigger: 'Create account' },
		{ from: 'home', to: 'habit', trigger: 'Open habit' },
	],
};

type MockOptions = {
	refineStatus?: number;
	generateDelayMs?: number;
	designDelayMs?: number;
	/** Screen designs allowed before the mock answers 429 (free plan: 3). */
	designAllowance?: number;
};

const DESIGN_PRESET: Record<string, { id: string; width: number; height: number }> = {
	phone: { id: 'mobile', width: 390, height: 844 },
	tablet: { id: 'tablet', width: 768, height: 1024 },
	desktop: { id: 'desktop-1440', width: 1440, height: 900 },
};

async function mockApi(page: Page, options: MockOptions = {}) {
	let version = 1;
	let document: ProjectDocument = createEmptyProjectDocument(PROJECT_ID, 'Habitual', 'light', { newId });
	document.project.pages = [];
	const generateBodies: Record<string, unknown>[] = [];
	let conflicts = 0;
	const designCalls: { pageId: string; device: string }[] = [];
	let reviewsStarted = 0;

	await page.route('**/api/**', async (route: Route) => {
		const req = route.request();
		const p = new URL(req.url()).pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({ user: { id: 1, login: 'tester', name: 'Tester', avatarUrl: null, email: 't@example.com' } });
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free', limits: {}, usage: {} });
		if (p.endsWith('/api/billing/config')) return json({ stripeEnabled: false });
		if (p.endsWith(`/api/projects/${PROJECT_ID}/reviews`) && req.method() === 'POST') {
			reviewsStarted += 1;
			return json({ runId: 'run-1', status: 'queued' }, 202);
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/reviews/run-1`)) {
			const first = document.project.frames[0];
			return json({
				id: 'run-1',
				status: 'completed',
				summary: {},
				issues: [
					{
						id: 'iss-1',
						category: 'missing_state',
						severity: 'major',
						title: 'Sign up has no password rules',
						explanation: 'People find out the rules only after an error.',
						fix: 'Show the rules under the field.',
						frameId: first?.id,
						status: 'open',
					},
				],
			});
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/reviews`)) return json({ runs: [] });
		const designMatch = /\/api\/projects\/[^/]+\/screens\/([^/]+)\/design$/.exec(p);
		if (designMatch) {
			const pageId = decodeURIComponent(designMatch[1]!);
			const body = req.postDataJSON() as { baseVersion: number; device: string };
			designCalls.push({ pageId, device: body.device });
			if (options.designDelayMs) await new Promise((r) => setTimeout(r, options.designDelayMs));
			if (designCalls.length > (options.designAllowance ?? 99)) {
				return json(
					{ error: 'screen_design_limit', message: "The free plan includes 3 screen designs a month, and you've used them all. Upgrade to Bareframe Pro for more." },
					429,
				);
			}
			if (body.baseVersion !== version) return json({ error: 'Version conflict', currentVersion: version }, 409);
			const pageIndex = document.project.pages.findIndex((pg) => pg.id === pageId);
			const page = document.project.pages[pageIndex]!;
			const actions = document.project.connectors
				.filter((c) => document.project.frames.some((f) => f.id === c.fromFrameId && f.pageId === pageId))
				.map((c) => ({ type: 'button', props: { label: c.label ?? 'Next', variant: 'primary' } }));
			const { spec } = repairDesignSpec({
				states: {
					default: {
						type: 'stack',
						padding: 24,
						children: [{ type: 'heading', level: 1, text: page.name }, { type: 'text', text: page.brief?.purpose ?? '' }, ...actions],
					},
				},
			});
			document = structuredClone(document);
			document.project.pages[pageIndex] = designToNodes(page, spec.states.default, newId);
			const preset = DESIGN_PRESET[body.device]!;
			for (const f of document.project.frames) {
				if (f.pageId === pageId) Object.assign(f, { devicePresetId: preset.id, width: preset.width, height: preset.height });
			}
			version += 1;
			return json({ version, document, design: { device: body.device, states: ['default'], repairs: [] } });
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/document`) && req.method() === 'PUT') {
			const body = req.postDataJSON() as { document: ProjectDocument; baseVersion: number };
			if (body.baseVersion !== version) {
				conflicts += 1;
				return json({ error: 'Version conflict', currentVersion: version }, 409);
			}
			document = body.document;
			version += 1;
			return json({ version });
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/flow/generate`)) {
			const body = req.postDataJSON() as {
				baseVersion: number;
				description?: string;
				platform?: 'mobile' | 'tablet' | 'desktop' | 'all';
				instruction?: string;
			};
			generateBodies.push({ ...body, serverVersion: version });
			if (options.generateDelayMs) await new Promise((r) => setTimeout(r, options.generateDelayMs));
			if (body.instruction && options.refineStatus === 429) {
				return json(
					{
						error: 'flow_generation_limit',
						message: "The free plan includes 1 flow generation a month, and you've used it. Upgrade to Bareframe Pro for more.",
					},
					429,
				);
			}
			if (body.baseVersion !== version) return json({ error: 'Version conflict', currentVersion: version }, 409);
			let raw: unknown = AI_FLOW;
			if (body.instruction) {
				const current = flowSpecFromDocument(document);
				raw = {
					screens: [...current.screens, { id: 'reminders', name: 'Reminders', states: ['default'] }],
					connections: [...current.connections, { from: 'home', to: 'reminders', trigger: 'Reminders' }],
				};
			}
			const { spec, repairs } = repairFlowSpec(raw);
			const description = body.description ?? document.project.productBrief?.description ?? '';
			const platform = body.platform ?? document.project.productBrief?.platform ?? 'mobile';
			document = applyFlowSpec(document, spec, { platform, description, newId }).document;
			version += 1;
			return json({
				version,
				document,
				screens: spec.screens.length,
				connections: spec.connections.length,
				refined: Boolean(body.instruction),
				repairs,
				attempts: 1,
			});
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}`)) return json({ id: PROJECT_ID, name: 'Habitual', version, document });
		if (p.endsWith('/events')) return route.fulfill({ status: 204, body: '' });
		return json({ error: 'not_found' }, 404);
	});
	return {
		generateBodies,
		designCalls,
		reviews: () => reviewsStarted,
		current: () => ({ version, document, conflicts }),
	};
}

async function openProject(page: Page) {
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await page.goto(`/#/app/project/${PROJECT_ID}`);
	await expect(page.getByTestId('describe-product-panel')).toBeVisible({ timeout: 30_000 });
}

test.describe('describe your product → flow map', () => {
	test('maps a described product onto the canvas', async ({ page }) => {
		const api = await mockApi(page, { generateDelayMs: 400 });
		await openProject(page);
		const panel = page.getByTestId('describe-product-panel');
		await expect(panel.getByRole('heading', { name: 'Start with your product' })).toBeVisible();

		await panel.getByRole('button', { name: 'Map my flow' }).click();
		await expect(panel.getByText('Add a little more detail')).toBeVisible();
		await expect(panel.getByRole('textbox', { name: 'Describe your product' })).toHaveAttribute('aria-invalid', 'true');

		await panel
			.getByRole('textbox', { name: 'Describe your product' })
			.fill('Habitual: a habit tracker for busy parents who want small daily routines.');
		await panel.getByText('Tablet', { exact: true }).click();
		await expect(panel.getByRole('radio', { name: 'Tablet' })).toBeChecked();
		await panel.getByRole('button', { name: 'Map my flow' }).click();
		await expect(panel.getByRole('button', { name: 'Mapping your screens…' })).toBeDisabled();

		await expect(page.locator('.flow-map-card')).toHaveCount(4, { timeout: 15_000 });
		await expect(page.getByTestId('describe-product-panel')).toHaveCount(0);
		await expect(page.getByTestId('flow-gen-toast')).toContainText('Mapped: 4 screens, 3 links');
		await expect(page.locator('.flow-map-card__footer')).toContainText(['Welcome', 'Sign up', 'Home', 'Habit detail']);
		// Generation is based on the server's current version (an autosave may have landed first).
		const [first] = api.generateBodies;
		expect(first).toMatchObject({ platform: 'tablet' });
		expect(first.baseVersion).toBe(first.serverVersion);

		// Generated screens sit left to right in flow order.
		const xs = await page.locator('.flow-map-card').evaluateAll((cards) => cards.map((c) => c.getBoundingClientRect().x));
		expect(xs[0]).toBeLessThan(xs[2]!);

		// The canvas adopted the server version, so autosave (camera fit) saves on top without a conflict.
		await page.waitForTimeout(1500);
		expect(api.current().conflicts).toBe(0);
		expect(api.current().version).toBeGreaterThanOrEqual(2);
	});

	test('platform choice is a keyboard-operable radio group', async ({ page }) => {
		await mockApi(page);
		await openProject(page);
		const group = page.getByRole('group', { name: 'Platform' });
		await group.getByRole('radio', { name: 'Mobile' }).focus();
		await page.keyboard.press('ArrowRight');
		await expect(group.getByRole('radio', { name: 'Tablet' })).toBeChecked();
		await expect(group.getByRole('radio', { name: 'Tablet' })).toBeFocused();
	});

	test('refines the flow with a follow-up instruction', async ({ page }) => {
		await mockApi(page);
		await openProject(page);
		await page
			.getByRole('textbox', { name: 'Describe your product' })
			.fill('Habitual: a habit tracker for busy parents who want small daily routines.');
		await page.getByRole('button', { name: 'Map my flow' }).click();
		await expect(page.locator('.flow-map-card')).toHaveCount(4, { timeout: 15_000 });

		const open = page.getByTestId('flow-refine-open');
		await open.click();
		const dialog = page.getByRole('dialog', { name: 'Refine flow' });
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('textbox', { name: 'What should change?' })).toBeFocused();
		await dialog.getByRole('textbox', { name: 'What should change?' }).fill('add a reminders screen');
		await dialog.getByRole('button', { name: 'Update flow' }).click();
		await expect(dialog).toHaveCount(0);
		await expect(page.locator('.flow-map-card')).toHaveCount(5);
		await expect(page.locator('.flow-map-card__footer').last()).toContainText('Reminders');
		await expect(page.getByTestId('flow-gen-toast')).toContainText('Updated the flow');
	});

	test('shows the plan limit message and closes on Escape', async ({ page }) => {
		await mockApi(page, { refineStatus: 429 });
		await openProject(page);
		await page
			.getByRole('textbox', { name: 'Describe your product' })
			.fill('Habitual: a habit tracker for busy parents who want small daily routines.');
		await page.getByRole('button', { name: 'Map my flow' }).click();
		await expect(page.locator('.flow-map-card')).toHaveCount(4, { timeout: 15_000 });

		await page.getByTestId('flow-refine-open').click();
		const dialog = page.getByRole('dialog', { name: 'Refine flow' });
		await dialog.getByRole('textbox', { name: 'What should change?' }).fill('add a reminders screen');
		await dialog.getByRole('button', { name: 'Update flow' }).click();
		await expect(dialog.getByRole('alert')).toContainText('free plan includes 1 flow generation');
		await expect(page.locator('.flow-map-card')).toHaveCount(4);
		await page.keyboard.press('Escape');
		await expect(dialog).toHaveCount(0);
		await expect(page.getByTestId('flow-refine-open')).toBeFocused();
	});
});

async function openMappedProject(page: Page, options: MockOptions = {}) {
	const api = await mockApi(page, options);
	await openProject(page);
	await page
		.getByRole('textbox', { name: 'Describe your product' })
		.fill('Habitual: a habit tracker for busy parents who want small daily routines.');
	await page.getByRole('button', { name: 'Map my flow' }).click();
	await expect(page.locator('.flow-map-card')).toHaveCount(4, { timeout: 15_000 });
	return api;
}

test.describe('generate screen designs', () => {
	test('each screen card has a Generate design button', async ({ page, isMobile }) => {
		const api = await openMappedProject(page);
		const button = page.getByRole('button', { name: 'Generate design for Welcome' });
		await expect(button).toBeAttached();
		if (!isMobile) {
			await button.click();
			await expect(page.getByRole('button', { name: 'Regenerate design for Welcome' })).toBeVisible({ timeout: 15_000 });
			expect(api.designCalls[0]?.device).toBe('phone');
		}
	});

	test('designs one screen for the chosen device, then runs the AI review', async ({ page }) => {
		const api = await openMappedProject(page);
		const bar = page.getByTestId('design-bar');
		await bar.getByRole('button', { name: /Tablet/ }).click();
		await expect(bar.getByRole('button', { name: /Tablet/ })).toHaveAttribute('aria-pressed', 'true');

		// The screen's context menu works at any zoom (the card button can be tiny on a phone, and
		// the card may sit under the zoom bar), so open it from the keyboard.
		await page.getByRole('button', { name: 'Sign up', exact: true }).focus();
		await page.keyboard.press('Shift+F10');
		await page.getByRole('menuitem', { name: 'Generate design' }).click();
		await expect(page.getByRole('button', { name: 'Regenerate design for Sign up' })).toBeAttached({ timeout: 15_000 });
		expect(api.designCalls).toEqual([{ pageId: expect.any(String), device: 'tablet' }]);

		// The design is the screen's thumbnail on the map.
		const thumb = page.frameLocator('iframe[title="Preview Sign up"]').first();
		await expect(thumb.getByRole('heading', { name: 'Sign up' })).toBeVisible();
		await expect(thumb.getByRole('button', { name: 'Create account' })).toBeVisible();
		const signUp = api.current().document.project.frames.find((f) => f.name === 'Sign up')!;
		expect(signUp.devicePresetId).toBe('tablet');

		await expect(page.getByTestId('design-result')).toContainText('Designed 1 of 1 screen. Running a UX review.');
		await expect.poll(() => api.reviews()).toBe(1);
		await expect(page.getByText('Sign up has no password rules').first()).toBeVisible({ timeout: 15_000 });
	});

	test('generates all screens as a queue that can be cancelled', async ({ page }) => {
		const api = await openMappedProject(page, { designDelayMs: 700 });
		await page.getByTestId('design-all').click();
		await expect(page.getByTestId('design-progress')).toContainText('Designing 1 of 4');
		await expect.poll(() => api.designCalls.length, { timeout: 15_000 }).toBe(2);
		await page.getByTestId('design-cancel').click();
		await expect(page.getByTestId('design-result')).toContainText('Cancelled');
		await expect(page.getByTestId('design-result')).toContainText(/Designed [12] of 4 screens/);
		await page.waitForTimeout(1000);
		expect(api.designCalls.length).toBe(2);
		await expect(page.getByTestId('design-all')).toBeEnabled();
	});

	test('stops the queue at the plan limit and says why', async ({ page }) => {
		const api = await openMappedProject(page, { designAllowance: 3 });
		await page.getByTestId('design-all').click();
		const result = page.getByTestId('design-result');
		await expect(result).toContainText('Designed 3 of 4 screens', { timeout: 15_000 });
		await expect(result).toContainText('free plan includes 3 screen designs');
		await expect(result).toHaveAttribute('role', 'alert');
		expect(api.designCalls).toHaveLength(4);
	});

	test('designed screens show in the click-through prototype', async ({ page }) => {
		await openMappedProject(page);
		await page.getByTestId('design-all').click();
		await expect(page.getByTestId('design-result')).toContainText('Designed 4 of 4 screens', { timeout: 20_000 });
		await page.getByTestId('flow-mode-prototype').click();
		const screen = page.frameLocator('.proto-stage iframe, [class*="proto"] iframe').first();
		await expect(screen.getByRole('heading', { name: 'Welcome' })).toBeVisible({ timeout: 15_000 });
		await page.getByRole('button', { name: /Get started: go to Sign up/ }).click();
		await expect(page.frameLocator('[class*="proto"] iframe').first().getByRole('heading', { name: 'Sign up' })).toBeVisible();
	});
});
