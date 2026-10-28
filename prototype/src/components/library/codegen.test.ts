import { describe, expect, it } from 'vitest';
import { generateComponentSnippet } from './codegen';
import { getRegistryEntry } from './registry';

describe('generateComponentSnippet', () => {
	it('emits @bareframe/react import and changed props', () => {
		const entry = getRegistryEntry('alert');
		expect(entry).toBeDefined();
		const code = generateComponentSnippet(entry!, {
			...entry!.defaultProps,
			variant: 'success',
			title: 'Done',
		});
		expect(code).toContain("from '@bareframe/react'");
		expect(code).toContain('variant={"success"}');
		expect(code).toContain('title={"Done"}');
	});

	it('registry includes new overlay components', () => {
		expect(getRegistryEntry('tooltip')).toBeDefined();
		expect(getRegistryEntry('switch')).toBeDefined();
		expect(getRegistryEntry('stat-card')).toBeDefined();
	});

	it('merges generated props for badge', () => {
		const entry = getRegistryEntry('badge');
		expect(entry?.props.some((p) => p.name === 'variant')).toBe(true);
		expect(entry?.docExamples?.length).toBeGreaterThanOrEqual(3);
	});
});
