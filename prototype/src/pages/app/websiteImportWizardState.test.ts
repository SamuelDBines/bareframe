/**
 * @vitest-environment jsdom
 */
import { describe, expect, it } from 'vitest';
import {
	defaultWizardState,
	loadWizardState,
	maxStepForMethod,
	saveWizardState,
	wizardStorageKey,
} from './websiteImportWizardState';

describe('websiteImportWizardState', () => {
	it('persists in sessionStorage', () => {
		const key = wizardStorageKey('proj_test');
		sessionStorage.removeItem(key);
		const state = { ...defaultWizardState(), step: 2, method: 'capture' as const };
		saveWizardState('proj_test', state);
		const loaded = loadWizardState('proj_test');
		expect(loaded.step).toBe(2);
		expect(loaded.method).toBe('capture');
		sessionStorage.removeItem(key);
	});

	it('limits server-side flows to review at step 2', () => {
		expect(maxStepForMethod('server-crawl')).toBe(2);
		expect(maxStepForMethod('capture')).toBe(3);
	});
});
