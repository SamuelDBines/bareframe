import { describe, expect, it } from 'vitest';
import {
	letterboxContentScale,
	prototypeDeviceMetrics,
	prototypeStageScale,
	prototypeViewportKindForFrame,
} from './prototypeDeviceViewport';
import type { Frame } from './types';

function frame(partial: Partial<Frame> & Pick<Frame, 'width' | 'height'>): Frame {
	return {
		id: 'f1',
		pageId: 'p1',
		name: 'Screen',
		x: 0,
		y: 0,
		devicePresetId: 'iphone-15',
		frameSetId: 'fs1',
		heightMode: 'fixed',
		ghost: false,
		...partial,
	};
}

describe('prototypeDeviceViewport', () => {
	it('defaults phone frames to phone viewport', () => {
		expect(prototypeViewportKindForFrame(frame({ width: 393, height: 852 }))).toBe('phone');
	});

	it('detects tablet and desktop frames', () => {
		expect(
			prototypeViewportKindForFrame(frame({ width: 768, height: 1024, devicePresetId: 'ipad-mini' })),
		).toBe('tablet');
		expect(
			prototypeViewportKindForFrame(frame({ width: 1440, height: 900, devicePresetId: 'desktop-1440' })),
		).toBe('desktop');
	});

	it('letterboxes tall phone art in a phone shell', () => {
		const metrics = prototypeDeviceMetrics('phone', frame({ width: 393, height: 852 }));
		expect(metrics.shellW).toBe(390);
		expect(metrics.shellH).toBe(844);
		expect(metrics.contentScale).toBeLessThan(1);
		expect(metrics.contentOffsetX).toBeGreaterThan(0);
	});

	it('scales stage to fit outer device chrome', () => {
		const scale = prototypeStageScale(418, 872, 800, 600);
		expect(scale).toBeLessThan(1);
		expect(letterboxContentScale(390, 844, 393, 852)).toBeCloseTo(Math.min(390 / 393, 844 / 852), 5);
	});
});
