import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Catalog, ComponentRecord, DocPage, ThemeRecord } from './types.js';
import { buildDesignTokensResponse } from './design-tokens.js';

const here = path.dirname(fileURLToPath(import.meta.url));

let cached: Catalog | null = null;

function defaultCatalogPath(): string {
  if (process.env.BAREFRAME_CATALOG_PATH) return process.env.BAREFRAME_CATALOG_PATH;
  const candidates = [
    path.join(process.cwd(), 'data', 'catalog.json'),
    '/app/data/catalog.json',
    path.join(here, '..', 'data', 'catalog.json'),
    path.join(here, '..', '..', '..', 'mcp', 'data', 'catalog.json'),
  ];
  for (const c of candidates) {
    if (existsSync(c)) return c;
  }
  return candidates[0]!;
}

export function loadCatalog(catalogPath?: string): Catalog {
  if (cached && !catalogPath) return cached;
  const p = catalogPath ?? defaultCatalogPath();
  const raw = readFileSync(p, 'utf8');
  const catalog = JSON.parse(raw) as Catalog;
  if (!catalogPath) cached = catalog;
  return catalog;
}

export function resetCatalogCacheForTests() {
  cached = null;
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

export function getDesignTokens(
  catalog: Catalog,
  themeId: string | undefined,
  includeCssVariables: boolean,
) {
  const id = themeId ?? catalog.defaultThemeId ?? 'light';
  const theme = getTheme(catalog, id);
  if (!theme) return undefined;
  return buildDesignTokensResponse(theme, includeCssVariables, catalog.defaultThemeId ?? 'light');
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
