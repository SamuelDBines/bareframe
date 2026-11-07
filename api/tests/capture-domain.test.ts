import { describe, expect, it } from 'vitest';
import { eventUrlAllowed, hostMatchesOrigin, normalizeOrigin } from '../src/capture/domain.js';

describe('capture domain binding', () => {
	it('normalizes website origins', () => {
		expect(normalizeOrigin('https://Shop.Example.com/path')).toBe('https://shop.example.com');
	});

	it('allows www alias', () => {
		expect(hostMatchesOrigin('https://www.example.com/app', 'https://example.com')).toBe(true);
	});

	it('rejects foreign origins for domain-bound tokens', () => {
		expect(eventUrlAllowed('https://evil.test/x', ['https://good.test'])).toBe(false);
		expect(eventUrlAllowed('https://good.test/x', ['https://good.test'])).toBe(true);
	});
});
