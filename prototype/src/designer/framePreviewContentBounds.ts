import type { Frame, Page } from './types';

/** Logical artboard size used for preview iframe layout (matches FramePreview). */
export function framePreviewContentDimensions(frame: Frame, _page?: Page): { width: number; height: number } {
	return { width: frame.width, height: frame.height };
}
