import { describe, expect, it } from 'vitest';
import { buildFramePreviewDoc } from './framePreviewDoc';
import { framePreviewContentDimensions } from './framePreviewContentBounds';
import {
	PROTOTYPE_SHELL_SAFE_INSET,
	letterboxContentScale,
	prototypeDeviceMetrics,
	prototypeStageScale,
	prototypeStageSlotWidth,
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
		expect(metrics.drawnW).toBeLessThanOrEqual(metrics.shellW - PROTOTYPE_SHELL_SAFE_INSET * 2 + 0.01);
		expect(metrics.drawnH).toBeLessThanOrEqual(metrics.shellH - PROTOTYPE_SHELL_SAFE_INSET * 2 + 0.01);
	});

	it('layout fit box matches scaled bounds (no overflow clip from transform)', () => {
		const metrics = prototypeDeviceMetrics('phone', frame({ width: 393, height: 852 }));
		expect(metrics.drawnW).toBeCloseTo(metrics.contentW * metrics.contentScale, 5);
		expect(metrics.drawnH).toBeCloseTo(metrics.contentH * metrics.contentScale, 5);
		expect(metrics.drawnW).toBeLessThanOrEqual(metrics.shellW);
		expect(metrics.drawnH).toBeLessThanOrEqual(metrics.shellH);
	});

	it('scales stage to fit outer device chrome', () => {
		const scale = prototypeStageScale(418, 872, 800, 600);
		expect(scale).toBeLessThan(1);
		const innerW = 390 - PROTOTYPE_SHELL_SAFE_INSET * 2;
		const innerH = 844 - PROTOTYPE_SHELL_SAFE_INSET * 2;
		expect(letterboxContentScale(innerW, innerH, 393, 852)).toBeCloseTo(Math.min(innerW / 393, innerH / 852), 5);
	});

	it('reserves layout width for stage transform scale', () => {
		expect(prototypeStageSlotWidth(418, 0.5, 900)).toBe(209);
		expect(prototypeStageSlotWidth(418, 0.5, 180)).toBe(180);
	});
});

describe('framePreviewContentBounds', () => {
	it('uses frame artboard dimensions', () => {
		expect(framePreviewContentDimensions(frame({ width: 393, height: 852 }))).toEqual({
			width: 393,
			height: 852,
		});
	});
});

describe('buildFramePreviewDoc', () => {
	it('locks body height when frameHeight is set', () => {
		const doc = buildFramePreviewDoc({
			page: { id: 'p', name: 'P', routePath: '/', rootNodeId: 'r', nodes: {} },
			frameWidth: 393,
			frameHeight: 852,
			themeId: 'light',
			tokenOverrides: {},
			selectedNodeId: null,
			assetBase: 'https://example.test/',
			previewCss: '/* x */',
		});
		expect(doc).toContain('height:852px');
		expect(doc).toContain('overflow:hidden');
	});
});
