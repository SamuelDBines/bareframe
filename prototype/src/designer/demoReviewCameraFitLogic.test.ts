import { describe, it, expect } from 'vitest';
import { shouldRunDemoReviewAutoFit } from './demoReviewCameraFitLogic';

describe('shouldRunDemoReviewAutoFit', () => {
	it('skips auto-fit on flow map demos (pan must not snap back on pointer-up)', () => {
		expect(shouldRunDemoReviewAutoFit(true)).toBe(false);
	});

	it('still auto-fits legacy single-canvas demo layouts', () => {
		expect(shouldRunDemoReviewAutoFit(false)).toBe(true);
	});
});
