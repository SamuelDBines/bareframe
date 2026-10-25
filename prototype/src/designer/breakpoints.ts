import type { BreakpointId } from './types';

export const BREAKPOINT_ORDER: BreakpointId[] = ['base', 'sm', 'md', 'lg', 'xl'];

export const BREAKPOINT_MIN: Record<BreakpointId, number> = {
	base: 0,
	sm: 480,
	md: 768,
	lg: 1024,
	xl: 1440,
};

export function breakpointForWidth(width: number): BreakpointId {
	if (width >= BREAKPOINT_MIN.xl) return 'xl';
	if (width >= BREAKPOINT_MIN.lg) return 'lg';
	if (width >= BREAKPOINT_MIN.md) return 'md';
	if (width >= BREAKPOINT_MIN.sm) return 'sm';
	return 'base';
}

export function breakpointsUpTo(id: BreakpointId): BreakpointId[] {
	const idx = BREAKPOINT_ORDER.indexOf(id);
	return BREAKPOINT_ORDER.slice(0, idx + 1);
}
