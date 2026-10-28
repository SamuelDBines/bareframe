import { expect, test } from './fixtures';
import path from 'node:path';

const ARTIFACTS = path.join(process.cwd(), 'test-results', 'qa-artifacts');

test.beforeEach(({}, testInfo) => {
	test.skip(testInfo.project.name !== 'chromium-desktop', 'QA artifacts captured on desktop Chromium only');
});

async function openModalDoc(page: import('@playwright/test').Page) {
	await page.goto('/#/components/modal', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

test('Modal QA artifact screenshot', async ({ page }) => {
	await openModalDoc(page);
	await page.getByTestId('playground-preview').getByRole('button', { name: 'Open modal' }).click();
	const dialog = page.getByRole('dialog', { name: 'Delete project?' });
	await expect(dialog).toBeVisible();
	await page.screenshot({ path: path.join(ARTIFACTS, 'modal-open-desktop.png'), fullPage: false });
});

async function openDatePickerDoc(page: import('@playwright/test').Page) {
	await page.goto('/#/components/datepicker', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

test('DatePicker QA artifact screenshot', async ({ page }) => {
	await openDatePickerDoc(page);
	await page.getByTestId('playground-preview').getByText('📅').click();
	await expect(page.getByRole('grid')).toBeVisible();
	await page.screenshot({ path: path.join(ARTIFACTS, 'datepicker-open-desktop.png'), fullPage: false });
});
