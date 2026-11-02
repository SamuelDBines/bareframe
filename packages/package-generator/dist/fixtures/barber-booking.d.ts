import type { IntakePayload } from '@bareframe/package-contracts';
import type { LlmAdapter, PipelineArtifacts } from '../types.js';
export declare function barberBookingArtifacts(intake: IntakePayload, projectName: string): PipelineArtifacts;
export declare function createFixtureLlmAdapter(intake: IntakePayload, projectName: string): LlmAdapter;
