import { describe, expect, it } from 'vitest';
import { auditPageMetrics, summarizeFindings } from '../src/audit.js';
import { discoverRoutes } from '../src/discover-routes.js';

describe('discoverRoutes', () => {
	it('merges seed routes and crawls same-origin links', async () => {
		const htmlByPath: Record<string, string> = {
			'/': '<html><body><a href="/about">About</a></body></html>',
			'/about': '<html><body><a href="/">Home</a></body></html>',
		};
		const routes = await discoverRoutes({
			startUrl: 'http://fixture.test/',
			maxPages: 10,
			fetchHtml: async (url) => {
				const u = new URL(url);
				return htmlByPath[u.pathname] ?? '<html></html>';
			},
		});
		expect(routes.map((r) => r.path).sort()).toEqual(['/', '/about']);
	});
});

describe('auditPageMetrics', () => {
	it('flags overflow and missing header', () => {
		const findings = auditPageMetrics({
			url: 'http://x/p',
			path: '/p',
			scrollWidth: 500,
			clientWidth: 390,
			hasHeader: false,
			hasBottomBar: true,
			minSideMargin: 8,
			offBrandColorHits: 0,
		});
		expect(findings.some((f) => f.ruleId === 'horizontal_overflow')).toBe(true);
		expect(findings.some((f) => f.ruleId === 'header_present')).toBe(true);
		expect(summarizeFindings(findings)).toMatch(/error/);
	});
});
