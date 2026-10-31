import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Catalog, ComponentRecord, ThemeRecord } from './types.js';

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

export function usageSnippet(component: ComponentRecord): string {
	if (component.reactExport) {
		return `import { ${component.reactExport} } from '@bareframe/react';

export function Example() {
  return <${component.reactExport}>Hello</${component.reactExport}>;
}`;
	}
	const tag = `bf-${component.slug}`;
	return `<${tag}>Hello</${tag}>`;
}
