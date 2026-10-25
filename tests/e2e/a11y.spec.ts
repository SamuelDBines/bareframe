import AxeBuilder from '@axe-core/playwright';
import { expect, gotoDemo, test } from './fixtures';
import { TIER_A_DEMO_SLUGS } from './helpers';

test.describe('@axe Tier A demos', () => {
	for (const slug of TIER_A_DEMO_SLUGS) {
		test(`${slug}`, async ({ page }) => {
			await gotoDemo(page, `/legacy/${slug}/index.html`);
			await expect(page.locator('[data-demo-root]').first()).toBeVisible({ timeout: 20_000 });

			const results = await new AxeBuilder({ page }).include('[data-demo-root]').analyze();

			expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
		});
	}
});
