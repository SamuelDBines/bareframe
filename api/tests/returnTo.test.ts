import { describe, expect, it } from 'vitest';
import {
	isSafeReturnTo,
	normalizeReturnTo,
	resolvePostAuthRedirect,
} from '../src/auth/returnTo.js';

const designerUrl = 'https://designer.bareframe.org';

describe('returnTo', () => {
	it('allows app paths and hash routes', () => {
		expect(isSafeReturnTo('/')).toBe(true);
		expect(isSafeReturnTo('/#/designer')).toBe(true);
		expect(isSafeReturnTo('/designer')).toBe(true);
	});

	it('allows absolute Designer URLs', () => {
		expect(isSafeReturnTo('https://designer.bareframe.org/#/editor', designerUrl)).toBe(
			true,
		);
		expect(isSafeReturnTo('https://evil.com/#/', designerUrl)).toBe(false);
	});

	it('blocks open redirects', () => {
		expect(isSafeReturnTo('https://evil.com')).toBe(false);
		expect(isSafeReturnTo('//evil.com')).toBe(false);
		expect(isSafeReturnTo('/api/auth/github')).toBe(false);
	});

	it('normalizes unsafe values to /', () => {
		expect(normalizeReturnTo('https://evil.com', designerUrl)).toBe('/');
		expect(normalizeReturnTo(undefined, designerUrl)).toBe('/');
	});

	it('resolves post-auth redirects', () => {
		expect(resolvePostAuthRedirect('https://bareframe.org', '/')).toBe('https://bareframe.org/');
		expect(
			resolvePostAuthRedirect(
				'https://bareframe.org',
				'https://designer.bareframe.org/#/editor',
			),
		).toBe('https://designer.bareframe.org/#/editor');
	});
});
