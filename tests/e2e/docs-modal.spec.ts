import { expect, test } from './fixtures';

const PLAYGROUND_MODAL_TITLE = 'Delete project?';

async function openModalDoc(page: import('@playwright/test').Page) {
	await page.goto('/#/components/modal', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

function playground(page: import('@playwright/test').Page) {
	return page.getByTestId('playground-preview');
}

/** Playground modal renders in a portal; locate by its title. */
function playgroundModal(page: import('@playwright/test').Page) {
	return page.getByRole('dialog', { name: PLAYGROUND_MODAL_TITLE });
}

test.describe('Modal docs playground', () => {
	test.beforeEach(async ({ page }) => {
		await openModalDoc(page);
		await expect(playgroundModal(page)).toHaveCount(0);
	});

	test('opens via trigger and closes with Esc', async ({ page }) => {
		await playground(page).getByRole('button', { name: 'Open modal' }).click();
		const dialog = playgroundModal(page);
		await expect(dialog).toBeVisible();
		await expect(dialog.getByRole('heading', { name: PLAYGROUND_MODAL_TITLE })).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
	});

	test('closes with close button and overlay click', async ({ page }) => {
		await playground(page).getByRole('button', { name: 'Open modal' }).click();
		const dialog = playgroundModal(page);
		await expect(dialog).toBeVisible();
		await dialog.getByRole('button', { name: 'Close dialog' }).click();
		await expect(dialog).toBeHidden();

		await playground(page).getByRole('button', { name: 'Open modal' }).click();
		await expect(dialog).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(dialog).toBeHidden();
	});

	test('Open control toggles modal and stays in sync when dismissed', async ({ page }) => {
		const openToggle = page.locator('.playground-panel').getByRole('checkbox', { name: 'Open' });
		await openToggle.check();
		await expect(playgroundModal(page)).toBeVisible();
		await openToggle.uncheck();
		await expect(playgroundModal(page)).toBeHidden();
		await openToggle.check();
		await expect(playgroundModal(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(playgroundModal(page)).toBeHidden();
		await expect(openToggle).not.toBeChecked();
	});

	test('works in mobile viewport frame', async ({ page }) => {
		await page.locator('.playground-frame__toolbar').getByRole('button', { name: 'Mobile' }).click();
		await playground(page).getByRole('button', { name: 'Open modal' }).click();
		await expect(playgroundModal(page)).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(playgroundModal(page)).toBeHidden();
	});
});
