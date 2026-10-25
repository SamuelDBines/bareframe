#!/usr/bin/env node
/**
 * Promote the React prototype to the site root and move Stencil demos + Studio under /legacy/.
 * Writes CNAME for bareframe.org custom domain.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(root, 'public');
const legacyDir = path.join(publicDir, 'legacy');
const prototypeDir = path.join(publicDir, 'prototype');

const SKIP_MOVE = new Set(['legacy', 'prototype', 'CNAME', '.nojekyll']);

/** Depth from the HTML file to `public/legacy/` (dist + themes live alongside demos there). */
function assetPrefixForLegacyHtmlDir(dirInsideLegacy) {
	const rel = path.relative(legacyDir, dirInsideLegacy);
	const segments = rel && rel !== '.' ? rel.split(path.sep).filter(Boolean) : [];
	const depth = segments.length;
	return depth <= 0 ? './' : `${'../'.repeat(depth)}`;
}

function rewriteHtmlAssets(html, assetPrefix) {
	const p = assetPrefix;
	let out = html;
	out = out.replace(/href=(["'])\/themes\//g, `href=$1${p}themes/`);
	out = out.replace(/src=(["'])\/dist\//g, `src=$1${p}dist/`);
	out = out.replace(/href=(["'])\/dist\//g, `href=$1${p}dist/`);
	out = out.replace(/'\/themes\/'\s*\+/g, `'${p}themes/' +`);
	out = out.replace(/"\/themes\/"\s*\+/g, `"${p}themes/" +`);
	if (p !== './') {
		out = out.replace(/href=(["'])\.\/themes\//g, `href=$1${p}themes/`);
		out = out.replace(/src=(["'])\.\/dist\//g, `src=$1${p}dist/`);
	}
	out = out.replace(/(href|src)=(["'])(?:\.\.\/)+themes\//g, `$1=$2${p}themes/`);
	out = out.replace(/(href|src)=(["'])(?:\.\.\/)+dist\//g, `$1=$2${p}dist/`);
	out = out.replace(/(['"])(?:\.\.\/)+themes\/'\s*\+/g, `$1${p}themes/' +`);
	out = out.replace(/(['"])(?:\.\.\/)+themes\/"\s*\+/g, `$1${p}themes/" +`);
	return out;
}

async function walkHtmlFiles(dir, out = []) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (e.name === 'showcase') continue;
			await walkHtmlFiles(full, out);
		} else if (e.isFile() && e.name.endsWith('.html')) {
			out.push(full);
		}
	}
	return out;
}

async function rewriteLegacyHtml() {
	const htmlFiles = await walkHtmlFiles(legacyDir);
	for (const file of htmlFiles) {
		const dir = path.dirname(file);
		const prefix = assetPrefixForLegacyHtmlDir(dir);
		let content = await fs.readFile(file, 'utf8');
		const next = rewriteHtmlAssets(content, prefix);
		if (next !== content) await fs.writeFile(file, next, 'utf8');
	}
	return htmlFiles.length;
}

async function cpDirContents(src, dest) {
	await fs.mkdir(dest, { recursive: true });
	const entries = await fs.readdir(src, { withFileTypes: true });
	for (const e of entries) {
		const from = path.join(src, e.name);
		const to = path.join(dest, e.name);
		if (e.isDirectory()) {
			await fs.cp(from, to, { recursive: true, force: true });
		} else {
			await fs.copyFile(from, to);
		}
	}
}

async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

async function moveIntoLegacy(name) {
	const from = path.join(publicDir, name);
	const to = path.join(legacyDir, name);
	if (await exists(to)) await fs.rm(to, { recursive: true, force: true });
	await fs.rename(from, to);
}

async function main() {
	const rootIndex = path.join(publicDir, 'index.html');
	let rootHtml = '';
	if (await exists(rootIndex)) {
		rootHtml = await fs.readFile(rootIndex, 'utf8');
	}
	const alreadyFinalized =
		!(await exists(prototypeDir)) &&
		(await exists(legacyDir)) &&
		rootHtml.includes('id="root"');

	if (alreadyFinalized) {
		await fs.writeFile(path.join(publicDir, 'CNAME'), 'bareframe.org\n', 'utf8');
		await fs.writeFile(path.join(publicDir, '.nojekyll'), '', 'utf8');
		console.log('finalize-pages: already finalized (prototype at root, legacy preserved).');
		return;
	}

	if (!(await exists(prototypeDir))) {
		throw new Error('Missing public/prototype — run prototype build first.');
	}

	await fs.mkdir(legacyDir, { recursive: true });
	const top = await fs.readdir(publicDir, { withFileTypes: true });
	for (const e of top) {
		if (!e.isDirectory() && !e.isFile()) continue;
		if (SKIP_MOVE.has(e.name)) continue;
		await moveIntoLegacy(e.name);
	}

	const rewritten = await rewriteLegacyHtml();

	await cpDirContents(prototypeDir, publicDir);
	await fs.rm(prototypeDir, { recursive: true, force: true });

	await fs.writeFile(path.join(publicDir, 'CNAME'), 'bareframe.org\n', 'utf8');
	await fs.writeFile(path.join(publicDir, '.nojekyll'), '', 'utf8');

	console.log(
		`finalize-pages: legacy at public/legacy/ (${rewritten} HTML files re-prefixed), prototype at public/ root, CNAME=bareframe.org`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
