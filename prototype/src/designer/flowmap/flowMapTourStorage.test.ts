/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest';
import { readFlowMapTourState, writeFlowMapTourDismissed } from './flowMapTourStorage';

const KEY = 'bareframe.flowMapTour.v1';

describe('flowMapTourStorage', () => {
	afterEach(() => {
		localStorage.removeItem(KEY);
	});

	it('defaults to not dismissed', () => {
		expect(readFlowMapTourState().dismissed).toBe(false);
	});

	it('persists dismiss flag', () => {
		writeFlowMapTourDismissed(true);
		expect(readFlowMapTourState().dismissed).toBe(true);
		expect(JSON.parse(localStorage.getItem(KEY) ?? '{}').completedAt).toBeTruthy();
	});
});
