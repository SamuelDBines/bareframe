import { expect, test, type Page, type Route } from '@playwright/test';
import { insertFlowTemplate, createEmptyProjectDocument, defaultNewId, platformForDevices } from '../../packages/designer-core/dist/index.js';

const PROJECT_ID = 'p-device-switch';

async function mockProject(page: Page) {
	let version = 1;
	const doc = insertFlowTemplate(createEmptyProjectDocument(PROJECT_ID, 'Device test', 'light', { newId: defaultNewId }), {
		flowTemplateId: 'sign-in',
		platform: platformForDevices(['mobile']),
		platforms: ['mobile'],
		description: 'Sign in',
		newId: defaultNewId,
		merge: false,
	}).document;

	await page.route('**/api/**', async (route: Route) => {
		const p = new URL(route.request().url()).pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({
				user: { id: 1, login: 't', name: 'T', avatarUrl: null, email: 't@example.com' },
				features: { ai: true, llm: false },
			});
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'pro', limits: {}, usage: {} });
		if (p.endsWith(`/api/projects/${PROJECT_ID}`) && route.request().method() === 'GET') {
			return json({ id: PROJECT_ID, name: 'Device test', version, document: doc });
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/screen-designs`)) return json({ designs: [] });
		if (p.endsWith('/api/templates')) return json({ screens: [], flows: [], categories: [] });
		if (p.endsWith('/api/billing/config')) return json({ stripeEnabled: false });
		if (p.includes('/reviews')) return json({ issues: [] });
		if (p.endsWith('/events')) return route.fulfill({ status: 204, body: '' });
		return json({ error: 'not_found' }, 404);
	});
}

async function openFlowMap(page: Page) {
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await page.goto(`/#/app/project/${PROJECT_ID}`);
	await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
}

test('map preview device switch changes card breakpoint', async ({ page }) => {
	await mockProject(page);
	await openFlowMap(page);
	await expect(page.getByTestId('design-bar')).toBeVisible();
	const card = page.locator('[data-map-preview-device]').first();
	await expect(card).toHaveAttribute('data-map-preview-device', 'phone');
	await page.getByTestId('device-viewport-switch').getByRole('button', { name: /Tablet/i }).click();
	await expect(page.getByTestId('device-viewport-switch').getByRole('button', { name: /Tablet/i })).toHaveAttribute(
		'aria-pressed',
		'true',
	);
	await expect(card).toHaveAttribute('data-map-preview-device', 'tablet');
	await page.getByTestId('device-viewport-switch').getByRole('button', { name: /Desktop/i }).click();
	await expect(card).toHaveAttribute('data-map-preview-device', 'desktop');
});