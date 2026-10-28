import { expect, test } from './fixtures';

async function openIndex(page: import('@playwright/test').Page) {
	await page.goto('/#/components', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('#components-index')).toBeVisible({ timeout: 20_000 });
	await expect(page.locator('.docs-gallery-card').first()).toBeVisible();
}

const INDEX_WIDTHS = [
	{ label: 'desktop', width: 1440 },
	{ label: 'laptop', width: 1024 },
	{ label: 'mobile', width: 390 },
] as const;

for (const { label, width } of INDEX_WIDTHS) {
	test(`gallery pagination and breadcrumbs at ${label} (${width}px)`, async ({ page }) => {
		await page.setViewportSize({ width, height: 900 });
		await openIndex(page);

		const pagination = page.locator('a[href="#/components/pagination"] .bf-pagination--gallery');
		await expect(pagination).toHaveCSS('flex-wrap', 'nowrap');
		await expect(pagination.locator('button').last()).toBeVisible();

		const breadcrumbs = page.locator('a[href="#/components/breadcrumbs"] .bf-breadcrumbs--gallery ol');
		await expect(breadcrumbs).toHaveCSS('flex-wrap', 'nowrap');

		const progressLabel = page.locator('a[href="#/components/progress"] .bf-progress--gallery .bf-progress__label');
		const gap = await progressLabel.evaluate((el) => getComputedStyle(el).gap);
		expect(gap).not.toBe('0px');
		expect(gap).not.toBe('normal');
	});
}
