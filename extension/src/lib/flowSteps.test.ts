import { describe, expect, it } from 'vitest';
import {
	type CaptureClick,
	dedupeStepsForUpload,
	normalizeCaptureClick,
	normalizePageUrl,
	stepsToCapturePayload,
} from './flowSteps.js';

describe('flowSteps', () => {
	it('normalizes URLs', () => {
		expect(normalizePageUrl('https://ex.test/path#home')).toBe('https://ex.test/path#home');
	});

	it('dedupes upload steps by URL', () => {
		const steps = [
			{ url: 'https://a/', title: 'A', capturedAt: '', viewport: { width: 1, height: 1 } },
			{ url: 'https://b/', title: 'B', capturedAt: '', viewport: { width: 1, height: 1 } },
			{ url: 'https://a/', title: 'A again', capturedAt: '', viewport: { width: 1, height: 1 } },
		];
		expect(dedupeStepsForUpload(steps)).toHaveLength(2);
	});

	it('strips click without coordinates', () => {
		expect(normalizeCaptureClick({ name: 'Go' } as CaptureClick)).toBeUndefined();
		expect(normalizeCaptureClick({ x: 1, y: 2, name: 'Go' })).toEqual({ x: 1, y: 2, name: 'Go' });
	});

	it('maps steps to API payload indices', () => {
		const payload = stepsToCapturePayload([
			{
				url: 'https://a/',
				title: 'A',
				capturedAt: 't',
				viewport: { width: 100, height: 100 },
				click: { x: 1, y: 2, name: 'Go' },
			},
		]);
		expect(payload[0]?.stepIndex).toBe(0);
		expect(payload[0]?.click?.name).toBe('Go');
	});
});