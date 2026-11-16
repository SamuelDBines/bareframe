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

	test('button variant, size and disabled controls change how the preview looks', async ({ page }) => {
		await page.goto('/#/components/button', { waitUntil: 'domcontentloaded' });
		const button = page.getByTestId('playground-preview').getByRole('button', { name: 'Save changes' });
		await expect(button).toBeVisible({ timeout: 20_000 });
		const look = () =>
			button.evaluate((el) => {
				const cs = getComputedStyle(el);
				return { bg: cs.backgroundColor, border: cs.borderTopColor, padding: cs.padding, opacity: cs.opacity };
			});

		// Background and opacity animate, so poll until they settle.
		await expect.poll(async () => (await look()).bg).not.toBe('rgba(0, 0, 0, 0)');
		await page.getByLabel('Variant').selectOption('ghost');
		await expect.poll(async () => (await look()).bg).toBe('rgba(0, 0, 0, 0)');

		const md = (await look()).padding;
		await page.getByLabel('Size').selectOption('lg');
		await expect.poll(async () => (await look()).padding).not.toBe(md);
		await page.getByLabel('Size').selectOption('sm');
		await expect.poll(async () => (await look()).padding).not.toBe(md);

		await page.getByRole('complementary', { name: 'Playground controls' }).getByRole('checkbox', { name: 'Disabled' }).check();
		await expect(button).toBeDisabled();
		await expect.poll(async () => Number((await look()).opacity)).toBeLessThan(1);
	});

	test('preview state control shows each state', async ({ page }) => {
		await page.goto('/#/components/button', { waitUntil: 'domcontentloaded' });
		const preview = page.getByTestId('playground-preview');
		const button = preview.getByRole('button', { name: 'Save changes' });
		await expect(button).toBeVisible({ timeout: 20_000 });
		const state = page.getByLabel('Preview state');

		await state.selectOption('focus');
		await expect(button).toHaveAttribute('data-bf-preview-state', 'focus');
		await expect(button).toHaveCSS('outline-style', 'solid');

		await state.selectOption('hover');
		await expect(button).toHaveAttribute('data-bf-preview-state', 'hover');

		await state.selectOption('disabled');
		await expect(button).toBeDisabled();
		await expect(button).not.toHaveAttribute('data-bf-preview-state');

		await state.selectOption('loading');
		await expect(button.locator('.bf-btn__spinner')).toBeVisible();
		await expect(button).toBeDisabled();

		await state.selectOption('dismiss');
		await expect(page.getByTestId('playground-dismissed')).toBeVisible();
		await state.selectOption('default');
		await expect(button).toBeEnabled();
	});

	test('moving between components resets the playground', async ({ page }) => {
		await page.goto('/#/components/button', { waitUntil: 'domcontentloaded' });
		await expect(page.getByTestId('playground-preview').getByRole('button', { name: 'Save changes' })).toBeVisible({
			timeout: 20_000,
		});
		await page.getByLabel('Label').fill('Ship it');
		// Input is a void element: carrying Button's label over as children used to crash the page.
		await page.goto('/#/components/input', { waitUntil: 'domcontentloaded' });
		await expect(page.getByRole('heading', { name: 'Input', exact: true })).toBeVisible();
		await expect(page.getByTestId('playground-preview')).toBeVisible();
		await page.goto('/#/components/button', { waitUntil: 'domcontentloaded' });
		await expect(page.getByLabel('Label')).toHaveValue('Save changes');
	});
});
