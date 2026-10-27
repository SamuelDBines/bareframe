import { describe, expect, it } from 'vitest';
import {
	applyCanvasWheel,
	DOM_DELTA_LINE,
	DOM_DELTA_PAGE,
	normalizeWheelDeltas,
	wheelPanDeltas,
} from './canvasInputHandlers';

describe('normalizeWheelDeltas', () => {
	it('scales line mode to pixels', () => {
		expect(normalizeWheelDeltas(2, 0, DOM_DELTA_LINE, 16, 800)).toEqual({ deltaX: 32, deltaY: 0 });
	});

	it('scales page mode to pixels', () => {
		expect(normalizeWheelDeltas(0, -1, DOM_DELTA_PAGE, 16, 900)).toEqual({ deltaX: 0, deltaY: -900 });
	});
});

describe('wheelPanDeltas', () => {
	it('maps shift+vertical scroll to horizontal', () => {
		expect(wheelPanDeltas(0, 40, true)).toEqual({ deltaX: 40, deltaY: 0 });
	});

	it('keeps horizontal delta when shift held but horizontal dominates', () => {
		expect(wheelPanDeltas(50, 10, true)).toEqual({ deltaX: 50, deltaY: 10 });
	});
});

describe('applyCanvasWheel', () => {
	const cam = { x: 100, y: 50, zoom: 1 };

	it('pans when ctrlKey is false', () => {
		const next = applyCanvasWheel(cam, 0, 0, {
			clientX: 200,
			clientY: 200,
			deltaX: 10,
			deltaY: 5,
			ctrlKey: false,
		});
		expect(next.x).toBe(90);
		expect(next.y).toBe(45);
		expect(next.zoom).toBe(1);
	});

	it('zooms when ctrlKey is true', () => {
		const next = applyCanvasWheel(cam, 0, 0, {
			clientX: 200,
			clientY: 200,
			deltaX: 0,
			deltaY: 10,
			ctrlKey: true,
		});
		expect(next.zoom).toBeLessThan(1);
	});

	it('pans horizontally for shift+line-mode vertical wheel', () => {
		const next = applyCanvasWheel(cam, 0, 0, {
			clientX: 200,
			clientY: 200,
			deltaX: 0,
			deltaY: 3,
			deltaMode: DOM_DELTA_LINE,
			shiftKey: true,
			lineSize: 16,
			ctrlKey: false,
		});
		expect(next.x).toBe(100 - 48);
		expect(next.y).toBe(50);
	});
});
