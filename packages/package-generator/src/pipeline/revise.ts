import type { GeneratorStage, LlmAdapter, PipelineArtifacts, PipelineContext } from '../types.js';

export type DeliverableKey =
  | 'product'
  | 'naming'
  | 'branding'
  | 'design'
  | 'ia'
  | 'journeys'
  | 'prototype'
  | 'copy'
  | 'handoff';

const DELIVERABLE_STAGE: Record<DeliverableKey, GeneratorStage> = {
  product: 'definition',
  naming: 'naming_branding',
  branding: 'naming_branding',
  design: 'design_directions',
  ia: 'ia',
  journeys: 'journeys',
  prototype: 'screens_copy',
  copy: 'screens_copy',
  handoff: 'handoff',
};

export function deliverableKeyFromLabel(label: string): DeliverableKey | null {
  const map: Record<string, DeliverableKey> = {
    Product: 'product',
    Naming: 'naming',
    Branding: 'branding',
    'Design directions': 'design',
    IA: 'ia',
    Journeys: 'journeys',
    Prototype: 'prototype',
    Copy: 'copy',
    Handoff: 'handoff',
  };
  return map[label] ?? null;
}

export async function regenerateDeliverable(
  llm: LlmAdapter,
  ctx: { intake: PipelineContext['intake']; projectName: string },
  deliverable: DeliverableKey,
  feedback: string,
  current: PipelineArtifacts,
): Promise<PipelineArtifacts> {
  const stage = DELIVERABLE_STAGE[deliverable];
  const prior = { ...current };
  const feedbackBlock = `\n\nCustomer revision feedback (address directly):\n${feedback}\n`;

  const runOne = async (): Promise<Partial<PipelineArtifacts>> => {
    const baseUser =
      JSON.stringify({ intake: ctx.intake, projectName: ctx.projectName, prior: current }, null, 2) +
      feedbackBlock;

    switch (stage) {
      case 'definition': {
        const out = await llm.completeJson<{ product: Record<string, unknown> }>({
          stage,
          system: 'Revise the product definition based on customer feedback. Output JSON with a product object.',
          user: baseUser,
          schemaHint: '{ "product": { ... } }',
        });
        return { product: out.product };
      }
      case 'naming_branding': {
        const out = await llm.completeJson<{ naming: Record<string, unknown>; branding: Record<string, unknown> }>({
          stage,
          system: 'Revise naming and/or branding based on customer feedback.',
          user: baseUser,
          schemaHint: '{ "naming": {...}, "branding": {...} }',
        });
        if (deliverable === 'naming') return { naming: out.naming };
        if (deliverable === 'branding') return { branding: out.branding };
        return { naming: out.naming, branding: out.branding };
      }
      case 'design_directions': {
        const out = await llm.completeJson<{ design_options: Record<string, unknown>[] }>({
          stage,
          system: 'Revise design directions based on customer feedback.',
          user: baseUser,
          schemaHint: '{ "design_options": [...] }',
        });
        return { design_options: out.design_options };
      }
      case 'ia': {
        const out = await llm.completeJson<{ ia: Record<string, unknown> }>({
          stage,
          system: 'Revise information architecture based on customer feedback.',
          user: baseUser,
          schemaHint: '{ "ia": {...} }',
        });
        return { ia: out.ia };
      }
      case 'journeys': {
        const out = await llm.completeJson<{ journeys: PipelineArtifacts['journeys'] }>({
          stage,
          system: 'Revise user journeys based on customer feedback.',
          user: baseUser,
          schemaHint: '{ "journeys": [...] }',
        });
        return { journeys: out.journeys };
      }
      case 'screens_copy': {
        const out = await llm.completeJson<{
          screens: PipelineArtifacts['screens'];
          copy: Record<string, unknown>[];
        }>({
          stage,
          system: 'Revise prototype screens and/or copy based on customer feedback.',
          user: baseUser,
          schemaHint: '{ "screens": [...], "copy": [...] }',
        });
        if (deliverable === 'copy') return { copy: out.copy };
        if (deliverable === 'prototype') return { screens: out.screens, copy: out.copy };
        return { screens: out.screens, copy: out.copy };
      }
      case 'handoff': {
        const out = await llm.completeJson<{ handoff: Record<string, unknown> }>({
          stage,
          system: 'Revise technical handoff metadata based on customer feedback.',
          user: baseUser,
          schemaHint: '{ "handoff": {...} }',
        });
        return { handoff: out.handoff };
      }
      default:
        return {};
    }
  };

  const patch = await runOne();
  const merged = { ...prior, ...patch } as PipelineArtifacts;
  return merged;
}
