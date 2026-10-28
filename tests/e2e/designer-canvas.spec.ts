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

	test('ctrl+wheel over frame preview zooms canvas not the page', async ({ page }) => {
		const zoomLabel = page.locator('.canvas-zoom-controls span');
		const before = await zoomLabel.textContent();
		const frame = page.frameLocator('.frame-preview-iframe').first();
		await frame.locator('body').evaluate((body) => {
			body.dispatchEvent(
				new WheelEvent('wheel', {
					bubbles: true,
					cancelable: true,
					ctrlKey: true,
					deltaY: -48,
					clientX: 80,
					clientY: 120,
				}),
			);
		});
		await page.waitForTimeout(150);
		const after = await zoomLabel.textContent();
		expect(after).not.toBe(before);
		const metrics = await page.evaluate(() => ({
			scrollX: window.scrollX,
			overflow: document.documentElement.scrollWidth > window.innerWidth,
		}));
		expect(metrics.scrollX).toBe(0);
		expect(metrics.overflow).toBe(false);
	});

	test('wheel pan over a frame does not reload preview iframes', async ({ page }) => {
		const iframe = page.locator('.frame-preview-iframe').first();
		const box = await iframe.boundingBox();
		expect(box).toBeTruthy();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
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
		await page.mouse.wheel(-80, 0);
		await page.mouse.wheel(-80, 0);
		await page.waitForTimeout(200);
		const loadsAfter = await page.evaluate(() => {
			const el = document.querySelector('.frame-preview-iframe') as HTMLIFrameElement | null;
			return el?.dataset.loadCount ?? '0';
		});
		expect(loadsAfter).toBe('0');
	});

	test('space pan mode resets after window blur', async ({ page }) => {
		await page.locator('.infinite-canvas').click({ position: { x: 40, y: 40 } });
		await page.keyboard.down('Space');
		await expect(page.locator('.infinite-canvas')).toHaveClass(/infinite-canvas--space-pan/);
		await page.evaluate(() => window.dispatchEvent(new Event('blur')));
		await expect(page.locator('.infinite-canvas')).not.toHaveClass(/infinite-canvas--space-pan/);
	});

	test('middle-drag across frame iframes keeps moving camera left (no pan wall)', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		const readCamX = () =>
			page.evaluate(() => {
				const m = document.querySelector('.canvas-world')?.style.transform?.match(/translate\(([-0-9.]+)px/);
				return m ? parseFloat(m[1]) : 0;
			});
		const iframe = page.locator('.frame-preview-iframe').first();
		const iframeBox = await iframe.boundingBox();
		expect(iframeBox).toBeTruthy();
		const startX = await readCamX();
		await page.mouse.move(iframeBox!.x + 80, iframeBox!.y + 120);
		await page.mouse.down({ button: 'middle' });
		const samples: number[] = [];
		for (let i = 0; i < 28; i++) {
			await page.mouse.move(iframeBox!.x + 80 - i * 32, iframeBox!.y + 120);
			samples.push(await readCamX());
		}
		await page.mouse.up({ button: 'middle' });
		const endX = await readCamX();
		expect(endX).toBeLessThan(startX - 400);
		const tail = samples.slice(-10);
		expect(Math.max(...tail) - Math.min(...tail)).toBeGreaterThan(80);
	});

	test('wheel inside rightmost frame keeps decreasing camera x', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		const readCamX = () =>
			page.evaluate(() => {
				const m = document.querySelector('.canvas-world')?.style.transform?.match(/translate\(([-0-9.]+)px/);
				return m ? parseFloat(m[1]) : 0;
			});
		const startX = await readCamX();
		await page.frameLocator('.frame-preview-iframe').first().locator('body').evaluate((body) => {
			for (let i = 0; i < 20; i++) {
				body.dispatchEvent(
					new WheelEvent('wheel', {
						bubbles: true,
						cancelable: true,
						deltaX: 120,
						deltaY: 0,
						clientX: 120,
						clientY: 200,
					}),
				);
			}
		});
		const endX = await readCamX();
		expect(endX).toBeLessThan(startX - 300);
	});

	test('wheel at canvas-inspector edge: shift+line, line horizontal, page deltaMode', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		const readCamX = () =>
			page.evaluate(() => {
				const m = document.querySelector('.canvas-world')?.style.transform?.match(/translate\(([-0-9.]+)px/);
				return m ? parseFloat(m[1]) : 0;
			});

		const dispatchOnCanvasRightEdge = async (detail: {
			deltaX?: number;
			deltaY?: number;
			deltaMode?: number;
			shiftKey?: boolean;
		}) => {
			await page.evaluate((d) => {
				const canvas = document.querySelector('.infinite-canvas');
				if (!canvas) return;
				const r = canvas.getBoundingClientRect();
				canvas.dispatchEvent(
					new WheelEvent('wheel', {
						bubbles: true,
						cancelable: true,
						clientX: r.right - 10,
						clientY: r.top + r.height / 2,
						deltaX: d.deltaX ?? 0,
						deltaY: d.deltaY ?? 0,
						deltaMode: d.deltaMode ?? 0,
						shiftKey: Boolean(d.shiftKey),
					}),
				);
			}, detail);
		};

		const start = await readCamX();
		for (let i = 0; i < 10; i++) {
			await dispatchOnCanvasRightEdge({ deltaY: 4, deltaX: 0, deltaMode: 1, shiftKey: true });
		}
		expect(await readCamX()).toBeLessThan(start - 80);

		const startLineX = await readCamX();
		for (let i = 0; i < 10; i++) {
			await dispatchOnCanvasRightEdge({ deltaX: 3, deltaY: 0, deltaMode: 1 });
		}
		expect(await readCamX()).toBeLessThan(startLineX - 80);

		const startPage = await readCamX();
		await dispatchOnCanvasRightEdge({ deltaX: 1, deltaY: 0, deltaMode: 2 });
		expect(await readCamX()).toBeLessThan(startPage - 200);

		const metrics = await page.evaluate(() => ({
			scrollX: window.scrollX,
			overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
			bodyOverflowX: getComputedStyle(document.body).overflowX,
		}));
		expect(metrics.scrollX).toBe(0);
		expect(metrics.overflow).toBe(false);
		expect(['clip', 'hidden']).toContain(metrics.bodyOverflowX);
	});

	test('no horizontal document scroll after canvas wheel gestures', async ({ page }) => {
		await page.setViewportSize({ width: 1280, height: 800 });
		const canvas = page.locator('.infinite-canvas');
		const box = await canvas.boundingBox();
		expect(box).toBeTruthy();
		await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
		for (let i = 0; i < 12; i++) {
			await page.mouse.wheel(40, 0);
			await page.mouse.wheel(0, 30);
		}
		const metrics = await page.evaluate(() => ({
			scrollX: window.scrollX,
			overflow: document.documentElement.scrollWidth > window.innerWidth + 1,
		}));
		expect(metrics.scrollX).toBe(0);
		expect(metrics.overflow).toBe(false);
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
