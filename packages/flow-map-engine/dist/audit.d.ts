import type { AuditFinding, PageCaptureMetrics } from './types.js';
export type AuditRules = {
    requireHeader?: boolean;
    requireBottomBar?: boolean;
    minSideMarginPx?: number;
    maxOffBrandColors?: number;
    brandColorHex?: string;
};
export declare function auditPageMetrics(metrics: PageCaptureMetrics, rules?: AuditRules): AuditFinding[];
export declare function summarizeFindings(findings: AuditFinding[]): string;
