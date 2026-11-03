import type { BareframePackage, IntakePayload } from '@bareframe/package-contracts';
import { buildDeliveryFlowContracts, buildReviewChecklist } from '../delivery-flow/build.js';
import { buildRealHandoff } from '../handoff/build-real-handoff.js';
import type { PipelineArtifacts } from '../types.js';

export type ReassembleInput = {
  intake: IntakePayload;
  projectName: string;
  designerProjectId: string;
  shareUrl: string;
  libraryVersion: string;
  artifacts: PipelineArtifacts;
  selectedDirection?: string | null;
  existingReview?: BareframePackage['review'];
  revision?: number;
  status?: string;
};

export function reassembleBareframePackage(input: ReassembleInput): BareframePackage {
  const themeId = resolveThemeId(input.artifacts, input.selectedDirection);
  const handoff = buildRealHandoff(input.artifacts, themeId, input.libraryVersion);
  const artifactsWithHandoff = { ...input.artifacts, handoff };

  const summary =
    (input.artifacts.product as { value_proposition?: string })?.value_proposition ??
    input.intake.idea.slice(0, 160);

  const delivery = buildDeliveryFlowContracts(input.projectName, summary, input.intake, artifactsWithHandoff);

  const review =
    input.existingReview ??
    ({
      checklist: buildReviewChecklist(),
      rounds_included: 2,
      rounds_used: 0,
      approved_by: null,
      approved_at: null,
    } as BareframePackage['review']);

  return {
    contract: 'bareframe.package',
    version: '1.0',
    project: input.projectName,
    summary,
    status: (input.status as BareframePackage['status']) ?? 'in_review',
    revision: input.revision ?? 0,
    intake: {
      idea: input.intake.idea,
      audience: input.intake.audience,
      constraints: input.intake.constraints,
      references: input.intake.references,
      answers: input.intake.answers,
      assumptions: input.intake.assumptions,
    },
    product: input.artifacts.product,
    naming: input.artifacts.naming,
    branding: input.artifacts.branding,
    design_options: input.artifacts.design_options,
    selected_direction: input.selectedDirection ?? input.artifacts.design_options[0]?.id ?? null,
    ia: input.artifacts.ia,
    journeys: input.artifacts.journeys.map((j) => ({
      ...j,
      flow_map_ref: `designer://${input.designerProjectId}/journey/${j.id}`,
    })),
    prototype: {
      designer_project_id: input.designerProjectId,
      share_url: input.shareUrl,
      library: '@bareframe/react',
      library_version: input.libraryVersion,
      screens: input.artifacts.screens.map((s) => ({
        id: s.id,
        name: s.name,
        route: s.route,
        components: s.components,
        story_ids: s.story_ids,
      })),
    },
    copy: input.artifacts.copy,
    handoff,
    review,
    delivery_flow: delivery,
  } as BareframePackage;
}

function resolveThemeId(artifacts: PipelineArtifacts, selectedDirection?: string | null): string {
  const options = artifacts.design_options as { id: string; bareframe_theme?: { base_theme?: string } }[];
  const pick = options.find((o) => o.id === selectedDirection) ?? options[0];
  return pick?.bareframe_theme?.base_theme ?? 'simple';
}

export function artifactsFromPackage(doc: Record<string, unknown>): PipelineArtifacts {
  return {
    product: doc.product as Record<string, unknown>,
    naming: doc.naming as Record<string, unknown>,
    branding: doc.branding as Record<string, unknown>,
    design_options: doc.design_options as Record<string, unknown>[],
    ia: doc.ia as Record<string, unknown>,
    journeys: doc.journeys as PipelineArtifacts['journeys'],
    screens: (doc.prototype as { screens: PipelineArtifacts['screens'] }).screens.map((s) => ({
      id: s.id,
      name: s.name,
      route: s.route,
      components: s.components,
      story_ids: s.story_ids ?? [],
      intent: s.name,
    })),
    copy: doc.copy as Record<string, unknown>[],
    handoff: doc.handoff as Record<string, unknown>,
  };
}

export function intakeFromPackage(doc: Record<string, unknown>): IntakePayload {
  const intake = doc.intake as IntakePayload;
  return intake;
}
