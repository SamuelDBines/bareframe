import { expect, test } from './fixtures';

test.describe('designer canvas', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/#/designer/editor', { waitUntil: 'domcontentloaded', timeout: 60_000 });
		await expect(page.locator('.infinite-canvas')).toBeVisible({ timeout: 30_000 });
		await page.waitForSelector('.frame-preview-iframe', { timeout: 30_000 });
	});

	test('canvas column sits beside inspector (no horizontal overlap)', async ({ page }) => {
		const canvas = page.locator('.infinite-canvas');
		const inspector = page.locator('.designer-inspector');
		const canvasBox = await canvas.boundingBox();
		const inspectorBox = await inspector.boundingBox();
		expect(canvasBox).toBeTruthy();
		expect(inspectorBox).toBeTruthy();
		expect(canvasBox!.x + canvasBox!.width).toBeLessThanOrEqual(inspectorBox!.x + 1);
	});

	test('wheel pan over a frame does not reload preview iframes', async ({ page }) => {
		const iframe = page.locator('.frame-preview-iframe').first();
		await iframe.scrollIntoViewIfNeeded();
		const loadsBefore = await page.evaluate(() => {
			const el = document.querySelector('.frame-preview-iframe') as HTMLIFrameElement | null;
			return el?.dataset.loadCount ?? '0';
		});
		await page.evaluate(() => {
			const el = document.querySelector('.frame-preview-iframe') as HTMLIFrameElement | null;
			if (!el) return;
			el.dataset.loadCount = '0';
			el.addEventListener('load', () => {
				el.dataset.loadCount = String(Number(el.dataset.loadCount ?? 0) + 1);
			});
		});
		const box = await iframe.boundingBox();
		expect(box).toBeTruthy();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		await page.mouse.wheel(-80, 0);
		await page.mouse.wheel(-80, 0);
		await page.waitForTimeout(200);
		const loadsAfter = await page.evaluate(() => {
			const el = document.querySelector('.frame-preview-iframe') as HTMLIFrameElement | null;
			return el?.dataset.loadCount ?? '0';
		});
		expect(loadsAfter).toBe('0');
	});

	test('mobile panels toggle without page overflow', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await expect(page.locator('.designer-panel-toggle').first()).toBeVisible();
		const overflowX = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
		expect(overflowX).toBe(false);
		await page.getByRole('button', { name: 'Pages' }).click();
		await expect(page.locator('.designer-sidebar')).toBeVisible();
		await page.getByRole('button', { name: 'Close panel' }).click();
		await expect(page.locator('.designer-workspace-v2')).toHaveAttribute('data-mobile-panel', 'none');
	});
});
