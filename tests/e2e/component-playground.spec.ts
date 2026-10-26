import { expect, test } from './fixtures';

test.describe('component playground', () => {
	test('alert controls update preview and snippet', async ({ page }) => {
		await page.goto('/#/components/alert', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Alert', exact: true })).toBeVisible();

		const preview = page.getByTestId('playground-preview');
		await expect(preview.getByText('Heads up')).toBeVisible();

		await page.getByLabel('Title').fill('Updated title');
		await expect(preview.getByText('Updated title')).toBeVisible();

		await page.getByRole('button', { name: 'success', exact: true }).click();
		const snippet = page.getByTestId('playground-snippet');
		await expect(snippet).toContainText('"success"');

		await page.getByLabel('Variant').selectOption('warning');
		await expect(snippet).toContainText('"warning"');
	});
});
