import { describe, expect, it } from 'vitest';
import { looksLikeWebsiteUrl, buildCaptureSnippet } from './websiteImportUtils';

describe('looksLikeWebsiteUrl', () => {
	it('accepts https hostnames on the free plan flow', () => {
		expect(looksLikeWebsiteUrl('https://yourproduct.com')).toBe(true);
		expect(looksLikeWebsiteUrl('ftp://bad')).toBe(false);
		expect(looksLikeWebsiteUrl('not a url')).toBe(false);
	});
});

describe('buildCaptureSnippet', () => {
	it('never embeds privileged scopes and marks screenshots opt-in', () => {
		const html = buildCaptureSnippet({
			origin: 'https://bareframe.org',
			token: 'bf_proj_test',
			endpoint: 'https://bareframe.org/api/v1/capture/events',
			screenshots: true,
		});
		expect(html).toContain('data-screenshots="1"');
		expect(html).toContain('data-redact="1"');
		expect(html).not.toContain('GITHUB');
	});
});
