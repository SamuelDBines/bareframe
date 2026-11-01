import type { Frame } from './types.js';

const FRAME_GAP_X = 56;
const FRAME_GAP_Y = 80;
const CANVAS_ORIGIN = 40;
const FRAME_LABEL_HEIGHT = 28;

type Rect = { x: number; y: number; w: number; h: number };

function frameBounds(f: Frame): Rect {
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
		const candidate: Rect = {
			x,
			y: y - FRAME_LABEL_HEIGHT,
			w: width,
			h: height + FRAME_LABEL_HEIGHT,
		};
		const hit = allFrames.some((f) => intersects(candidate, frameBounds(f)));
		if (!hit) return { x, y };
		attempt++;
	}
	const maxX = Math.max(CANVAS_ORIGIN, ...allFrames.map((f) => f.x + f.width));
	return { x: maxX + FRAME_GAP_X, y: CANVAS_ORIGIN };
}

/** Flow-map layout: place frames in a horizontal row with gaps. */
export function layoutFramesInFlowRow(frames: Frame[], startX = CANVAS_ORIGIN, startY = CANVAS_ORIGIN): void {
	let x = startX;
	for (const f of frames) {
		f.x = x;
		f.y = startY;
		x += f.width + FRAME_GAP_X;
	}
}
