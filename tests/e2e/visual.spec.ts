import { expect, gotoDemo, test } from './fixtures';

/**
 * Pixel snapshots are intentionally opt-in (VISUAL=1) to avoid CI noise.
 * Uses `pnpm exec playwright test --update-snapshots` when capturing baselines.
 */
test.describe('visual subset (VISUAL=1)', () => {
	test('button demo — deterministic shell', async ({ page }, testInfo) => {
		test.skip(!process.env.VISUAL, 'Set VISUAL=1 to enable screenshot comparison');

		await gotoDemo(page, '/legacy/button/index.html');
		await page.locator('#themeSelect').selectOption('system');
		const root = page.locator('[data-demo-root]');
		await expect(root).toBeVisible();

		await expect(root).toHaveScreenshot(`button-tier-a-${testInfo.project.name}.png`, {
			maxDiffPixels: 200,
			animations: 'disabled',
		});
	});
});
