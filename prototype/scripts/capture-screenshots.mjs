#!/usr/bin/env node
/**
 * Capture static screenshots of every prototype screen (requires prior `pnpm run build`).
 * Run from repo root: node prototype/scripts/capture-screenshots.mjs
 */
import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prototypeRoot = path.resolve(__dirname, '..');
const outDir = path.join(prototypeRoot, 'artifacts', 'screenshots');

const SCREENS = [
	{ file: '01-site-landing.png', hash: '#/' },
	{ file: '02-site-pricing.png', hash: '#/pricing' },
	{ file: '03-site-sign-up.png', hash: '#/sign-up' },
	{ file: '04-site-sign-in.png', hash: '#/sign-in' },
	{ file: '05-components-gallery.png', hash: '#/components' },
	{ file: '06-components-button-detail.png', hash: '#/components/button' },
	{ file: '07-components-tokens.png', hash: '#/components/tokens' },
	{ file: '08-components-mcp.png', hash: '#/components/mcp' },
	{ file: '09-designer-dashboard.png', hash: '#/designer' },
	{ file: '10-designer-editor.png', hash: '#/designer/editor' },
	{ file: '11-designer-theme.png', hash: '#/designer/theme' },
	{ file: '12-designer-tokens.png', hash: '#/designer/tokens' },
	{ file: '13-designer-export.png', hash: '#/designer/export' },
	{ file: '14-designer-agent-mcp.png', hash: '#/designer/settings/agent' },
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
	const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

	for (const { file, hash } of SCREENS) {
		await page.goto(`${base}${hash}`, { waitUntil: 'networkidle' });
		await page.waitForTimeout(400);
		await page.screenshot({ path: path.join(outDir, file), fullPage: true });
		console.log('wrote', file);
	}

	await browser.close();
	preview.kill('SIGTERM');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
