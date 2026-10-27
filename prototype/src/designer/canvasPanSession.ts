import type { Camera } from './camera';

export type PanAnchor = { startX: number; startY: number; camX: number; camY: number };

export function cameraForPan(anchor: PanAnchor, clientX: number, clientY: number, camera: Camera): Camera {
	return {
		...camera,
		x: anchor.camX + (clientX - anchor.startX),
		y: anchor.camY + (clientY - anchor.startY),
	};
}
