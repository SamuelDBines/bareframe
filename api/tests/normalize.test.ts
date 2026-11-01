import { describe, expect, it } from 'vitest';
import { normalizeUserId, mapProjectRow } from '../src/db/normalize.js';

describe('normalizeUserId', () => {
	it('coerces pg int8 strings for ownership checks', () => {
		expect(normalizeUserId('42')).toBe(42);
		expect(mapProjectRow({ owner_user_id: '7', version: '3' })).toEqual({
			owner_user_id: 7,
			version: 3,
		});
	});
});
