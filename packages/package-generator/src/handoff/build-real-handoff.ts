import { loadCatalog, getDesignTokens, scaffoldScreen } from '@bareframe/design-handoff';
import type { PipelineArtifacts, ScreenPlan } from '../types.js';

export function buildRealHandoff(
  artifacts: PipelineArtifacts,
  themeId: string,
  libraryVersion: string,
): Record<string, unknown> {
  const catalog = loadCatalog();
  const tokens = getDesignTokens(catalog, themeId, true);
  const componentSlugs = [...new Set(artifacts.screens.flatMap((s) => s.components))];
  const components = componentSlugs.map((slug) => {
    const rec = catalog.components.find((c) => c.slug === slug);
    return {
      slug,
      stability: rec?.stability ?? 'stable',
      used_on: artifacts.screens.filter((s) => s.components.includes(slug)).map((s) => s.id),
    };
  });

  const scaffolded_screens = artifacts.screens.map((screen: ScreenPlan) => {
    const result = scaffoldScreen(catalog, {
      intent: screen.intent,
      components: screen.components,
      themeId,
      title: screen.name,
    });
    return {
      screen_id: screen.id,
      path: `src/screens/${screen.id}.tsx`,
      tsx: result.source,
    };
  });

  const llmHandoff = artifacts.handoff as Record<string, unknown>;
  return {
    components,
    design_tokens: tokens ?? { themeId },
    scaffolded_screens,
    data_entities: llmHandoff.data_entities ?? [],
    api_contracts: llmHandoff.api_contracts ?? [],
    stack: {
      frontend: 'React + @bareframe/react',
      backend: llmHandoff.stack && typeof llmHandoff.stack === 'object' && 'backend' in llmHandoff.stack
        ? (llmHandoff.stack as { backend: string }).backend
        : 'FastAPI',
      hosting: 'kuboh.dev',
      email: 'RelayEmail',
      analytics: 'Telemetry',
      database: 'PostgreSQL',
    },
    library_version: libraryVersion,
  };
}
