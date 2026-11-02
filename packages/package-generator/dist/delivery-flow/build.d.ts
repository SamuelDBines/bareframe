import type { IntakePayload } from '@bareframe/package-contracts';
import type { PipelineArtifacts } from '../types.js';
export declare function buildDeliveryFlowContracts(projectName: string, summary: string, intake: IntakePayload, artifacts: PipelineArtifacts): {
    define: Record<string, unknown>;
    design: Record<string, unknown>;
};
export declare function buildReviewChecklist(): {
    id: string;
    section: string;
    item: string;
    status: 'pending';
}[];
