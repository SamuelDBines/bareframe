import { expect, test, type Page, type Route } from '@playwright/test';
import { createEmptyProjectDocument } from '../../packages/designer-core/dist/index.js';

const PROJECT_ID = 'p-reg-flow';
let idSeq = 0;
const newId = (prefix: string) => `${prefix}-e2e-${++idSeq}`;
const WEBSITE = 'https://example.com';

async function mockApi(page: Page) {
	await page.route('**/api/**', async (route: Route) => {
		const req = route.request();
		const p = new URL(req.url()).pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({
				user: { id: 42, login: 'new-user', name: 'New', avatarUrl: null, email: 'new@example.com' },
				features: { ai: true, llm: false },
			});
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free', limits: {}, usage: {} });
		if (p.endsWith('/api/billing/config')) return json({ stripeEnabled: false });
		if (p.endsWith(`/api/projects/${PROJECT_ID}/website-capture/status`)) {
			return json({ eventCount: 0, screenshotCount: 0, distinctUrlCount: 0 });
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}`)) {
			const doc = createEmptyProjectDocument(PROJECT_ID, 'example.com', 'light', { newId });
			return json({ id: PROJECT_ID, name: 'example.com', version: 1, document: doc });
		}
		if (p.endsWith('/events')) return route.fulfill({ status: 204, body: '' });
		return json({ error: 'not_found' }, 404);
	});
}

test('sign-up and GitHub install preserve the website configure return URL', async ({ page }) => {
	await mockApi(page);
	await page.goto('/#/sign-up');
	const signInHref = await page.getByRole('link', { name: 'Continue with GitHub' }).getAttribute('href');
	expect(signInHref).toContain('returnTo=');
	expect(decodeURIComponent(signInHref ?? '')).toMatch(/%2F%23%2Fapp|\/#\/app/);

	await page.goto(`/#/app/project/${PROJECT_ID}/website-setup?url=${encodeURIComponent(WEBSITE)}`);
	await expect(page.getByTestId('website-capture-setup')).toBeVisible({ timeout: 15_000 });
	await expect(page.getByText('Missing or invalid website URL')).toHaveCount(0);
	const installLink = page.getByRole('link', { name: /Connect GitHub|Continue with GitHub/ }).first();
	if (await installLink.count()) {
		const installHref = await installLink.getAttribute('href');
		expect(decodeURIComponent(installHref ?? '')).toContain('website-setup');
		expect(decodeURIComponent(installHref ?? '')).toMatch(/%2F%23%2F|\/#\//);
	}
	await page.getByRole('link', { name: 'Open flow map' }).first().click();
	await expect(page).toHaveURL(new RegExp(`/app/project/${PROJECT_ID}$`));
	await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
});