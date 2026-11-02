const DEFAULT_RULES = {
    requireHeader: true,
    requireBottomBar: false,
    minSideMarginPx: 12,
    maxOffBrandColors: 3,
    brandColorHex: '#2563eb',
};
export function auditPageMetrics(metrics, rules = {}) {
    const r = { ...DEFAULT_RULES, ...rules };
    const findings = [];
    const pageUrl = metrics.url;
    if (r.requireHeader && !metrics.hasHeader) {
        findings.push({
            pageUrl,
            ruleId: 'header_present',
            severity: 'warn',
            message: 'No header landmark detected',
        });
    }
    if (r.requireBottomBar && !metrics.hasBottomBar) {
        findings.push({
            pageUrl,
            ruleId: 'bottom_bar_present',
            severity: 'warn',
            message: 'No bottom navigation bar detected',
        });
    }
    if (metrics.minSideMargin < r.minSideMarginPx) {
        findings.push({
            pageUrl,
            ruleId: 'min_side_margin',
            severity: 'warn',
            message: `Side margin ${metrics.minSideMargin}px is below ${r.minSideMarginPx}px`,
            evidence: { minSideMargin: metrics.minSideMargin },
        });
    }
    if (metrics.scrollWidth > metrics.clientWidth + 2) {
        findings.push({
            pageUrl,
            ruleId: 'horizontal_overflow',
            severity: 'error',
            message: `Horizontal overflow (scrollWidth ${metrics.scrollWidth}px)`,
            evidence: { scrollWidth: metrics.scrollWidth, clientWidth: metrics.clientWidth },
        });
    }
    if (metrics.offBrandColorHits > r.maxOffBrandColors) {
        findings.push({
            pageUrl,
            ruleId: 'brand_color',
            severity: 'info',
            message: `${metrics.offBrandColorHits} off-brand colour samples (expected ${r.brandColorHex})`,
            evidence: { hits: metrics.offBrandColorHits, brand: r.brandColorHex },
        });
    }
    return findings;
}
export function summarizeFindings(findings) {
    const errors = findings.filter((f) => f.severity === 'error').length;
    const warns = findings.filter((f) => f.severity === 'warn').length;
    const infos = findings.filter((f) => f.severity === 'info').length;
    return `Audit: ${errors} error(s), ${warns} warning(s), ${infos} info. ${findings.length} total finding(s).`;
}
