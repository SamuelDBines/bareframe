import { expect, test, type Page, type Route } from '@playwright/test';
import {
	applyFlowSpec,
	createEmptyProjectDocument,
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

type MockOptions = { refineStatus?: number; generateDelayMs?: number };

async function mockApi(page: Page, options: MockOptions = {}) {
	let version = 1;
	let document: ProjectDocument = createEmptyProjectDocument(PROJECT_ID, 'Habitual', 'light', { newId });
	document.project.pages = [];
	const generateBodies: Record<string, unknown>[] = [];
	let conflicts = 0;

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
		if (p.endsWith(`/api/projects/${PROJECT_ID}/reviews`)) return json({ runs: [] });
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
			generateBodies.push(body);
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
	return { generateBodies, current: () => ({ version, document, conflicts }) };
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
		expect(api.generateBodies[0]).toMatchObject({ platform: 'tablet', baseVersion: 1 });

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
