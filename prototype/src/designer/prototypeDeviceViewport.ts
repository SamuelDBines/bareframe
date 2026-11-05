import { getDevicePreset } from './devicePresets';
import type { Frame } from './types';

export type PrototypeViewportKind = 'phone' | 'tablet' | 'desktop';

export const PROTOTYPE_VIEWPORT_PRESETS: Record<
	PrototypeViewportKind,
	{ id: string; label: string; width: number; height: number }
> = {
	phone: { id: 'mobile', label: 'Phone', width: 390, height: 844 },
	tablet: { id: 'tablet', label: 'Tablet', width: 768, height: 1024 },
	desktop: { id: 'desktop-1440', label: 'Desktop', width: 1440, height: 900 },
};

export const PROTOTYPE_DEVICE_CHROME: Record<
	PrototypeViewportKind,
	{ padding: number; radius: number; screenRadius: number }
> = {
	phone: { padding: 14, radius: 54, screenRadius: 40 },
	tablet: { padding: 16, radius: 28, screenRadius: 18 },
	desktop: { padding: 10, radius: 14, screenRadius: 8 },
};

export function prototypeViewportKindForFrame(frame: Frame): PrototypeViewportKind {
	const preset = getDevicePreset(frame.devicePresetId);
	if (preset?.category === 'desktop' || frame.width >= 1100) return 'desktop';
	if (preset?.category === 'tablet' || frame.width >= 560) return 'tablet';
	return 'phone';
}

export function presetIdForViewportKind(kind: PrototypeViewportKind): string {
	return PROTOTYPE_VIEWPORT_PRESETS[kind].id;
}

/** Scale design content to fit inside the viewport shell (letterbox). */
export function letterboxContentScale(
	shellW: number,
	shellH: number,
	contentW: number,
	contentH: number,
): number {
	if (contentW <= 0 || contentH <= 0) return 1;
	return Math.min(1, shellW / contentW, shellH / contentH);
}

export type PrototypeDeviceMetrics = {
	shellW: number;
	shellH: number;
	outerW: number;
	outerH: number;
	contentScale: number;
	contentOffsetX: number;
	contentOffsetY: number;
};

export function prototypeDeviceMetrics(
	viewportKind: PrototypeViewportKind,
	frame: Frame,
): PrototypeDeviceMetrics {
	const shell = PROTOTYPE_VIEWPORT_PRESETS[viewportKind];
	const chrome = PROTOTYPE_DEVICE_CHROME[viewportKind];
	const shellW = shell.width;
	const shellH = shell.height;
	const contentScale = letterboxContentScale(shellW, shellH, frame.width, frame.height);
	const drawnW = frame.width * contentScale;
	const drawnH = frame.height * contentScale;
	const contentOffsetX = (shellW - drawnW) / 2;
	const contentOffsetY = (shellH - drawnH) / 2;
	const outerW = shellW + chrome.padding * 2;
	const outerH = shellH + chrome.padding * 2;
	return {
		shellW,
		shellH,
		outerW,
		outerH,
		contentScale,
		contentOffsetX,
		contentOffsetY,
	};
}

/** Fit the full device chrome on stage (never clip the mock). */
export function prototypeStageScale(
	outerW: number,
	outerH: number,
	stageW: number,
	stageH: number,
	marginX = 48,
	marginY = 32,
): number {
	const availW = Math.max(120, stageW - marginX);
	const availH = Math.max(160, stageH - marginY);
	return Math.min(1, availW / outerW, availH / outerH);
}
