#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const publicDir = path.join(root, 'public');
const read = (rel) => fs.readFileSync(path.join(publicDir, rel), 'utf8');
const light = read('themes/light.css').replace(/@import\s+['"]\.\/layout\.css['"]\s*;?\s*/g, '');
const bundle = [
	read('themes/layout.css'),
	light,
	read('assets/frame-preview/bareframe-ui.css'),
	read('assets/frame-preview/button.css'),
	'html, body, .bf-node, button, input { font-family: ui-sans-serif, system-ui, sans-serif !important; -webkit-font-smoothing: auto; }',
].join('\n');
const outPath = path.join(root, 'tests/e2e/templatePreviewCss.bundle.css');
fs.writeFileSync(outPath, bundle);
console.log(`Wrote ${path.relative(root, outPath)} (${bundle.length} bytes)`);