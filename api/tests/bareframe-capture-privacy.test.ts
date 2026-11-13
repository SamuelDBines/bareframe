import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const scriptSource = readFileSync(path.join(root, 'prototype/public/bareframe-capture.js'), 'utf8');

describe('bareframe-capture privacy defaults', () => {
	it('gates on consent and privacy signals', () => {
		expect(scriptSource).toContain('globalPrivacyControl');
		expect(scriptSource).toContain('consentGranted');
		expect(scriptSource).toContain('Bareframe.consent');
		expect(scriptSource).toContain('data-consent-required');
	});

	it('masks inputs and never listens to keystrokes', () => {
		expect(scriptSource).toContain('data-bareframe-mask');
		expect(scriptSource).toContain('sanitizeEvent');
		expect(scriptSource).not.toMatch(/addEventListener\s*\(\s*['"]key/);
		expect(scriptSource).toContain("'input'");
	});

	it('minimises transport identifiers', () => {
		expect(scriptSource).toContain("credentials: 'omit'");
		expect(scriptSource).toContain('retentionDays');
	});
});
