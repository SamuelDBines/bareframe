import type { ComponentRecord, DocPage } from '@bareframe/design-handoff';
import {
  getDesignTokens as getDesignTokensFromCatalog,
  getTheme,
  listComponents,
  loadCatalog as loadCatalogFromHandoff,
  searchDocs as searchDocsFromHandoff,
} from '@bareframe/design-handoff';

export type { Catalog, ComponentRecord, DocPage, ThemeRecord } from '@bareframe/design-handoff';

export function loadCatalog() {
  return loadCatalogFromHandoff();
}

export { listComponents, getTheme };

export function getComponent(catalog: ReturnType<typeof loadCatalog>, slug: string) {
  return catalog.components.find((c) => c.slug === slug);
}

export function listThemes(catalog: ReturnType<typeof loadCatalog>) {
  return catalog.themes;
}

export function getDesignTokens(
  catalog: ReturnType<typeof loadCatalog>,
  themeId: string | undefined,
  includeCssVariables: boolean,
) {
  return getDesignTokensFromCatalog(catalog, themeId, includeCssVariables);
}

export function searchDocs(catalog: ReturnType<typeof loadCatalog>, query: string, limit = 10): DocPage[] {
  return searchDocsFromHandoff(catalog, query, limit);
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
