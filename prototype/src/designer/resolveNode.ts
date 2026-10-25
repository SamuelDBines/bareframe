import { breakpointsUpTo } from './breakpoints';
import type { BreakpointId, DesignNode, LayoutModel } from './types';

export function resolveLayout(node: DesignNode, frameBreakpoint: BreakpointId): LayoutModel {
	let layout = { ...node.layout };
	for (const bp of breakpointsUpTo(frameBreakpoint)) {
		const o = node.overrides?.[bp]?.layout;
		if (o) layout = { ...layout, ...o };
	}
	return layout;
}

export function isVisible(node: DesignNode, frameBreakpoint: BreakpointId): boolean {
	for (const bp of breakpointsUpTo(frameBreakpoint)) {
		if (node.visibility?.[bp] === false) return false;
	}
	return true;
}

export function resolveVariant(
	node: DesignNode,
	trialSwaps: { nodeId: string; variantKey: string }[],
): string {
	const swap = trialSwaps.find((s) => s.nodeId === node.id);
	return swap?.variantKey ?? node.instance?.variantKey ?? 'primary';
}
