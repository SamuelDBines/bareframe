import { forwardRef, type ReactNode } from 'react';
import { Button as RACButton, type ButtonProps as RACButtonProps } from 'react-aria-components';
import { cn } from '../utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<RACButtonProps, 'className'> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	loading?: boolean;
	className?: string;
	children?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
	{
		variant = 'primary',
		size = 'md',
		loading = false,
		className,
		children,
		isDisabled,
		...props
	},
	ref,
) {
	return (
		<RACButton
			ref={ref}
			className={cn('btn', 'bf-btn', `bf-btn--${variant}`, `bf-btn--${size}`, className)}
			isDisabled={isDisabled || loading}
			aria-busy={loading || undefined}
			{...props}
		>
			{loading ? <span className="bf-btn__spinner" aria-hidden /> : null}
			{children}
		</RACButton>
	);
});

Button.displayName = 'Button';
