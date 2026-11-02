import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

let slugSet: Set<string> | null = null;

const FALLBACK_SLUGS = [
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
];

function loadSlugSet(): Set<string> {
	if (slugSet) return slugSet;
	const here = dirname(fileURLToPath(import.meta.url));
	const candidates = [
		join(here, '../../../dist/manifest.json'),
		join(here, '../../../../dist/manifest.json'),
	];
	const merged = new Set(FALLBACK_SLUGS);
	for (const path of candidates) {
		if (!existsSync(path)) continue;
		const manifest = JSON.parse(readFileSync(path, 'utf8')) as {
			components?: { slug?: string }[];
		};
		for (const slug of manifest.components?.map((c) => c.slug?.trim()).filter(Boolean) ?? []) {
			merged.add(slug!);
		}
		break;
	}
	slugSet = merged;
	return slugSet;
}

export function isValidComponentSlug(slug: string): boolean {
	return loadSlugSet().has(slug);
}

export function resetComponentSlugCacheForTests() {
	slugSet = null;
}
