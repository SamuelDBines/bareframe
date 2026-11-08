import { test, expect } from '@playwright/test';

const COMPLEX_ROUTES = [
	{ path: '/#/examples', heading: /See Bareframe on a real flow/i },
	{ path: '/#/demo/b2b-workspace', workspace: 'flow-map-workspace', minCards: 15 },
	{ path: '/#/demo/marketplace-fulfilment', workspace: 'flow-map-workspace', minCards: 15 },
	{ path: '/#/demo/med-schedule', workspace: 'flow-map-workspace', minCards: 15 },
] as const;

test.describe('complex public examples', () => {
	test('examples gallery lists complex journeys', async ({ page }) => {
		await page.goto('/#/examples');
		await expect(page.getByRole('heading', { name: /Complex journeys/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /B2B workspace/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Marketplace purchase/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Book, reschedule/i })).toBeVisible();
	});

	for (const route of COMPLEX_ROUTES.slice(1)) {
		test(`smoke: ${route.path} map loads`, async ({ page }) => {
			await page.goto(route.path);
			await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
			const cards = page.locator('.flow-map-card');
			await expect(cards.first()).toBeVisible();
			expect(await cards.count()).toBeGreaterThanOrEqual(route.minCards);
		});
	}

	test('b2b prototype exposes branch hotspots', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
		});
		await page.goto('/#/demo/b2b-workspace');
		await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
		await page.getByTestId('flow-mode-prototype').click();
		await expect(page.getByTestId('prototype-player')).toBeVisible();
		const hotspots = page.locator('.proto-hotspot');
		await expect(hotspots.first()).toBeVisible();
		expect(await hotspots.count()).toBeGreaterThanOrEqual(2);
		await page.getByRole('button', { name: 'Close prototype' }).click();
	});
});
