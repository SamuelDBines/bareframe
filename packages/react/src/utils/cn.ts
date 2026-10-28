import type { Ref, RefCallback, MutableRefObject } from 'react';

export function cn(...parts: Array<string | false | null | undefined>): string {
	return parts.filter(Boolean).join(' ');
}

export function mergeRefs<T>(...refs: Array<Ref<T> | undefined>): RefCallback<T> {
	return (value) => {
		for (const ref of refs) {
			if (!ref) continue;
			if (typeof ref === 'function') ref(value);
			else (ref as MutableRefObject<T | null>).current = value;
		}
	};
}
