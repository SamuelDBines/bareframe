import { describe, expect, it } from 'vitest';
import { verifyRenderWorkerSecret } from '../src/internal/worker-auth.js';

describe('verifyRenderWorkerSecret', () => {
	it('accepts matching secrets', () => {
		expect(verifyRenderWorkerSecret('abc', 'abc')).toBe(true);
	});

	it('rejects wrong length or value', () => {
		expect(verifyRenderWorkerSecret('abc', 'abcd')).toBe(false);
		expect(verifyRenderWorkerSecret('wrong', 'secret')).toBe(false);
		expect(verifyRenderWorkerSecret(undefined, 'secret')).toBe(false);
		expect(verifyRenderWorkerSecret('', 'secret')).toBe(false);
	});

	it('uses timingSafeEqual for equal-length strings', () => {
		const secret = 'test-render-worker-secret';
		expect(verifyRenderWorkerSecret(secret, secret)).toBe(true);
		expect(verifyRenderWorkerSecret(`${secret}x`, secret)).toBe(false);
	});
});
