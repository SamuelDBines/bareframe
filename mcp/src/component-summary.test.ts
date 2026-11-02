import { describe, expect, it } from 'vitest';
import { loadCatalog } from './catalog.js';
import { summarizeProps } from './component-summary.js';

describe('list_components catalog metadata', () => {
	const catalog = loadCatalog();

	it('includes descriptions and props summaries for react components', () => {
		const button = catalog.components.find((c) => c.slug === 'button');
		expect(button?.description).toContain('Primary actions');
		expect(button?.stability).toBe('stable');
		expect(button?.propsSummary.variants).toContain('primary');
	});

	it('marks tier C web-only slugs as experimental', () => {
		const chart = catalog.components.find((c) => c.slug === 'chart');
		expect(chart?.stability).toBe('experimental');
		expect(chart?.reactExport).toBeNull();
	});

	it('summarizeProps caps optional props', () => {
		const button = catalog.components.find((c) => c.slug === 'button');
		expect(button?.propsSummary.optional.length).toBeLessThanOrEqual(12);
		const manual = summarizeProps(button?.props ?? [], ['primary']);
		expect(manual.variants).toContain('primary');
	});
});
