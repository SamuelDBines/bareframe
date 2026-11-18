#!/usr/bin/env node
/**
 * Run inside the render-worker image: launch Chromium and capture a data URL page.
 */
import { chromium } from 'playwright';

const html = `<!DOCTYPE html><html><body><h1>render-worker smoke</h1></body></html>`;
const dataUrl = `data:text/html,${encodeURIComponent(html)}`;

const browser = await chromium.launch({
	headless: true,
	args: ['--no-sandbox', '--disable-setuid-sandbox'],
});
try {
	const context = await browser.newContext({ viewport: { width: 320, height: 200 } });
	const page = await context.newPage();
	await page.goto(dataUrl, { waitUntil: 'load', timeout: 30_000 });
	const png = await page.screenshot({ type: 'png' });
	await context.close();
	if (!png?.length) {
		throw new Error('screenshot buffer was empty');
	}
	console.log(`render-worker playwright smoke OK (${png.length} bytes)`);
} finally {
	await browser.close();
}