import { expect, test } from './fixtures';

async function openButtonPlayground(page: import('@playwright/test').Page) {
	await page.goto('/#/components/button', { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 20_000 });
}

test.describe('docs playground viewport chrome', () => {
	test('mobile shrinks preview stage only, toolbar stays full width', async ({ browser }) => {
		const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
		await openButtonPlayground(page);
		const frame = page.locator('.playground-frame');
		const toolbar = page.locator('.playground-frame__toolbar');
		const stage = page.getByTestId('playground-stage');

		const frameBefore = await frame.boundingBox();
		const toolbarBefore = await toolbar.boundingBox();
		const stageBefore = await stage.boundingBox();
		expect(frameBefore).not.toBeNull();
		expect(toolbarBefore).not.toBeNull();
		expect(stageBefore).not.toBeNull();
		expect(Math.abs(toolbarBefore!.width - frameBefore!.width)).toBeLessThanOrEqual(3);
		expect(Math.abs(stageBefore!.width - frameBefore!.width)).toBeLessThanOrEqual(3);

		await toolbar.getByRole('button', { name: 'Mobile', exact: true }).click();
		await expect(frame).toHaveAttribute('data-viewport', 'mobile');
		await expect(stage).toHaveCSS('max-width', '375px');

		const frameAfter = await frame.boundingBox();
		const toolbarAfter = await toolbar.boundingBox();
		const stageAfter = await stage.boundingBox();
		expect(Math.abs(toolbarAfter!.width - frameAfter!.width)).toBeLessThanOrEqual(3);
		expect(toolbarAfter!.width).toBeGreaterThan(400);
		expect(stageAfter!.width).toBeLessThanOrEqual(376);
		expect(stageAfter!.width).toBeLessThan(toolbarAfter!.width - 40);

		await expect(toolbar.getByRole('button', { name: 'Desktop', exact: true })).toBeVisible();
		await expect(toolbar.getByRole('button', { name: 'Dark', exact: true })).toBeVisible();
		await page.close();
	});

	test('toolbar controls stay visible on narrow host at mobile stage', async ({ browser }) => {
		const page = await browser.newPage({ viewport: { width: 400, height: 720 } });
		await openButtonPlayground(page);
		const toolbar = page.locator('.playground-frame__toolbar');
		await toolbar.getByRole('button', { name: 'Mobile', exact: true }).click();
		await expect(toolbar.getByRole('button', { name: 'Desktop', exact: true })).toBeVisible();
		await expect(toolbar.getByRole('button', { name: 'Tablet', exact: true })).toBeVisible();
		await page.close();
	});
});
