import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let slugSet: Set<string> | null = null;

function loadSlugSet(): Set<string> {
	if (slugSet) return slugSet;
	const here = dirname(fileURLToPath(import.meta.url));
	const candidates = [
		join(here, '../../../dist/manifest.json'),
		join(here, '../../../../dist/manifest.json'),
	];
	for (const path of candidates) {
		if (!existsSync(path)) continue;
		const manifest = JSON.parse(readFileSync(path, 'utf8')) as {
			components?: { slug: string }[];
		};
		const slugs = manifest.components?.map((c) => c.slug) ?? [];
		slugSet = new Set(slugs);
		return slugSet;
	}
	slugSet = new Set([
		'button',
		'card',
		'input',
		'badge',
		'alert',
		'field',
		'table',
		'avatar',
		'otp-input',
		'stat-card',
		'empty-state',
		'textarea',
		'switch',
		'checkbox',
	]);
	return slugSet;
}

export function isValidComponentSlug(slug: string): boolean {
	return loadSlugSet().has(slug);
}

export function resetComponentSlugCacheForTests() {
	slugSet = null;
}
