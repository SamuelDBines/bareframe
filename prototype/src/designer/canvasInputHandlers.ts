import { panCamera, setCameraZoomAtScreenPoint, zoomCameraAroundPoint, type Camera } from './camera';

export type CanvasWheelInput = {
	clientX: number;
	clientY: number;
	deltaX: number;
	deltaY: number;
	ctrlKey: boolean;
	metaKey?: boolean;
};

export function applyCanvasWheel(
	camera: Camera,
	originLeft: number,
	originTop: number,
	input: CanvasWheelInput,
	zoomStep = 0.08,
): Camera {
	const { clientX, clientY, deltaX, deltaY, ctrlKey } = input;
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
