import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { cn, mergeRefs } from './cn';

describe('cn', () => {
	it('joins truthy class names', () => {
		expect(cn('a', false && 'b', 'c')).toBe('a c');
	});
});

describe('mergeRefs', () => {
	it('forwards to function and object refs', () => {
		const fn = vi.fn();
		const obj = createRef<HTMLDivElement>();
		const merged = mergeRefs(fn, obj);
		const el = document.createElement('div');
		merged(el);
		expect(fn).toHaveBeenCalledWith(el);
		expect(obj.current).toBe(el);
	});
});
