import type { PreviewInteractionState } from '../library/types';

export function previewClassName(
	base: string,
	state: PreviewInteractionState,
	extra?: string,
): string {
	const parts = [base, extra].filter(Boolean);
	if (state === 'hover') parts.push('bf-preview-hover');
	if (state === 'focus') parts.push('bf-preview-focus');
	if (state === 'disabled') parts.push('bf-preview-disabled');
	if (state === 'loading') parts.push('bf-preview-loading');
	return parts.join(' ');
}

export function stateProps(state: PreviewInteractionState): {
	disabled?: boolean;
	'aria-disabled'?: boolean;
	'data-loading'?: boolean;
} {
	if (state === 'disabled') return { disabled: true, 'aria-disabled': true };
	if (state === 'loading') return { disabled: true, 'data-loading': true };
	return {};
}
