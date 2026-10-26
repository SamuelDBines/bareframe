import type { PreviewInteractionState } from '../library/types';
import { previewClassName } from './utils';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'outline' | 'error';

export type BadgeProps = {
	variant?: BadgeVariant;
	size?: 'sm' | 'md';
	children?: React.ReactNode;
	previewState?: PreviewInteractionState;
};

export function Badge({
	variant = 'default',
	size = 'md',
	children = 'Badge',
	previewState = 'default',
}: BadgeProps) {
	return (
		<span className={previewClassName(`bf-badge bf-badge--${variant} bf-badge--${size}`, previewState)}>
			{children}
		</span>
	);
}
