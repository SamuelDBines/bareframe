import { expect, test } from './fixtures';

async function openDatePickerDoc(page: import('@playwright/test').Page) {
	await page.goto('/#/components/datepicker', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

test.describe('DatePicker docs playground', () => {
	test('opens calendar popover and selects a date', async ({ page }) => {
		await openDatePickerDoc(page);
		const preview = page.getByTestId('playground-preview');
		await preview.getByText('📅').click();
		const grid = page.getByRole('grid');
		await expect(grid).toBeVisible();

		const day = grid.getByRole('button', { name: /15/i }).first();
		await day.click();
		await expect(grid).toBeHidden();
	});

	test('keyboard opens and closes popover', async ({ page }) => {
		await openDatePickerDoc(page);
		const preview = page.getByTestId('playground-preview');
		await preview.getByText('📅').focus();
		await page.keyboard.press('Enter');
		await expect(page.getByRole('grid')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByRole('grid')).toBeHidden();
	});

	test('typed segments update the field', async ({ page }) => {
		await openDatePickerDoc(page);
		const preview = page.getByTestId('playground-preview');
		const month = preview.getByRole('spinbutton', { name: /month/i });
		await month.click();
		await page.keyboard.type('06');
		await expect(month).toHaveText(/06|6/);
	});
});

test.describe('DatePicker docs — mobile touch', () => {
	test('calendar opens on mobile project', async ({ page }, testInfo) => {
		test.skip(testInfo.project.name !== 'chromium-mobile', 'Mobile project only');
		await openDatePickerDoc(page);
		await page.getByTestId('playground-preview').getByText('📅').click();
		await expect(page.getByRole('grid')).toBeVisible();
	});
});
