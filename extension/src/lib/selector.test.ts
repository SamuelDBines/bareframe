import { describe, expect, it } from 'vitest';
import { clickMetaFromTarget, selectorFor } from './selector.js';

describe('selector', () => {
	it('uses id when present', () => {
		const el = { id: 'checkout', nodeName: 'BUTTON', classList: [] } as unknown as Element;
		expect(selectorFor(el)).toBe('#checkout');
	});

	it('builds click meta with bounds', () => {
		const el = {
			id: 'go',
			nodeName: 'A',
			classList: { length: 0 },
			getAttribute: () => null,
			textContent: 'Continue',
			parentElement: null,
			getBoundingClientRect: () => ({ width: 120, height: 40, x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) }),
		} as unknown as Element;
		const meta = clickMetaFromTarget(el, { x: 50, y: 20 });
		expect(meta.selector).toBe('#go');
		expect(meta.w).toBe(120);
		expect(meta.name).toBe('Continue');
	});
});