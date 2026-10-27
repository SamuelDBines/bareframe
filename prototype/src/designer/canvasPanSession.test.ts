import { describe, expect, it } from 'vitest';
import { cameraForPan } from './canvasPanSession';

describe('cameraForPan', () => {
	it('offsets camera by pointer delta from anchor', () => {
		const anchor = { startX: 100, startY: 200, camX: 50, camY: 60 };
		const cam = { x: 50, y: 60, zoom: 1 };
		expect(cameraForPan(anchor, 40, 260, cam)).toEqual({ x: -10, y: 120, zoom: 1 });
	});
});
