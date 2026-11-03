import type { IntakePayload } from '@bareframe/package-contracts';

export type GeneratorStage =
  | 'definition'
  | 'naming_branding'
  | 'design_directions'
  | 'ia'
  | 'journeys'
  | 'screens_copy'
  | 'handoff'
  | 'prototype';

export type StageProgress = {
  stage: GeneratorStage;
  label: string;
  index: number;
  total: number;
};

export type LlmRequest = {
  stage: GeneratorStage;
  system: string;
  user: string;
  schemaHint: string;
};

export interface LlmAdapter {
  readonly kind: 'openai_compatible' | 'fixture';
  completeJson<T>(request: LlmRequest): Promise<T>;
}

export type PipelineContext = {
  intake: IntakePayload;
  projectName: string;
  onProgress?: (progress: StageProgress) => void;
};

export type ScreenPlan = {
  id: string;
  name: string;
  route: string;
  intent: string;
  components: string[];
  story_ids: string[];
};

export type JourneyPlan = {
  id: string;
  name: string;
  persona: string;
  goal: string;
  story_ids: string[];
  steps: { screen_id: string; action: string; next_screen_id: string | null }[];
};

export type PipelineArtifacts = {
  product: Record<string, unknown>;
  naming: Record<string, unknown>;
  branding: Record<string, unknown>;
  design_options: Record<string, unknown>[];
  ia: Record<string, unknown>;
  journeys: JourneyPlan[];
  screens: ScreenPlan[];
  copy: Record<string, unknown>[];
  handoff: Record<string, unknown>;
};
