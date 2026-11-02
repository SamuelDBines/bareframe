import type { BareframePackage } from '@bareframe/package-contracts';
import type { IntakePayload } from '@bareframe/package-contracts';
import type { LlmAdapter, PipelineArtifacts, PipelineContext } from '../types.js';
export declare function runPipelineStages(llm: LlmAdapter, ctx: PipelineContext): Promise<PipelineArtifacts>;
export type AssembleInput = {
    intake: IntakePayload;
    projectName: string;
    designerProjectId: string;
    shareUrl: string;
    libraryVersion: string;
    artifacts: PipelineArtifacts;
    selectedDirection?: string | null;
};
export declare function assembleBareframePackage(input: AssembleInput): BareframePackage;
