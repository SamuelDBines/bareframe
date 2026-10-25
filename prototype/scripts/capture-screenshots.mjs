#!/usr/bin/env node
/**
 * Capture static screenshots of every prototype screen (requires prior `pnpm run build`).
 */
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prototypeRoot = path.resolve(__dirname, '..');
const outDir = path.join(prototypeRoot, 'artifacts', 'screenshots');

const STATIC_SCREENS = [
	{ file: '01-site-landing.png', hash: '#/' },
	{ file: '02-site-pricing.png', hash: '#/pricing' },
	{ file: '03-site-sign-up.png', hash: '#/sign-up' },
	{ file: '04-site-sign-in.png', hash: '#/sign-in' },
	{ file: '05-components-gallery.png', hash: '#/components' },
	{ file: '06-components-button-detail.png', hash: '#/components/button' },
	{ file: '07-components-tokens.png', hash: '#/components/tokens' },
	{ file: '08-components-mcp.png', hash: '#/components/mcp' },
	{ file: '09-designer-dashboard.png', hash: '#/designer' },
	{ file: '10-designer-canvas-frames.png', hash: '#/designer/editor' },
	{ file: '11-designer-themes-workspace.png', hash: '#/designer/themes' },
	{ file: '12-designer-export.png', hash: '#/designer/export' },
	{ file: '13-designer-agent-mcp.png', hash: '#/designer/settings/agent' },
];

function startPreview() {
	return new Promise((resolve, reject) => {
		const child = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', '4173'], {
			cwd: prototypeRoot,
			stdio: ['ignore', 'pipe', 'pipe'],
		});
		let ready = false;
		const onData = (buf) => {
			const s = buf.toString();
			if (!ready && /localhost|127\.0\.0\.1/.test(s)) {
				ready = true;
				resolve(child);
			}
		};
		child.stdout.on('data', onData);
		child.stderr.on('data', onData);
		child.on('error', reject);
		setTimeout(() => {
			if (!ready) reject(new Error('vite preview did not start'));
		}, 15000);
	});
}

async function main() {
	await fs.mkdir(outDir, { recursive: true });
	const preview = await startPreview();
	const base = 'http://127.0.0.1:4173/';

	const browser = await chromium.launch();
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

	for (const { file, hash } of STATIC_SCREENS) {
		await page.goto(`${base}${hash}`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(500);
		await page.screenshot({ path: path.join(outDir, file), fullPage: true });
		console.log('wrote', file);
	}

	await page.goto(`${base}#/designer/editor`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(600);
	await page.locator('.canvas-subtoolbar .bf-select-field').filter({ hasText: 'Compare' }).locator('select').selectOption('matrix');
	await page.waitForTimeout(600);
	await page.click('button:has-text("Fit all")');
	await page.waitForTimeout(500);
	await page.screenshot({ path: path.join(outDir, '14-designer-compare-matrix.png'), fullPage: true });
	console.log('wrote 14-designer-compare-matrix.png');

	await page.goto(`${base}#/designer/editor`, { waitUntil: 'networkidle' });
	await page.waitForTimeout(500);
	const exitBtn = page.locator('button:has-text("Exit")');
	if (await exitBtn.isVisible().catch(() => false)) await exitBtn.click();
	await page.locator('.canvas-frame-wrap:not(.ghost)').first().click();
	await page.waitForTimeout(300);
	await page.getByRole('button', { name: 'Trial', exact: true }).click({ force: true });
	await page.waitForTimeout(400);
	await page.locator('.canvas-frame-wrap:not(.ghost)').first().click();
	await page.keyboard.press('Shift+2');
	await page.waitForTimeout(600);
	await page.screenshot({ path: path.join(outDir, '15-designer-style-trial.png'), fullPage: true });
	console.log('wrote 15-designer-style-trial.png');

	await browser.close();
	preview.kill('SIGTERM');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
