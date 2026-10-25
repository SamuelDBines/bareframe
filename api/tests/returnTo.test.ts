import { describe, expect, it } from 'vitest';
import { isSafeReturnTo, normalizeReturnTo } from '../src/auth/returnTo.js';

describe('returnTo', () => {
	it('allows app paths and hash routes', () => {
		expect(isSafeReturnTo('/')).toBe(true);
		expect(isSafeReturnTo('/#/designer')).toBe(true);
		expect(isSafeReturnTo('/designer')).toBe(true);
	});

	it('blocks open redirects', () => {
		expect(isSafeReturnTo('https://evil.com')).toBe(false);
		expect(isSafeReturnTo('//evil.com')).toBe(false);
		expect(isSafeReturnTo('/api/auth/github')).toBe(false);
	});

	it('normalizes unsafe values to /', () => {
		expect(normalizeReturnTo('https://evil.com')).toBe('/');
		expect(normalizeReturnTo(undefined)).toBe('/');
	});
});
