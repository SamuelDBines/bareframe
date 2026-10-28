import { expect, test } from './fixtures';

const VIEWPORTS = {
	desktop: { width: 1280, height: 800 },
	tablet: { width: 834, height: 1100 },
	mobile: { width: 390, height: 844 },
} as const;

async function setDocsTheme(page: import('@playwright/test').Page, theme: 'light' | 'dark') {
	await page.goto('/', { waitUntil: 'domcontentloaded' });
	await page.evaluate((t) => {
		localStorage.setItem('bareframe-prototype-theme', t);
	}, theme);
}

async function openComponent(page: import('@playwright/test').Page, slug: string) {
	await page.goto(`/#/components/${slug}`, { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 20_000 });
}

async function openIndex(page: import('@playwright/test').Page) {
	await page.goto('/#/components', { waitUntil: 'domcontentloaded' });
	await expect(page.locator('#components-index')).toBeVisible({ timeout: 20_000 });
}

test.describe('docs visual snapshots', () => {
	for (const [label, size] of Object.entries(VIEWPORTS)) {
		test(`alert playground ${label} light`, async ({ page }) => {
			await page.setViewportSize(size);
			await setDocsTheme(page, 'light');
			await openComponent(page, 'alert');
			await expect(page.getByRole('heading', { name: 'Alert', exact: true })).toBeVisible();
			await expect(page.locator('.docs-shell__main')).toHaveScreenshot(`alert-${label}-light.png`, {
				maxDiffPixelRatio: 0.03,
			});
		});
	}

	test('combobox page desktop dark', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.desktop);
		await setDocsTheme(page, 'dark');
		await openComponent(page, 'combobox');
		await expect(page.getByRole('heading', { name: 'Combobox', exact: true })).toBeVisible();
		await expect(page.locator('.docs-shell__main')).toHaveScreenshot('combobox-desktop-dark.png', {
			maxDiffPixelRatio: 0.03,
		});
	});

	test('components index desktop light', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.desktop);
		await setDocsTheme(page, 'light');
		await openIndex(page);
		await expect(page.getByRole('heading', { name: 'Components', exact: true })).toBeVisible();
		await expect(page.locator('#components-index')).toHaveScreenshot('index-desktop-light.png', {
			maxDiffPixelRatio: 0.03,
		});
	});

	test('components index mobile light', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.mobile);
		await setDocsTheme(page, 'light');
		await openIndex(page);
		await expect(page.getByRole('heading', { name: 'Components', exact: true })).toBeVisible();
		await expect(page.locator('#components-index')).toHaveScreenshot('index-mobile-light.png', {
			maxDiffPixelRatio: 0.03,
		});
	});
});

test.describe('docs interaction', () => {
	test('cmd+k opens quick search', async ({ page }) => {
		await openComponent(page, 'alert');
		await page.keyboard.press('Control+K');
		await expect(page.getByRole('dialog', { name: 'Quick search' })).toBeVisible();
	});

	test('playground preview/code tabs', async ({ page }) => {
		await openComponent(page, 'alert');
		await page.getByRole('tab', { name: 'Code' }).first().click();
		await expect(page.locator('.docs-code-block, .docs-code-fallback').first()).toBeVisible();
	});
});
