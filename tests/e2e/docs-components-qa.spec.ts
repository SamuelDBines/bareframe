import { expect, test } from './fixtures';

const COMPONENT_SLUGS = [
	'alert',
	'badge',
	'button',
	'card',
	'checkbox',
	'switch',
	'field',
	'input',
	'textarea',
	'select',
	'slider',
	'radio-group',
	'multiselect',
	'combobox',
	'modal',
	'drawer',
	'tooltip',
	'popover',
	'dropdown-menu',
	'tabs',
	'breadcrumbs',
	'pagination',
	'accordion',
	'toast',
	'progress',
	'spinner',
	'skeleton',
	'avatar',
	'table',
	'empty-state',
	'stat-card',
	'calendar',
	'datepicker',
] as const;

async function openComponent(page: import('@playwright/test').Page, slug: string) {
	await page.goto(`/#/components/${slug}`, { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

test.describe('docs component QA — playground smoke', () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-desktop', 'Full component sweep runs on desktop Chromium');
	});

	for (const slug of COMPONENT_SLUGS) {
		test(`${slug} playground renders`, async ({ page }) => {
			await openComponent(page, slug);
			await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
		});
	}
});

test.describe('docs index gallery', () => {
	test('gallery loads all cards', async ({ page }) => {
		await page.goto('/#/components', { waitUntil: 'domcontentloaded' });
		await expect(page.locator('#components-index')).toBeVisible();
		await expect(page.locator('.docs-gallery-card')).toHaveCount(COMPONENT_SLUGS.length);
	});
});
