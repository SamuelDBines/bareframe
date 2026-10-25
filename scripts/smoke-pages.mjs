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
	'public/index.html',
	'public/CNAME',
	'public/legacy/dist/manifest.json',
	'public/legacy/dist/tokens.json',
	'public/legacy/dist/showcase-studio.json',
	'public/legacy/themes/system.css',
	'public/legacy/showcase/index.html',
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

	const cname = await fs.readFile(path.join(root, 'public/CNAME'), 'utf8');
	if (!cname.trim().includes('bareframe.org')) {
		console.error('smoke:pages fail — public/CNAME must contain bareframe.org');
		process.exit(1);
	}

	const rootHtml = await fs.readFile(path.join(root, 'public/index.html'), 'utf8');
	if (!rootHtml.includes('id="root"')) {
		console.error('smoke:pages fail — public/index.html is not the React prototype entry.');
		process.exit(1);
	}
	if (rootHtml.includes('src="/') && !rootHtml.includes('src="/assets/')) {
		console.error('smoke:pages fail — unexpected root-absolute URLs in prototype index.html');
		process.exit(1);
	}

	const demo = path.join(root, 'public/legacy/button/index.html');
	const html = await fs.readFile(demo, 'utf8');
	const badAbs =
		html.includes('href="/themes/') ||
		html.includes('src="/dist/') ||
		html.includes("href='/themes/") ||
		html.includes("src='/dist/");
	if (badAbs) {
		console.error(
			'smoke:pages fail — public/legacy/button/index.html still uses root-absolute /themes or /dist; run finalize-pages.',
		);
		process.exit(1);
	}
	if (!html.includes('../dist/') || !html.includes('../themes/')) {
		console.error(
			'smoke:pages fail — expected ../dist/ and ../themes/ in legacy/button/index.html after finalize-pages.',
		);
		process.exit(1);
	}

	const showcaseHtml = await fs.readFile(path.join(root, 'public/legacy/showcase/index.html'), 'utf8');
	if (showcaseHtml.includes('src="/') || showcaseHtml.includes('href="/')) {
		console.error(
			'smoke:pages fail — legacy/showcase/index.html uses root-absolute asset URLs; rebuild showcase with base: "./".',
		);
		process.exit(1);
	}
	const jsMatch = showcaseHtml.match(/src="\.\/assets\/([^"]+\.js)"/);
	const cssMatch = showcaseHtml.match(/href="\.\/assets\/([^"]+\.css)"/);
	if (!jsMatch || !cssMatch) {
		console.error('smoke:pages fail — legacy/showcase/index.html missing relative ./assets/ bundle references.');
		process.exit(1);
	}
	for (const file of [jsMatch[1], cssMatch[1]]) {
		try {
			await fs.access(path.join(root, 'public/legacy/showcase/assets', file));
		} catch {
			console.error(`smoke:pages fail — showcase bundle missing public/legacy/showcase/assets/${file}`);
			process.exit(1);
		}
	}

	const studioMeta = JSON.parse(
		await fs.readFile(path.join(root, 'public/legacy/dist/showcase-studio.json'), 'utf8'),
	);
	if (!studioMeta.categories || typeof studioMeta.categories !== 'object') {
		console.error('smoke:pages fail — legacy/dist/showcase-studio.json missing categories map.');
		process.exit(1);
	}
	if (!studioMeta.parts || typeof studioMeta.parts !== 'object') {
		console.error('smoke:pages fail — legacy/dist/showcase-studio.json missing parts map.');
		process.exit(1);
	}

	console.log('smoke:pages OK');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
