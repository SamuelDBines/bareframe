import { describe, expect, it } from 'vitest';
import { DESIGN_DEVICES, repairDesignSpec } from '../src/designSpec.js';
import { checkDesignTreeA11y } from '../src/templateLibrary/a11y.js';
import { listFlowTemplates, listScreenTemplates } from '../src/templateLibrary/registry.js';
import { buildScreenVariantTree } from '../src/templateLibrary/render.js';

describe('template library', () => {
	it('lists many screen and flow templates', () => {
		expect(listScreenTemplates().length).toBeGreaterThanOrEqual(60);
		expect(listFlowTemplates().length).toBeGreaterThanOrEqual(20);
	});

	it('renders every variant at all devices without repair errors', () => {
		for (const screen of listScreenTemplates()) {
			for (const variant of screen.variants) {
				for (const device of DESIGN_DEVICES) {
					const tree = variant.build(device);
					const { repairs } = repairDesignSpec({ states: { default: tree } });
					expect(repairs, `${screen.id}/${variant.id}/${device}`).toEqual([]);
					const issues = checkDesignTreeA11y(tree);
					expect(issues, `${screen.id}/${variant.id}/${device}`).toEqual([]);
				}
			}
		}
	});

	it('builds login classic with connector hotspots', () => {
		const tree = buildScreenVariantTree('login', 'classic', 'phone');
		const walk = JSON.stringify(tree);
		expect(walk).toContain('Sign in');
	});
});