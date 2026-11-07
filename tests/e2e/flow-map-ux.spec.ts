import { test, expect, type Page, type Route } from '@playwright/test';

async function mockApiSignedOut(page: Page) {
	await page.route('**/api/**', (route: Route) => {
		const url = new URL(route.request().url());
		const p = url.pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) return json({ user: null });
		if (p.endsWith('/api/plan')) return json({ tier: 'free' });
		return json({ error: 'not_found' }, 404);
	});
}

async function visitEditableFlowMap(page: Page) {
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await mockApiSignedOut(page);
	await page.goto('/#/app/project/local-draft');
	await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
	await page.getByTestId('flow-mode-edit').click();
	await expect(page.getByTestId('flow-add-screen')).toBeVisible();
}

async function visitDemoReview(page: Page) {
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await page.goto('/#/demo/journey-review');
	await expect(page.locator('.flow-map-card').first()).toBeVisible({ timeout: 30_000 });
}

test.describe('flow map UX', () => {
	test('screen context menu opens and delete confirms', async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.name.includes('mobile'),
			'Desktop-only: flow cards are off-viewport on narrow layouts until #34 lands',
		);
		await visitEditableFlowMap(page);
		await page.getByRole('button', { name: 'Fit', exact: true }).click();
		await page.waitForTimeout(400);
		const card = page.locator('.flow-map-card').first();
		await card.scrollIntoViewIfNeeded();
		await card.click({ button: 'right' });
		await expect(page.locator('.flow-context-menu')).toBeVisible();
		await page.getByRole('menuitem', { name: 'Delete screen' }).click();
		await expect(page.getByRole('dialog', { name: /Delete/i })).toBeVisible();
		await page.getByRole('button', { name: 'Cancel' }).click();
	});

	test('toolbar exposes icon actions and tour replay', async ({ page }, testInfo) => {
		test.skip(
			testInfo.project.name.includes('mobile'),
			'Desktop-only: toolbar tour overlay clipped on mobile until #34 lands',
		);
		await visitEditableFlowMap(page);
		await expect(page.getByTestId('flow-add-screen')).toBeVisible();
		await expect(page.getByTestId('flow-connect-screens')).toBeVisible();
		await page.getByTestId('flow-tour-help').click();
		await expect(page.getByTestId('flow-map-tour')).toBeVisible();
		await page.getByTestId('flow-tour-next').click();
	});

	test('tour dismiss persists in localStorage', async ({ page }) => {
		await visitDemoReview(page);
		await page.getByTestId('flow-tour-help').click();
		await expect(page.getByTestId('flow-map-tour')).toBeVisible();
		await page.getByRole('button', { name: "Don't show again" }).click();
		await expect(page.getByTestId('flow-map-tour')).toHaveCount(0);
		const dismissed = await page.evaluate(() =>
			JSON.parse(localStorage.getItem('bareframe.flowMapTour.v1') ?? '{}').dismissed,
		);
		expect(dismissed).toBe(true);
	});
});
