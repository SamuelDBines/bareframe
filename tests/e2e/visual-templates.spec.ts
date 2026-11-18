import { expect, test } from './fixtures';
import { buildScreenVariantTree } from '../../packages/designer-core/dist/index.js';

test.describe('template visuals (VISUAL=1)', () => {
	for (const [id, variant] of [
		['login', 'classic'],
		['login', 'social-first'],
		['register', 'classic'],
		['checkout', 'classic'],
		['marketing-home', 'classic'],
	] as const) {
		test(`${id} ${variant} thumbnail`, async ({ page }, testInfo) => {
			test.skip(!process.env.VISUAL, 'Set VISUAL=1 to enable screenshot comparison');
			const tree = buildScreenVariantTree(id, variant, 'phone');
			await page.setContent(
				`<pre data-testid="tree" style="font:12px/1.4 monospace;padding:16px;white-space:pre-wrap">${JSON.stringify(tree, null, 2)}</pre>`,
			);
			await expect(page.getByTestId('tree')).toHaveScreenshot(`template-${id}-${variant}-${testInfo.project.name}.png`, {
				maxDiffPixelRatio: testInfo.project.name.includes('mobile') ? 0.03 : undefined,
			});
		});
	}
});