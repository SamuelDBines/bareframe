import { describe, expect, it } from 'vitest';
import { validateBareframePackage } from '../src/validate.js';

describe('validateBareframePackage', () => {
  it('rejects empty object', () => {
    const result = validateBareframePackage({});
    expect(result.ok).toBe(false);
  });
});
