#!/usr/bin/env node
/**
 * Minimal theme contract check: ensure a CSS file defines key --bf-theme-* tokens.
 * Optional: compare coverage against dist/tokens.json (union) with --strict-percent 0-100.
 */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

/** Non-exhaustive primitives every theme should consciously set. */
const REQUIRED = [
	'--bf-theme-surface-1',
	'--bf-theme-surface-2',
	'--bf-theme-text-1',
	'--bf-theme-text-2',
	'--bf-theme-border-1',
	'--bf-theme-font-family',
	'--bf-theme-button-primary-bg',
	'--bf-theme-button-primary-color',
	'--bf-theme-button-secondary-bg',
	'--bf-theme-button-secondary-color',
];

function extractCustomProps(css) {
	const names = new Set();
	const re = /--[\w-]+/g;
	let m;
	while ((m = re.exec(css))) {
		const t = m[0];
		if (t.startsWith('--bf-')) names.add(t);
	}
	return names;
}

async function flattenImports(filePath, seen = new Set()) {
	const canon = path.resolve(filePath);
	if (seen.has(canon)) return '';
	seen.add(canon);
	let body = await readFile(canon, 'utf8');
	const dir = path.dirname(canon);
	const importRe =
		/@import\s+(?:url\(\s*(['"])([^'"]+)\1\s*\)|(['"])([^'"]+)\3)\s*;/g;
	let out = '';
	let lastIdx = 0;
	let mm = importRe.exec(body);
	while (mm !== null) {
		out += body.slice(lastIdx, mm.index);
		const rel = mm[2] || mm[4];
		if (rel && !rel.startsWith('http') && !rel.startsWith('//')) {
			const resolved = path.resolve(dir, rel);
			out += await flattenImports(resolved, seen);
		} else {
			out += mm[0];
		}
		lastIdx = importRe.lastIndex;
		mm = importRe.exec(body);
	}
	out += body.slice(lastIdx);
	return out;
}

async function main() {
	const argv = process.argv.slice(2).filter((a) => !a.startsWith('--'));
	const flags = new Set(process.argv.slice(2).filter((a) => a.startsWith('--')));

	const themePath = argv[0];
	if (!themePath) {
		console.error(
			'Usage: node scripts/validate-theme.mjs <path-to-theme.css> [--check-union]',
		);
		process.exit(1);
	}

	const abs = path.resolve(process.cwd(), themePath);
	const flattened = await flattenImports(abs);
	const defined = extractCustomProps(flattened);

	const missing = REQUIRED.filter((n) => !defined.has(n));
	if (missing.length) {
		console.error('validate-theme: FAILED — missing required tokens:');
		for (const n of missing) console.error(`  - ${n}`);
		process.exit(1);
	}

	if (flags.has('--check-union')) {
		const unionPath = path.join(root, 'dist', 'tokens.json');
		let union;
		try {
			union = JSON.parse(await readFile(unionPath, 'utf8'));
		} catch {
			console.warn('validate-theme: dist/tokens.json missing — run `pnpm run build:lib`');
			process.exit(0);
		}
		const all = Array.isArray(union.tokens) ? union.tokens : [];
		const absent = all.filter((t) => !defined.has(t));
		const pct = all.length ? Math.round((1 - absent.length / all.length) * 100) : 100;
		console.log(
			`validate-theme: union coverage ${pct}% (${all.length - absent.length}/${all.length} tokens present)`,
		);
		if (pct < 100) {
			console.log('Missing (sample up to 25):');
			for (const t of absent.slice(0, 25)) console.log(`  - ${t}`);
			if (absent.length > 25) console.log(`  … and ${absent.length - 25} more`);
			process.exitCode = 1;
		}
	}

	console.log(`validate-theme: OK — ${path.relative(root, abs)}`);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
