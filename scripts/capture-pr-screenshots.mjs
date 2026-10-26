import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(root, '..', 'artifacts', 'screenshots');
const base = process.env.PW_BASE_URL || 'http://127.0.0.1:4173';

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

const shots = [
	{ file: 'components-gallery-interactive.png', url: `${base}/#/components` },
	{ file: 'component-alert-playground.png', url: `${base}/#/components/alert` },
	{ file: 'component-button-playground.png', url: `${base}/#/components/button` },
];

for (const shot of shots) {
	await page.goto(shot.url, { waitUntil: 'domcontentloaded' });
	await page.waitForTimeout(400);
	await page.screenshot({ path: path.join(out, shot.file), fullPage: true });
}

await browser.close();
console.log('Wrote screenshots to', out);
