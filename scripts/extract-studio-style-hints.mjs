#!/usr/bin/env node
/**
 * Lists `part="…"` exports per component TSX — used by the library build's showcase-studio artifact.
 */
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

async function exists(p) {
	try {
		await fs.access(p);
		return true;
	} catch {
		return false;
	}
}

export async function extractComponentParts(slugs, stencilComponentsDir = path.join(root, 'stencil', 'src', 'components')) {
	const out = {};
	for (const slug of slugs) {
		const tag = `bf-${slug}`;
		const tsx = path.join(stencilComponentsDir, tag, `${tag}.tsx`);
		if (!(await exists(tsx))) {
			out[slug] = [];
			continue;
		}
		const text = await fs.readFile(tsx, 'utf8');
		const parts = new Set();
		for (const m of text.matchAll(/part=["']([a-zA-Z][\w-]*)["']/g)) {
			parts.add(m[1]);
		}
		out[slug] = [...parts].sort();
	}
	return out;
}
