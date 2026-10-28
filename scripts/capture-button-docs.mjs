#!/usr/bin/env node
import { execSync, spawn } from 'node:child_process';
import { createConnection } from 'node:net';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outName = process.argv[2] || 'button-docs-current.png';
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const outDir = '/opt/cursor/artifacts/screenshots';
const port = 4600 + Math.floor(Math.random() * 200);

mkdirSync(outDir, { recursive: true });

function waitForPort(p) {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		const tryOnce = () => {
			const s = createConnection({ port: p, host: '127.0.0.1' }, () => {
				s.end();
				resolve();
			});
			s.on('error', () => {
				if (Date.now() - start > 60_000) reject(new Error('timeout waiting for sirv'));
				else setTimeout(tryOnce, 200);
			});
		};
		tryOnce();
	});
}

execSync('pnpm run build:react', { cwd: repoRoot, stdio: 'inherit' });
execSync('pnpm --prefix prototype install && pnpm --prefix prototype run build', {
	cwd: repoRoot,
	stdio: 'inherit',
	env: { ...process.env, BAREFRAME_PAGES_ROOT: '1' },
});
execSync('node ./scripts/finalize-pages.mjs', { cwd: repoRoot, stdio: 'inherit' });

const preview = spawn(
	'pnpm',
	['exec', 'sirv', 'public', '--host', '127.0.0.1', '--port', String(port), '--cors', '--dev', '--quiet'],
	{ cwd: repoRoot, stdio: 'ignore' },
);

try {
	await waitForPort(port);
	const { chromium } = require(require.resolve('playwright', { paths: [repoRoot] }));
	const browser = await chromium.launch({ headless: true });
	const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
	await page.goto(`http://127.0.0.1:${port}/#/components/button`, { waitUntil: 'networkidle' });
	await page.getByRole('heading', { name: 'Button', exact: true }).first().waitFor({ timeout: 15_000 });
	await page.locator('.playground-frame__canvas').first().screenshot({
		path: join(outDir, outName),
	});
	await browser.close();
	console.log(`Wrote ${join(outDir, outName)}`);
} finally {
	preview.kill('SIGTERM');
}
