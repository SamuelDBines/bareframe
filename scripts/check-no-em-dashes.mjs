#!/usr/bin/env node
/**
 * CI guard: fail if em dash (U+2014) or en dash (U+2013) appears in authored content.
 * Does not scan built bundles under public asset folders.
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const EMDASH = '\u2014';
const ENDASH = '\u2013';
const BAD = new RegExp(`[${EMDASH}${ENDASH}]`);

const SCAN_ROOTS = [
	'docs',
	'src',
	'api/src',
	'mcp',
	'prototype/src',
	'prototype/DESIGNER_SPEC.md',
	'prototype/DESIGNER_SPEC_COVERAGE.md',
	'prototype/README.md',
	'showcase/src',
	'showcase/index.html',
	'showcase/meta',
	'scripts',
	'tests',
	'packages',
	'extension',
	'deploy',
	'examples',
	'RELEASING.md',
	'.github/workflows',
	'public/index.html',
	'public/bareframe-capture.js',
	'public/prototype/index.html',
	'public/prototype/bareframe-capture.js',
	'public/legacy/index.html',
	'public/legacy/bareframe-capture.js',
	'public/legacy/chart/index.html',
	'public/legacy/header/index.html',
	'public/legacy/message/index.html',
	'public/legacy/showcase/index.html',
];

const SKIP_DIR = new Set(['node_modules', 'dist', '.git', 'coverage', 'assets']);
const SKIP_FILES = new Set(['check-no-em-dashes.mjs', 'fix-em-dashes.py']);

async function* walk(rel) {
	const abs = path.join(ROOT, rel);
	let st;
	try {
		st = await stat(abs);
	} catch {
		return;
	}
	if (st.isFile()) {
		yield rel;
		return;
	}
	const entries = await readdir(abs, { withFileTypes: true });
	for (const ent of entries) {
		if (ent.isDirectory()) {
			if (SKIP_DIR.has(ent.name)) continue;
			yield* walk(path.join(rel, ent.name));
		} else if (ent.isFile()) {
			yield path.join(rel, ent.name);
		}
	}
}

const hits = [];
for (const root of SCAN_ROOTS) {
	for await (const rel of walk(root)) {
		if (SKIP_FILES.has(path.basename(rel))) continue;
		const text = await readFile(path.join(ROOT, rel), 'utf8');
		if (!BAD.test(text)) continue;
		const lines = text.split('\n');
		for (let i = 0; i < lines.length; i++) {
			if (BAD.test(lines[i])) hits.push(`${rel}:${i + 1}: ${lines[i].trim().slice(0, 120)}`);
		}
	}
}

if (hits.length) {
	console.error(`Found ${hits.length} line(s) with em/en dashes:\n${hits.join('\n')}`);
	process.exit(1);
}
console.log('No em or en dashes in scanned authored content.');