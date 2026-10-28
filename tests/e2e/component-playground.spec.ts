import { expect, test } from './fixtures';

test.describe('component playground', () => {
	test('alert controls update preview and snippet', async ({ page }) => {
		await page.goto('/#/components/alert', { waitUntil: 'domcontentloaded' });
		await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 20_000 });

		const preview = page.getByTestId('playground-preview');
		await expect(preview.getByText('Heads up')).toBeVisible();

		await page.getByLabel('Title').fill('Updated title');
		await expect(preview.getByText('Updated title')).toBeVisible();

		await page.getByRole('button', { name: 'success', exact: true }).click();
		await page.getByRole('tab', { name: 'Code' }).first().click();
		const code = page.locator('.docs-code-block, .docs-code-fallback').first();
		await expect(code).toContainText('"success"');

		await page.getByLabel('Variant').selectOption('warning');
		await expect(code).toContainText('"warning"');
	});
});
