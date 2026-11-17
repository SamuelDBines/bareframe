import {
	copyFileSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
	existsSync,
	rmSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, '..', 'dist');

mkdirSync(dist, { recursive: true });

const nestedPopup = join(dist, 'src', 'popup', 'popup.html');
const flatPopup = join(dist, 'popup.html');
if (existsSync(nestedPopup)) {
	let html = readFileSync(nestedPopup, 'utf8');
	html = html
		.replaceAll('../popup.js', './popup.js')
		.replaceAll('../assets/popup.css', './popup.css')
		.replace(/src="\/popup\.js"/g, 'src="./popup.js"')
		.replace(/href="\/assets\/popup\.css"/g, 'href="./popup.css"');
	writeFileSync(flatPopup, html);
	const assetCss = join(dist, 'assets', 'popup.css');
	if (existsSync(assetCss)) {
		copyFileSync(assetCss, join(dist, 'popup.css'));
	}
}

const manifest = JSON.parse(readFileSync(join(root, '..', 'src', 'manifest.json'), 'utf8'));
manifest.action.default_popup = 'popup.html';
writeFileSync(join(dist, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

const distSrc = join(dist, 'src');
if (existsSync(distSrc)) {
	rmSync(distSrc, { recursive: true, force: true });
}

const iconsDir = join(root, '..', 'public', 'icons');
for (const name of readdirSync(iconsDir)) {
	if (name.endsWith('.png')) {
		copyFileSync(join(iconsDir, name), join(dist, name));
	}
}