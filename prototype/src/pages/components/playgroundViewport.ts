export type PlaygroundViewportId = 'mobile' | 'tablet' | 'desktop';

/** Max width applied to the preview **stage** only (not the playground chrome / toolbar). */
export const PLAYGROUND_STAGE_MAX_WIDTH: Record<PlaygroundViewportId, string> = {
	mobile: '375px',
	tablet: '768px',
	desktop: '100%',
};

export function playgroundStageStyle(
	viewport: PlaygroundViewportId,
): { maxWidth: string; margin?: string } {
	const maxWidth = PLAYGROUND_STAGE_MAX_WIDTH[viewport];
	if (viewport === 'desktop') return { maxWidth };
	return { maxWidth, margin: '0 auto' };
}
