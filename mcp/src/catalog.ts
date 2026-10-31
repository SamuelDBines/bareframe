import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Catalog, ComponentRecord, DocPage, ThemeRecord } from './types.js';

const here = path.dirname(fileURLToPath(import.meta.url));

let cached: Catalog | null = null;

export function loadCatalog(): Catalog {
	if (cached) return cached;
	const catalogPath = path.join(here, '..', 'data', 'catalog.json');
	const raw = readFileSync(catalogPath, 'utf8');
	cached = JSON.parse(raw) as Catalog;
	return cached;
}

export function listComponents(catalog: Catalog): ComponentRecord[] {
	return catalog.components;
}

export function getComponent(catalog: Catalog, slug: string): ComponentRecord | undefined {
	return catalog.components.find((c) => c.slug === slug);
}

export function listThemes(catalog: Catalog): ThemeRecord[] {
	return catalog.themes;
}

export function getTheme(catalog: Catalog, id: string): ThemeRecord | undefined {
	return catalog.themes.find((t) => t.id === id);
}

export function searchDocs(catalog: Catalog, query: string, limit = 10): DocPage[] {
	const q = query.trim().toLowerCase();
	if (!q) return [];
	const scored = catalog.docPages
		.map((page) => {
			const haystack = `${page.title}\n${page.body}`.toLowerCase();
			if (!haystack.includes(q)) return null;
			const titleHit = page.title.toLowerCase().includes(q) ? 3 : 0;
			const count = haystack.split(q).length - 1;
			return { page, score: titleHit + count };
		})
		.filter((x): x is { page: DocPage; score: number } => x !== null)
		.sort((a, b) => b.score - a.score)
		.slice(0, limit);
	return scored.map((s) => s.page);
}

export function usageSnippet(component: ComponentRecord): string {
	if (component.examples.length > 0) {
		return component.examples[0].source;
	}
	if (component.reactExport) {
		return `import { ${component.reactExport} } from '@bareframe/react';

export function Example() {
  return <${component.reactExport}>Hello</${component.reactExport}>;
}`;
	}
	const tag = `bf-${component.slug}`;
	return `<${tag}>Hello</${tag}>`;
}
