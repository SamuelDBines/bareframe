import { expect, test } from './fixtures';
import { deviceForPlaywrightProject, templatePreviewSrcDoc } from './templatePreviewHtml.js';

// Keep pixel diffs stable across desktop and mobile Playwright projects on CI.
test.use({ deviceScaleFactor: 1 });

test.beforeEach(async ({ page }) => {
	await page.route(/\b(fonts\.googleapis|fonts\.gstatic)\.com\b/i, (route) => route.abort());
});

const LOGIN_VARIANTS = ['classic', 'social-first', 'magic-link', 'split-hero', 'minimal'] as const;
const REGISTER_VARIANTS = ['classic', 'multi-step', 'social-plus-email', 'invite'] as const;

async function mountPreview(
	page: import('@playwright/test').Page,
	srcdoc: string,
	width: number,
	height: number,
) {
	await page.setContent(
		`<!DOCTYPE html><html><body style="margin:0;background:#e8e6f0"><iframe id="frame" title="preview" style="width:${width}px;height:${height}px;border:0;display:block;margin:0 auto"></iframe></body></html>`,
	);
	await page.evaluate((html) => {
		const frame = document.getElementById('frame') as HTMLIFrameElement;
		frame.srcdoc = html;
	}, srcdoc);
	const frame = page.frameLocator('#frame');
	await expect(frame.locator('body')).toBeVisible({ timeout: 20_000 });
	await frame.locator('body').evaluate(async () => {
		if (document.fonts?.ready) await document.fonts.ready;
		const imgs = [...document.images];
		await Promise.all(
			imgs.map((img) =>
				img.complete
					? Promise.resolve()
					: new Promise<void>((resolve) => {
							img.addEventListener('load', () => resolve(), { once: true });
							img.addEventListener('error', () => resolve(), { once: true });
						}),
			),
		);
	});
	await frame.locator('html').evaluate((root) => {
		root.style.setProperty('--bf-theme-font-family', 'ui-sans-serif, system-ui, sans-serif');
		const body = root.ownerDocument.body;
		body.style.fontFamily = 'ui-sans-serif, system-ui, sans-serif';
		body.style.setProperty('-webkit-font-smoothing', 'auto');
	});
	await frame.locator('body').evaluate(() => {
		return new Promise<void>((resolve) => {
			requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
		});
	});
	return frame;
}

for (const variantId of LOGIN_VARIANTS) {
	test(`login ${variantId} visual`, async ({ page, baseURL }, testInfo) => {
		const device = deviceForPlaywrightProject(testInfo.project.name);
		const srcdoc = templatePreviewSrcDoc('login', variantId, device, `${baseURL}/`);
		const size = device === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
		const frame = await mountPreview(page, srcdoc, size.width, size.height);
		await expect(frame.locator('body')).toHaveScreenshot(`login-${variantId}.png`, {
			maxDiffPixelRatio: 0.03,
			animations: 'disabled',
			scale: 'css',
		});
	});
}

for (const variantId of REGISTER_VARIANTS) {
	test(`register ${variantId} visual`, async ({ page, baseURL }, testInfo) => {
		const device = deviceForPlaywrightProject(testInfo.project.name);
		const srcdoc = templatePreviewSrcDoc('register', variantId, device, `${baseURL}/`);
		const size = device === 'phone' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
		const frame = await mountPreview(page, srcdoc, size.width, size.height);
		await expect(frame.locator('body')).toHaveScreenshot(`register-${variantId}.png`, {
			maxDiffPixelRatio: 0.03,
			animations: 'disabled',
			scale: 'css',
		});
	});
}