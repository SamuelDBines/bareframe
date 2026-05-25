import { test as baseTest, expect } from '@playwright/test';

/**
 * Local demos load PayPal widgets from a CDN; blocking them keeps `page.goto`
 * from hanging on external `load` and matches CI network isolation for those assets.
 */
export const test = baseTest.extend({
	page: async ({ page }, use) => {
		await page.route(/\b(paypalobjects|paypal)\.com\b/i, (route) => route.abort());
		await use(page);
	},
});

/** Demos embed third-party scripts; `domcontentloaded` matches our structural assertions reliably. */
export async function gotoDemo(page: import('@playwright/test').Page, path: string): Promise<void> {
	await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45_000 });
}

export { expect };
