import { expect, gotoDemo, test } from './fixtures';
import { MATRIX_THEMES, TIER_A_DEMO_SLUGS, themeMatrixLocator } from './helpers';

const SURFACE_EXPECT: Record<(typeof MATRIX_THEMES)[number], string> = {
	system: '#ffffff',
	dark: '#0b1220',
	matrix: '#070c09',
};

test.describe('Tier A theme matrix', () => {
	for (const slug of TIER_A_DEMO_SLUGS) {
		test(`demo ${slug} resolves tokens across themes`, async ({ page }) => {
			await gotoDemo(page, `/${slug}/index.html`);
			await expect(page.locator('[data-demo-root]').first()).toBeVisible({ timeout: 20_000 });
			const primary = themeMatrixLocator(page, slug);
			await expect(primary).toBeVisible({ timeout: 20_000 });

			for (const theme of MATRIX_THEMES) {
				await page.locator('#themeSelect').selectOption(theme);
				await expect
					.poll(async () =>
						page.evaluate(() => document.documentElement.getAttribute('data-bf-theme')),
					)
					.toBe(theme);

				await expect.poll(async () => {
					const raw = await page.evaluate(() =>
						getComputedStyle(document.documentElement).getPropertyValue('--bf-theme-surface-1').trim(),
					);
					return raw.toLowerCase();
				}).toBe(SURFACE_EXPECT[theme]);

				const demo = page.locator('[data-demo-root]').first();
				const box = await primary.boundingBox();
				expect(box && box.width > 0 && box.height > 0, `${slug} visible under ${theme}`).toBeTruthy();
				await expect(demo).toBeVisible();
			}
		});
	}
});
