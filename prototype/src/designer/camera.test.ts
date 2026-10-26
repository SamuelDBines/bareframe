import { describe, expect, it } from 'vitest';
import { clampZoom, panCamera, setCameraZoomAtScreenPoint, zoomCameraAroundPoint } from './camera';

describe('camera helpers', () => {
	it('clamps zoom', () => {
		expect(clampZoom(0.1)).toBe(0.25);
		expect(clampZoom(9)).toBe(2.5);
	});

	it('pans by delta', () => {
		expect(panCamera({ x: 10, y: 20, zoom: 1 }, 5, -3)).toEqual({ x: 15, y: 17, zoom: 1 });
	});

	it('keeps the world point under the cursor when zooming', () => {
		const start = { x: 100, y: 50, zoom: 1 };
		const next = zoomCameraAroundPoint(start, 200, 150, 0, 0, 0.5);
		const wx = (200 - start.x) / start.zoom;
		const wy = (150 - start.y) / start.zoom;
		expect(200 - wx * next.zoom).toBeCloseTo(next.x, 5);
		expect(150 - wy * next.zoom).toBeCloseTo(next.y, 5);
	});

	it('sets absolute zoom at a screen point', () => {
		const cam = { x: 0, y: 0, zoom: 1 };
		const next = setCameraZoomAtScreenPoint(cam, 100, 100, 0, 0, 2);
		expect(next.zoom).toBe(2);
	});
});
