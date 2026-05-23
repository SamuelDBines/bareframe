#!/usr/bin/env node
/**
 * Quick filesystem checks after `pnpm build` — run before pushing Pages-facing changes.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const checks = ['dist/index.js', 'dist/manifest.json', 'dist/tokens.json', 'public/dist/manifest.json', 'public/dist/tokens.json', 'public/themes/system.css'];

async function main() {
	for (const rel of checks) {
		const p = path.join(root, rel);
		try {
			await fs.access(p);
		} catch {
			console.error(`smoke:pages fail — missing ${rel} (did you run pnpm build?)`);
			process.exit(1);
		}
	}

	const demo = path.join(root, 'public/button/index.html');
	const html = await fs.readFile(demo, 'utf8');
	const badAbs =
		html.includes('href="/themes/') ||
		html.includes('src="/dist/') ||
		html.includes("href='/themes/") ||
		html.includes("src='/dist/");
	if (badAbs) {
		console.error(
			'smoke:pages fail — public/button/index.html still uses root-absolute /themes or /dist; run prep-pages.',
		);
		process.exit(1);
	}
	if (!html.includes('../dist/') || !html.includes('../themes/')) {
		console.error(
			'smoke:pages fail — expected ../dist/ and ../themes/ prefixes in nested demo HTML after prep-pages.',
		);
		process.exit(1);
	}

	console.log('smoke:pages OK');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
