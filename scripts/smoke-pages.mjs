#!/usr/bin/env node
/**
 * Quick filesystem checks after a full GitHub Pages assembly — run via `pnpm run build:pages`
 * or before pushing Pages-facing changes.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const checks = [
	'dist/index.js',
	'dist/manifest.json',
	'dist/tokens.json',
	'dist/showcase-studio.json',
	'public/dist/manifest.json',
	'public/dist/tokens.json',
	'public/dist/showcase-studio.json',
	'public/themes/system.css',
	'public/showcase/index.html',
];

async function main() {
	for (const rel of checks) {
		const p = path.join(root, rel);
		try {
			await fs.access(p);
		} catch {
			console.error(`smoke:pages fail — missing ${rel} (run pnpm run build:pages from repo root)`);
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

	const showcaseHtml = await fs.readFile(path.join(root, 'public/showcase/index.html'), 'utf8');
	if (showcaseHtml.includes('src="/') || showcaseHtml.includes('href="/')) {
		console.error(
			'smoke:pages fail — public/showcase/index.html uses root-absolute asset URLs; rebuild showcase with base: "./" in showcase/vite.config.ts.',
		);
		process.exit(1);
	}
	const jsMatch = showcaseHtml.match(/src="\.\/assets\/([^"]+\.js)"/);
	const cssMatch = showcaseHtml.match(/href="\.\/assets\/([^"]+\.css)"/);
	if (!jsMatch || !cssMatch) {
		console.error('smoke:pages fail — public/showcase/index.html missing relative ./assets/ bundle references.');
		process.exit(1);
	}
	for (const file of [jsMatch[1], cssMatch[1]]) {
		try {
			await fs.access(path.join(root, 'public/showcase/assets', file));
		} catch {
			console.error(`smoke:pages fail — showcase bundle missing public/showcase/assets/${file}`);
			process.exit(1);
		}
	}

	const studioMeta = JSON.parse(
		await fs.readFile(path.join(root, 'public/dist/showcase-studio.json'), 'utf8'),
	);
	if (!studioMeta.categories || typeof studioMeta.categories !== 'object') {
		console.error('smoke:pages fail — public/dist/showcase-studio.json missing categories map.');
		process.exit(1);
	}
	if (!studioMeta.parts || typeof studioMeta.parts !== 'object') {
		console.error('smoke:pages fail — public/dist/showcase-studio.json missing parts map.');
		process.exit(1);
	}

	console.log('smoke:pages OK');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
