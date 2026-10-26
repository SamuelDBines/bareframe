export type Camera = { x: number; y: number; zoom: number };

export const ZOOM_MIN = 0.25;
export const ZOOM_MAX = 2.5;

export function clampZoom(zoom: number): number {
	return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, zoom));
}

/** Zoom toward a screen-space point while keeping that world point fixed. */
export function zoomCameraAroundPoint(
	camera: Camera,
	screenX: number,
	screenY: number,
	originLeft: number,
	originTop: number,
	deltaZoom: number,
): Camera {
	const nextZoom = clampZoom(camera.zoom + deltaZoom);
	const mx = screenX - originLeft;
	const my = screenY - originTop;
	const wx = (mx - camera.x) / camera.zoom;
	const wy = (my - camera.y) / camera.zoom;
	return {
		zoom: nextZoom,
		x: mx - wx * nextZoom,
		y: my - wy * nextZoom,
	};
}

export function panCamera(camera: Camera, dx: number, dy: number): Camera {
	return { ...camera, x: camera.x + dx, y: camera.y + dy };
}

export function setCameraZoomAtScreenPoint(
	camera: Camera,
	screenX: number,
	screenY: number,
	originLeft: number,
	originTop: number,
	nextZoom: number,
): Camera {
	const zoom = clampZoom(nextZoom);
	const mx = screenX - originLeft;
	const my = screenY - originTop;
	const wx = (mx - camera.x) / camera.zoom;
	const wy = (my - camera.y) / camera.zoom;
	return {
		zoom,
		x: mx - wx * zoom,
		y: my - wy * zoom,
	};
}
