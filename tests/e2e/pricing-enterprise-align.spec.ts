import { expect, test } from '@playwright/test';

const VIEWPORTS = [
	{ name: 'desktop', width: 1440, height: 900 },
	{ name: 'tablet', width: 834, height: 1100 },
	{ name: 'mobile', width: 390, height: 844 },
] as const;

async function assertEnterpriseBlockAligned(page: import('@playwright/test').Page) {
	const offers = page.getByTestId('pricing-offers');
	const plans = page.getByTestId('pricing-plans');
	const enterprise = page.getByTestId('pricing-enterprise');
	await expect(offers).toBeVisible();
	await expect(plans).toBeVisible();
	await expect(enterprise).toBeVisible();

	const metrics = await page.evaluate(() => {
		const offersEl = document.querySelector('[data-testid="pricing-offers"]');
		const plansEl = document.querySelector('[data-testid="pricing-plans"]');
		const enterpriseEl = document.querySelector('[data-testid="pricing-enterprise"]');
		if (!offersEl || !plansEl || !enterpriseEl) return null;
		const offersBox = offersEl.getBoundingClientRect();
		const plansBox = plansEl.getBoundingClientRect();
		const enterpriseBox = enterpriseEl.getBoundingClientRect();
		const offersCenter = offersBox.left + offersBox.width / 2;
		const enterpriseCenter = enterpriseBox.left + enterpriseBox.width / 2;
		return {
			offersCenterDelta: Math.abs(offersCenter - (window.innerWidth / 2)),
			enterpriseCenterDelta: Math.abs(enterpriseCenter - offersCenter),
			widthDelta: Math.abs(plansBox.width - enterpriseBox.width),
		};
	});

	expect(metrics).not.toBeNull();
	expect(metrics!.offersCenterDelta).toBeLessThan(3);
	expect(metrics!.enterpriseCenterDelta).toBeLessThan(2);
	expect(metrics!.widthDelta).toBeLessThan(2);
}

for (const vp of VIEWPORTS) {
	test(`pricing enterprise block is centred with plan cards (${vp.name})`, async ({ page }, testInfo) => {
		await page.setViewportSize({ width: vp.width, height: vp.height });
		await page.goto('/#/pricing', { waitUntil: 'domcontentloaded' });
		await expect(page.getByTestId('pricing-page')).toBeVisible({ timeout: 20_000 });
		await page.evaluate(() => document.fonts.ready);
		await assertEnterpriseBlockAligned(page);

		if (process.env.VISUAL) {
			await expect(page.getByTestId('pricing-offers')).toHaveScreenshot(`pricing-offers-${vp.name}.png`, {
				maxDiffPixelRatio: 0.03,
				animations: 'disabled',
			});
		}
		testInfo.annotations.push({ type: 'viewport', description: `${vp.width}x${vp.height}` });
	});
}

test('signed-in app shell uses the same pricing route', async ({ page }) => {
	await page.goto('/#/app', { waitUntil: 'domcontentloaded' });
	await page.goto('/#/pricing', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('pricing-page')).toBeVisible({ timeout: 20_000 });
	await assertEnterpriseBlockAligned(page);
});