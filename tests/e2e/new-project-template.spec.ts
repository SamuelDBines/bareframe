import { expect, test, type Page, type Route } from '@playwright/test';

async function mockNewProjectTemplate(page: Page) {
	let version = 0;
	let storedDoc: import('@bareframe/designer-core').ProjectDocument | null = null;
	await page.route('**/api/**', async (route: Route) => {
		const p = new URL(route.request().url()).pathname;
		const method = route.request().method();
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({ user: { id: 1, login: 't', name: 'T', avatarUrl: null }, features: { ai: true, llm: false } });
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'pro' });
		if (p.endsWith('/api/templates')) {
			return json({
				flows: [{ id: 'sign-in', title: 'Sign in', description: 'Auth flow' }],
				screens: [],
				categories: ['auth'],
			});
		}
		if (p.endsWith('/api/projects') && method === 'GET') return json({ projects: [] });
		if (p.endsWith('/api/projects') && method === 'POST') {
			const { createEmptyProjectDocument, defaultNewId } = await import('../../packages/designer-core/dist/index.js');
			version = 0;
			storedDoc = createEmptyProjectDocument('p-template-new', 'Sign in', 'light', { newId: defaultNewId });
			return json({
				id: 'p-template-new',
				name: 'Sign in',
				version,
				document: storedDoc,
			});
		}
		if (p.endsWith('/api/projects/p-template-new') && method === 'GET') {
			const { createEmptyProjectDocument, defaultNewId } = await import('../../packages/designer-core/dist/index.js');
			if (!storedDoc) {
				storedDoc = createEmptyProjectDocument('p-template-new', 'Sign in', 'light', { newId: defaultNewId });
			}
			return json({
				id: 'p-template-new',
				name: 'Sign in',
				version,
				document: storedDoc,
			});
		}
		if (p.endsWith('/api/projects/p-template-new/templates/insert') && method === 'POST') {
			const { createEmptyProjectDocument, defaultNewId, insertFlowTemplate, platformForDevices } = await import(
				'../../packages/designer-core/dist/index.js'
			);
			version += 1;
			const base = storedDoc ?? createEmptyProjectDocument('p-template-new', 'Sign in', 'light', { newId: defaultNewId });
			storedDoc = insertFlowTemplate(base, {
				flowTemplateId: 'sign-in',
				platform: platformForDevices(['mobile']),
				platforms: ['mobile'],
				description: 'Sign in',
				newId: defaultNewId,
				merge: false,
			}).document;
			return json({ version, document: storedDoc });
		}
		if (p.endsWith('/api/projects/p-template-new/screen-designs')) return json({ designs: [] });
		if (p.endsWith('/api/billing/config')) return json({ stripeEnabled: false });
		if (p.includes('/reviews')) return json({ issues: [] });
		if (p.endsWith('/events')) return route.fulfill({ status: 204, body: '' });
		return json({ error: 'not_found' }, 404);
	});
}

test('new project from flow template', async ({ page }) => {
	await mockNewProjectTemplate(page);
	await page.goto('/#/app');
	await expect(page.getByTestId('new-project')).toBeVisible({ timeout: 30_000 });
	await page.getByTestId('new-project').click();
	await page.locator('[data-start="template"]').click();
	await expect(page.getByTestId('new-project-flow-template')).toBeVisible();
	await page.getByTestId('new-project-dialog').locator('form').evaluate((f) => {
		f.requestSubmit();
	});
	await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
	await expect(page.locator('[data-testid="flow-map-card-hit"]')).toHaveCount(4);
});