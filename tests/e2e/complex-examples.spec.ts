import { test, expect } from '@playwright/test';

const JOURNEY_MAP_ROUTES = [
	{ path: '/#/demo/b2b-workspace', minCards: 15 },
	{ path: '/#/demo/marketplace-fulfilment', minCards: 15 },
	{ path: '/#/demo/med-schedule', minCards: 15 },
] as const;

test.describe('public journey examples', () => {
	test('examples gallery lists all journey demos in one grid', async ({ page }) => {
		await page.goto('/#/examples');
		await expect(page.getByRole('heading', { name: /See Bareframe on a real flow/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Complex journeys' })).toHaveCount(0);
		const cards = page.locator('.example-card');
		expect(await cards.count()).toBe(8);
		await expect(page.getByRole('link', { name: /LatticeDesk workspace/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Arbor Market/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /MedSchedule appointments/i })).toBeVisible();
		await expect(page.locator('.example-card__cta').first()).toHaveText('Open example →');
	});

	for (const route of JOURNEY_MAP_ROUTES) {
		test(`smoke: ${route.path} map loads`, async ({ page }) => {
			await page.goto(route.path);
			await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
			const mapCards = page.locator('.flow-map-card');
			await expect(mapCards.first()).toBeVisible();
			expect(await mapCards.count()).toBeGreaterThanOrEqual(route.minCards);
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
