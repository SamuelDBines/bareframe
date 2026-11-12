import { expect, test } from './fixtures';

const FIXTURE = '/e2e-fixtures/website-import-stepper/';

test.describe('website import stepper', () => {
	for (const project of ['chromium-desktop', 'chromium-mobile', 'webkit-desktop', 'webkit-mobile'] as const) {
		test(`stepper navigation — ${project}`, async ({ page }, testInfo) => {
			test.skip(testInfo.project.name !== project, `Runs on ${project}`);

			await page.goto(FIXTURE, { waitUntil: 'domcontentloaded' });
			await expect(page.getByTestId('website-capture-setup')).toBeVisible();
			await expect(page.getByTestId('import-stepper')).toBeVisible();
			await expect(page.getByTestId('import-step-0')).toBeVisible();

			const checkbox = page.locator('.website-import__check input');
			await expect(checkbox).toBeVisible();
			const box = await checkbox.boundingBox();
			const label = page.locator('.website-import__check span');
			const labelBox = await label.boundingBox();
			expect(box && labelBox && Math.abs(box.y - labelBox.y) < 40).toBe(true);

			await page.getByTestId('import-next').click();
			await expect(page.getByTestId('import-step-1')).toBeVisible();
			await page.getByTestId('import-next').click();
			await expect(page.getByTestId('import-step-2')).toBeVisible();

			await page.addStyleTag({
				content:
					'*, *::before, *::after { font-family: Arial, Helvetica, sans-serif !important; -webkit-font-smoothing: antialiased; }',
			});

			await expect(page.getByTestId('import-step-visual')).toHaveScreenshot(
				`website-import-step-2-${project}.png`,
				{ maxDiffPixelRatio: 0.03, animations: 'disabled' },
			);
		});
	}
});
