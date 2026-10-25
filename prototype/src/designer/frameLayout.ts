import { deviceDimensions, getDevicePreset } from './devicePresets';
import type { Frame } from './types';

export const FRAME_GAP_X = 56;
export const FRAME_GAP_Y = 80;
export const CANVAS_ORIGIN = 40;
export const FRAME_LABEL_HEIGHT = 28;

export type Rect = { x: number; y: number; w: number; h: number };

export function frameBounds(f: Frame): Rect {
	return {
		x: f.x,
		y: f.y - FRAME_LABEL_HEIGHT,
		w: f.width,
		h: f.height + FRAME_LABEL_HEIGHT,
	};
}

function intersects(a: Rect, b: Rect, gap = 16): boolean {
	return !(
		a.x + a.w + gap <= b.x ||
		b.x + b.w + gap <= a.x ||
		a.y + a.h + gap <= b.y ||
		b.y + b.h + gap <= a.y
	);
}

/** Lay frames in a horizontal row (frame sets / devices). */
export function layoutFramesInRow(
	frames: Frame[],
	startX = CANVAS_ORIGIN,
	startY = CANVAS_ORIGIN,
): void {
	let x = startX;
	for (const f of frames) {
		f.x = x;
		f.y = startY;
		x += f.width + FRAME_GAP_X;
	}
}

/** designer.io-style grid: 3 per row with 56×80 gaps. */
export function autoPlaceFrame(
	allFrames: Frame[],
	width: number,
	height: number,
): { x: number; y: number } {
	let attempt = 0;
	while (attempt < 200) {
		const idx = allFrames.length + attempt;
		const x = CANVAS_ORIGIN + (idx % 3) * (width + FRAME_GAP_X);
		const y = CANVAS_ORIGIN + Math.floor(idx / 3) * (height + FRAME_GAP_Y);
		const candidate: Rect = { x, y: y - FRAME_LABEL_HEIGHT, w: width, h: height + FRAME_LABEL_HEIGHT };
		const hit = allFrames.some((f) => intersects(candidate, frameBounds(f)));
		if (!hit) return { x, y };
		attempt++;
	}
	const maxX = Math.max(CANVAS_ORIGIN, ...allFrames.map((f) => f.x + f.width));
	return { x: maxX + FRAME_GAP_X, y: CANVAS_ORIGIN };
}

export function findPlacementBesideCluster(
	allFrames: Frame[],
	width: number,
	height: number,
	preferNear?: { x: number; y: number },
): { x: number; y: number } {
	if (!allFrames.length) return { x: CANVAS_ORIGIN, y: CANVAS_ORIGIN };
	const minX = Math.min(...allFrames.map((f) => f.x));
	const minY = Math.min(...allFrames.map((f) => f.y));
	const maxX = Math.max(...allFrames.map((f) => f.x + f.width));
	const maxY = Math.max(...allFrames.map((f) => f.y + f.height));

	const candidates = [
		{ x: maxX + FRAME_GAP_X, y: preferNear?.y ?? minY },
		{ x: minX, y: maxY + FRAME_GAP_Y },
		{ x: maxX + FRAME_GAP_X, y: maxY + FRAME_GAP_Y },
	];

	for (const c of candidates) {
		const candidate: Rect = {
			x: c.x,
			y: c.y - FRAME_LABEL_HEIGHT,
			w: width,
			h: height + FRAME_LABEL_HEIGHT,
		};
		if (!allFrames.some((f) => intersects(candidate, frameBounds(f)))) return c;
	}
	return autoPlaceFrame(allFrames, width, height);
}

export function relayoutFrameSet(frames: Frame[], frameSetId: string): void {
	const set = frames.filter((f) => f.frameSetId === frameSetId && !f.ghost);
	if (set.length === 0) return;
	set.sort((a, b) => a.width - b.width);
	const anchorY = Math.min(...set.map((f) => f.y));
	layoutFramesInRow(set, CANVAS_ORIGIN, anchorY);
}

export function boundsForFrames(frames: Frame[]): Rect | null {
	if (!frames.length) return null;
	const rects = frames.map(frameBounds);
	const minX = Math.min(...rects.map((r) => r.x));
	const minY = Math.min(...rects.map((r) => r.y));
	const maxX = Math.max(...rects.map((r) => r.x + r.w));
	const maxY = Math.max(...rects.map((r) => r.y + r.h));
	return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function cameraToFitBounds(
	bounds: Rect,
	viewW: number,
	viewH: number,
	padding = 48,
): { x: number; y: number; zoom: number } {
	const worldW = bounds.w + padding * 2;
	const worldH = bounds.h + padding * 2;
	const zoom = Math.min(2.5, Math.max(0.25, Math.min(viewW / worldW, viewH / worldH)));
	const x = padding + (viewW - worldW * zoom) / 2 - bounds.x * zoom;
	const y = padding + (viewH - worldH * zoom) / 2 - bounds.y * zoom;
	return { x, y, zoom };
}

export function cameraCenteredOnFrame(
	frame: Frame,
	viewW: number,
	viewH: number,
	zoom = 0.6,
): { x: number; y: number; zoom: number } {
	const cx = frame.x + frame.width / 2;
	const cy = frame.y + frame.height / 2;
	return {
		zoom,
		x: viewW / 2 - cx * zoom,
		y: viewH / 2 - cy * zoom,
	};
}

export type MatrixLayout = {
	originX: number;
	originY: number;
	headerW: number;
	headerH: number;
	colPresetIds: string[];
	rowThemeIds: string[];
	cellFrames: string[];
	colX: number[];
	rowY: number[];
	colWidths: number[];
	rowHeights: number[];
};

export function layoutCompareMatrix(
	frames: Frame[],
	pageId: string,
	themeIds: string[],
	devicePresetIds: string[],
	createId: () => string,
): MatrixLayout {
	const HEADER_W = 128;
	const HEADER_H = 40;
	const ox = CANVAS_ORIGIN;
	const oy = CANVAS_ORIGIN;
	const cols = devicePresetIds.slice(0, 4);
	const rows = themeIds.slice(0, 4);
	const colWidths = cols.map((id) => getDevicePreset(id)?.width ?? 393);
	const rowHeights = cols.map((id) => getDevicePreset(id)?.height ?? 852);
	const maxH = Math.max(...rowHeights, 852);

	const cellFrames: string[] = [];
	const colX: number[] = [];
	const rowY: number[] = [];
	let y = oy + HEADER_H;
	for (let ri = 0; ri < rows.length; ri++) {
		rowY.push(y);
		let x = ox + HEADER_W;
		for (let ci = 0; ci < cols.length; ci++) {
			if (ri === 0) colX.push(x);
			const pid = cols[ci];
			const preset = getDevicePreset(pid)!;
			const dim = deviceDimensions(preset);
			const id = createId();
			cellFrames.push(id);
			frames.push({
				id,
				name: 'Home',
				pageId,
				x,
				y,
				width: dim.width,
				height: dim.height,
				devicePresetId: pid,
				heightMode: 'fixed',
				themeId: rows[ri] as Frame['themeId'],
				ghost: true,
				readOnly: true,
			});
			x += dim.width + FRAME_GAP_X;
		}
		y += maxH + FRAME_GAP_Y;
	}

	return {
		originX: ox,
		originY: oy,
		headerW: HEADER_W,
		headerH: HEADER_H,
		colPresetIds: cols,
		rowThemeIds: rows,
		cellFrames,
		colX,
		rowY,
		colWidths,
		rowHeights: rows.map(() => maxH),
	};
}
