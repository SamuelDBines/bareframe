import { expect, test, type Page, type Route } from '@playwright/test';

const PROJECT_ID = 'p-swap-variant';

async function mockProjectWithSignIn(page: Page) {
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
		if (p.endsWith('/api/plan')) return json({ tier: 'pro' });
		if (p.endsWith(`/api/projects/${PROJECT_ID}`) && route.request().method() === 'GET') {
			const { createEmptyProjectDocument, defaultNewId, insertFlowTemplate, platformForDevices } = await import(
				'../../packages/designer-core/dist/index.js'
			);
			const base = createEmptyProjectDocument(PROJECT_ID, 'Auth', 'light', { newId: defaultNewId });
			const { document } = insertFlowTemplate(base, {
				flowTemplateId: 'sign-in',
				platform: platformForDevices(['mobile']),
				platforms: ['mobile'],
				description: 'Sign in',
				newId: defaultNewId,
				merge: false,
			});
			return json({ id: PROJECT_ID, name: 'Auth', version: 1, document });
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/screen-designs`)) return json({ designs: [] });
		if (p.endsWith('/api/billing/config')) return json({ stripeEnabled: false });
		if (p.includes('/reviews')) return json({ issues: [] });
		if (p.endsWith('/events')) return route.fulfill({ status: 204, body: '' });
		return json({ error: 'not_found' }, 404);
	});
}

test('swap login template variant on map', async ({ page }) => {
	await mockProjectWithSignIn(page);
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await page.goto(`/#/app/project/${PROJECT_ID}`);
	await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
	await page.locator('.flow-map-card').filter({ hasText: 'Log in' }).getByTestId('flow-map-card-hit').click();
	await expect(page.getByTestId('variant-swap-panel')).toBeVisible();
	const select = page.getByTestId('variant-swap-select');
	await select.selectOption('social-first');
	await expect(select).toHaveValue('social-first');
	await expect(page.locator('[data-testid="flow-map-card-hit"]').first()).toBeVisible();
});