#!/usr/bin/env node
/**
 * Serves the built Vite app and asserts Bareframe theme tokens apply to components.
 */
import { spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);

const appDir = process.argv[2];
const repoRoot = process.argv[3];
if (!appDir || !repoRoot) {
	console.error('usage: consumer-theme-assert.mjs <appDir> <repoRoot>');
	process.exit(1);
}

const port = 4500 + Math.floor(Math.random() * 500);

function waitForPort(p, timeoutMs = 30_000) {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		const tryOnce = () => {
			const socket = createConnection({ port: p, host: '127.0.0.1' }, () => {
				socket.end();
				resolve();
			});
			socket.on('error', () => {
				if (Date.now() - start > timeoutMs) {
					reject(new Error(`Timed out waiting for preview on port ${p}`));
					return;
				}
				setTimeout(tryOnce, 200);
			});
		};
		tryOnce();
	});
}

const preview = spawn(
	'npm',
	['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port), '--strictPort'],
	{ cwd: appDir, stdio: 'ignore', env: process.env },
);

let previewExited = false;
preview.on('exit', (code) => {
	previewExited = true;
	if (code !== 0 && code !== null) {
		console.error(`consumer-theme-assert: vite preview exited with ${code}`);
	}
});

try {
	await waitForPort(port);

	const playwrightEntry = require.resolve('playwright', { paths: [repoRoot] });
	const { chromium } = require(playwrightEntry);
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });

	const themeToken = await page.evaluate(() =>
		getComputedStyle(document.documentElement).getPropertyValue('--bf-theme-button-primary-bg').trim(),
	);
	if (themeToken !== '#2563eb') {
		throw new Error(
			`Expected light theme --bf-theme-button-primary-bg #2563eb, got "${themeToken}"`,
		);
	}

	const rkAlias = await page.evaluate(() =>
		getComputedStyle(document.documentElement).getPropertyValue('--rk-theme-button-primary-bg').trim(),
	);
	if (rkAlias !== '#2563eb') {
		throw new Error(
			`Expected --rk-theme-button-primary-bg to alias theme token, got "${rkAlias}"`,
		);
	}

	const buttonBg = await page.locator('[data-testid="smoke-primary-btn"]').evaluate((el) => {
		const bg = getComputedStyle(el).backgroundColor;
		return bg;
	});
	if (buttonBg !== 'rgb(37, 99, 235)') {
		throw new Error(`Expected primary button background rgb(37, 99, 235), got "${buttonBg}"`);
	}

	await browser.close();
	console.log('consumer-theme-assert: theme variables and primary button styles OK');
} finally {
	if (!previewExited) {
		preview.kill('SIGTERM');
	}
}
