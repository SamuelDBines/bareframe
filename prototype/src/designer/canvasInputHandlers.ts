import { panCamera, setCameraZoomAtScreenPoint, zoomCameraAroundPoint, type Camera } from './camera';

export const DOM_DELTA_PIXEL = 0;
export const DOM_DELTA_LINE = 1;
export const DOM_DELTA_PAGE = 2;

export type CanvasWheelInput = {
	clientX: number;
	clientY: number;
	deltaX: number;
	deltaY: number;
	deltaMode?: number;
	ctrlKey: boolean;
	shiftKey?: boolean;
	metaKey?: boolean;
	/** Viewport height used to scale DOM_DELTA_PAGE; defaults to 800. */
	pageSize?: number;
	/** Pixels per line for DOM_DELTA_LINE; defaults to 16 (matches common browsers). */
	lineSize?: number;
};

export function normalizeWheelDeltas(
	deltaX: number,
	deltaY: number,
	deltaMode = DOM_DELTA_PIXEL,
	lineSize = 16,
	pageSize = 800,
): { deltaX: number; deltaY: number } {
	const scale = (value: number, mode: number) => {
		if (mode === DOM_DELTA_LINE) return value * lineSize;
		if (mode === DOM_DELTA_PAGE) return value * pageSize;
		return value;
	};
	return {
		deltaX: scale(deltaX, deltaMode),
		deltaY: scale(deltaY, deltaMode),
	};
}

/** Map Shift+vertical wheel to horizontal pan (trackpad / mouse convention). */
export function wheelPanDeltas(
	deltaX: number,
	deltaY: number,
	shiftKey: boolean,
): { deltaX: number; deltaY: number } {
	if (shiftKey && Math.abs(deltaY) >= Math.abs(deltaX)) {
		return { deltaX: deltaX + deltaY, deltaY: 0 };
	}
	return { deltaX, deltaY };
}

export function applyCanvasWheel(
	camera: Camera,
	originLeft: number,
	originTop: number,
	input: CanvasWheelInput,
	zoomStep = 0.08,
): Camera {
	const { clientX, clientY, ctrlKey } = input;
	const lineSize = input.lineSize ?? 16;
	const pageSize = input.pageSize ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
	const normalized = normalizeWheelDeltas(
		input.deltaX,
		input.deltaY,
		input.deltaMode ?? DOM_DELTA_PIXEL,
		lineSize,
		pageSize,
	);
	const { deltaX, deltaY } = wheelPanDeltas(normalized.deltaX, normalized.deltaY, Boolean(input.shiftKey));

	if (ctrlKey) {
		const delta = deltaY !== 0 ? deltaY : deltaX;
		return zoomCameraAroundPoint(camera, clientX, clientY, originLeft, originTop, delta > 0 ? -zoomStep : zoomStep);
	}
	return panCamera(camera, -deltaX, -deltaY);
}

export function applyCanvasGestureScale(
	_originCamera: Camera,
	originLeft: number,
	originTop: number,
	clientX: number,
	clientY: number,
	scale: number,
	startCamera: Camera,
): Camera {
	const nextZoom = startCamera.zoom * scale;
	return setCameraZoomAtScreenPoint(startCamera, clientX, clientY, originLeft, originTop, nextZoom);
}
