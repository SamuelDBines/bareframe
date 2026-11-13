import { describe, expect, it } from 'vitest';
import { playgroundStageStyle, PLAYGROUND_STAGE_MAX_WIDTH } from './playgroundViewport';

describe('playgroundStageStyle', () => {
	it('keeps toolbar host full width — stage alone uses mobile cap', () => {
		expect(PLAYGROUND_STAGE_MAX_WIDTH.mobile).toBe('375px');
		expect(playgroundStageStyle('mobile')).toEqual({ maxWidth: '375px', margin: '0 auto' });
	});

	it('tablet and desktop stage widths', () => {
		expect(playgroundStageStyle('tablet')).toEqual({ maxWidth: '768px', margin: '0 auto' });
		expect(playgroundStageStyle('desktop')).toEqual({ maxWidth: '100%' });
	});
});
