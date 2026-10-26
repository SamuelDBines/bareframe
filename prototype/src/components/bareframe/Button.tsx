import type { PreviewInteractionState } from '../library/types';
import { previewClassName, stateProps } from './utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
	variant?: ButtonVariant;
	size?: ButtonSize;
	disabled?: boolean;
	loading?: boolean;
	children?: React.ReactNode;
	type?: 'button' | 'submit';
	previewState?: PreviewInteractionState;
};

export function Button({
	variant = 'primary',
	size = 'md',
	disabled,
	loading,
	children = 'Button',
	type = 'button',
	previewState = 'default',
}: ButtonProps) {
	const isLoading = loading || previewState === 'loading';
	const isDisabled = disabled || previewState === 'disabled' || isLoading;
	return (
		<button
			type={type}
			className={previewClassName(
				`btn bf-btn bf-btn--${variant} bf-btn--${size}`,
				previewState,
			)}
			disabled={isDisabled}
			aria-busy={isLoading || undefined}
			{...stateProps(previewState)}
		>
			{isLoading ? <span className="bf-btn__spinner" aria-hidden /> : null}
			<span>{children}</span>
		</button>
	);
}
