import { expect, test } from './fixtures';

const PLAYGROUND_DRAWER_TITLE = 'Filters';

async function openDrawerDoc(page: import('@playwright/test').Page) {
	await page.goto('/#/components/drawer', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

function playgroundDrawer(page: import('@playwright/test').Page) {
	return page.getByRole('dialog', { name: PLAYGROUND_DRAWER_TITLE });
}

test.describe('Drawer docs playground', () => {
	test('opens, closes with Esc, syncs Open control', async ({ page }) => {
		await openDrawerDoc(page);
		await page.getByTestId('playground-preview').getByRole('button', { name: 'Open drawer' }).click();
		await expect(playgroundDrawer(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(playgroundDrawer(page)).toBeHidden();

		const openToggle = page.locator('.playground-panel').getByRole('checkbox', { name: 'Open' });
		await openToggle.check();
		await expect(playgroundDrawer(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(openToggle).not.toBeChecked();
	});
});
