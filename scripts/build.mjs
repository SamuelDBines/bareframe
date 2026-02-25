import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const themesDir = path.join(root, 'themes');
const distDir = path.join(root, 'dist');
const distComponentsDir = path.join(distDir, 'components');
const distThemesDir = path.join(distDir, 'themes');

function parseArgs(argv) {
	const args = { devOutfile: path.join(distDir, 'index.js') };
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		if (arg === '--dev-outfile') {
			const next = argv[i + 1];
			if (!next) {
				throw new Error('Missing value for --dev-outfile');
			}
			args.devOutfile = path.resolve(root, next);
			i += 1;
		}
	}
	return args;
}

async function exists(filePath) {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}

async function getComponentSlugs() {
	const entries = await fs.readdir(srcDir, { withFileTypes: true });
	const slugs = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}
		if (entry.name.startsWith('_')) {
			continue;
		}

		const slug = entry.name;
		const jsPath = path.join(srcDir, slug, `${slug}.js`);
		const cssPath = path.join(srcDir, slug, `${slug}.css`);

		if ((await exists(jsPath)) && (await exists(cssPath))) {
			slugs.push(slug);
		}
	}

	return slugs.sort();
}

async function cleanAndPrepareDist() {
	await fs.rm(distDir, { recursive: true, force: true });
	await fs.mkdir(distComponentsDir, { recursive: true });
	await fs.mkdir(distThemesDir, { recursive: true });
}

async function copyComponents(slugs) {
	for (const slug of slugs) {
		const srcJs = path.join(srcDir, slug, `${slug}.js`);
		const srcCss = path.join(srcDir, slug, `${slug}.css`);
		const outJs = path.join(distComponentsDir, `${slug}.js`);
		const outCss = path.join(distComponentsDir, `${slug}.css`);

		await fs.copyFile(srcJs, outJs);
		await fs.copyFile(srcCss, outCss);
	}
}

async function copyThemes() {
	const entries = await fs.readdir(themesDir, { withFileTypes: true });
	for (const entry of entries) {
		if (!entry.isFile() || !entry.name.endsWith('.css')) {
			continue;
		}
		await fs.copyFile(
			path.join(themesDir, entry.name),
			path.join(distThemesDir, entry.name),
		);
	}
}

async function writeManifest(slugs) {
	const manifest = {
		generatedAt: new Date().toISOString(),
		componentCount: slugs.length,
		components: slugs,
	};
	await fs.writeFile(
		path.join(distDir, 'manifest.json'),
		`${JSON.stringify(manifest, null, 2)}\n`,
	);
}

function toCssDataUrl(css) {
	return `data:text/css;charset=utf-8,${encodeURIComponent(css)}`;
}

async function inlineCssUrlsInBundle(outfile, slugs) {
	let bundleCode = await fs.readFile(outfile, 'utf8');
	for (const slug of slugs) {
		const css = await fs.readFile(
			path.join(srcDir, slug, `${slug}.css`),
			'utf8',
		);
		const cssDataUrl = toCssDataUrl(css);
		bundleCode = bundleCode.replaceAll(`'./${slug}.css'`, `'${cssDataUrl}'`);
		bundleCode = bundleCode.replaceAll(`"./${slug}.css"`, `"${cssDataUrl}"`);
	}
	await fs.writeFile(outfile, bundleCode);
}

async function writeDevBundle(slugs, outfile) {
	await fs.mkdir(path.dirname(outfile), { recursive: true });
	await build({
		entryPoints: [path.join(srcDir, 'index.js')],
		bundle: true,
		format: 'esm',
		target: ['es2020'],
		outfile,
	});

	await inlineCssUrlsInBundle(outfile, slugs);
}

async function writeMinifiedBundle(slugs) {
	const outfile = path.join(distDir, 'bareframe.min.js');
	await build({
		entryPoints: [path.join(srcDir, 'index.js')],
		bundle: true,
		format: 'esm',
		target: ['es2020'],
		minify: true,
		outfile,
	});

	await inlineCssUrlsInBundle(outfile, slugs);
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const slugs = await getComponentSlugs();
	await cleanAndPrepareDist();
	await copyComponents(slugs);
	await copyThemes();
	await writeDevBundle(slugs, args.devOutfile);
	await writeManifest(slugs);
	await writeMinifiedBundle(slugs);
	console.log(`Built bareframe package with ${slugs.length} components.`);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
