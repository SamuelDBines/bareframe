/**
 * Sync npm artifact (./dist + ./themes) into ./public for GitHub Pages and local preview.
 * Rewrites demo HTML absolute paths (/dist/, /themes/) to depth-aware relative URLs so
 * the site works at https://<user>.github.io/<repo>/ (project Pages).
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const distDir = path.join(root, 'dist');
const themesSource = path.join(root, 'themes');

async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

/** e.g. depth 0 → `./`, depth 1 → `../`, depth 2 → `../../` */
function assetPrefixForPublicHtmlDir(dirInsidePublic) {
	const rel = path.relative(publicDir, dirInsidePublic);
	const segments = rel && rel !== '.' ? rel.split(path.sep).filter(Boolean) : [];
	const depth = segments.length;
	return depth <= 0 ? './' : `${'../'.repeat(depth)}`;
}

/**
 * Rewrite root-absolute Bareframe asset URLs so they resolve under GitHub Pages project sites
 * (`https://<user>.github.io/<repo>/...`).
 */
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

	return out;
}

async function cpDir(src, dest) {
	await fs.mkdir(dest, { recursive: true });
	await fs.cp(src, dest, { recursive: true, force: true });
}

async function walkHtmlFiles(dir, out = []) {
	const entries = await fs.readdir(dir, { withFileTypes: true });
	for (const e of entries) {
		const full = path.join(dir, e.name);
		if (e.isDirectory()) {
			if (e.name === 'showcase') {
				// Vite manages asset paths in this tree
				continue;
			}
			await walkHtmlFiles(full, out);
		} else if (e.isFile() && e.name.endsWith('.html')) {
			out.push(full);
		}
	}
	return out;
}

async function main() {
	if (!(await exists(distDir))) {
		throw new Error('Missing ./dist — run `pnpm run build` (library build) first.');
	}
	if (!(await exists(themesSource))) {
		throw new Error('Missing ./themes directory.');
	}

	const publicDist = path.join(publicDir, 'dist');
	const publicThemes = path.join(publicDir, 'themes');

	await fs.mkdir(publicDir, { recursive: true });
	await cpDir(distDir, publicDist);
	await cpDir(themesSource, publicThemes);

	const htmlFiles = await walkHtmlFiles(publicDir);
	for (const file of htmlFiles) {
		const dir = path.dirname(file);
		const prefix = assetPrefixForPublicHtmlDir(dir);
		let content = await fs.readFile(file, 'utf8');
		const next = rewriteHtmlAssets(content, prefix);
		if (next !== content) {
			await fs.writeFile(file, next, 'utf8');
		}
	}

	console.log(
		`prep-pages: synced dist + themes into public/, checked ${htmlFiles.length} HTML files for subpath-safe assets.`,
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
