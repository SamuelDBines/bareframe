import { expect, test } from './fixtures';

test.describe('docs visual snapshots', () => {
	test('alert page playground', async ({ page }) => {
		await page.goto('/#/components/alert', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Alert', exact: true })).toBeVisible();
		await expect(page.getByTestId('playground-preview')).toHaveScreenshot('alert-playground.png', {
			maxDiffPixelRatio: 0.02,
		});
	});

	test('gallery theme matrix', async ({ page }) => {
		await page.goto('/#/components', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Component gallery' })).toBeVisible();
		await expect(page.locator('.gallery-theme-matrix')).toHaveScreenshot('gallery-themes.png', {
			maxDiffPixelRatio: 0.02,
		});
	});
});
