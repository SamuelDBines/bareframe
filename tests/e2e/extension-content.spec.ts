import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

test.describe.configure({ retries: 0 });

test('built extension manifest is valid MV3', () => {
	const manifestPath = path.join(process.cwd(), 'extension/dist/manifest.json');
	const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
		manifest_version: number;
		background: { service_worker: string };
	};
	expect(manifest.manifest_version).toBe(3);
	expect(manifest.background.service_worker).toBe('background.js');
});

test('content script selector runs in page', async ({ page }) => {
	await page.setContent(`
		<nav class="top"><a id="go" role="link">Continue</a></nav>
	`);
	const selector = await page.evaluate(() => {
		const el = document.querySelector('#go');
		if (!el) return '';
		if (el.id) return `#${CSS.escape(el.id)}`;
		return el.tagName.toLowerCase();
	});
	expect(selector).toBe('#go');
});