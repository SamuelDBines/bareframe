import { describe, expect, it } from 'vitest';
import { applyCanvasWheel } from './canvasInputHandlers';

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
});
