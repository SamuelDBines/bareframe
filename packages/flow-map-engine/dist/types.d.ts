export type ViewportPreset = 'mobile' | 'desktop';
export declare const VIEWPORT_SIZES: Record<ViewportPreset, {
    width: number;
    height: number;
}>;
export type DiscoveredRoute = {
    path: string;
    source: 'seed' | 'sitemap' | 'crawl';
};
export type PageLink = {
    fromPath: string;
    toPath: string;
    label: string;
    trigger: 'link' | 'button' | 'nav';
};
export type AuditRuleId = 'header_present' | 'bottom_bar_present' | 'min_side_margin' | 'horizontal_overflow' | 'brand_color';
export type AuditFinding = {
    pageUrl: string;
    ruleId: AuditRuleId;
    severity: 'info' | 'warn' | 'error';
    message: string;
    evidence?: Record<string, unknown>;
};
export type PageCaptureMetrics = {
    url: string;
    path: string;
    scrollWidth: number;
    clientWidth: number;
    hasHeader: boolean;
    hasBottomBar: boolean;
    minSideMargin: number;
    offBrandColorHits: number;
};
export type FlowMapBuildInput = {
    pages: {
        path: string;
        url: string;
        assetId: string;
        title: string;
    }[];
    links: PageLink[];
    findings: AuditFinding[];
    summaryText: string;
};
