import { forwardRef, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export const Badge = forwardRef<
	HTMLSpanElement,
	{
		variant?: 'default' | 'success' | 'warning' | 'outline' | 'error';
		size?: 'sm' | 'md';
		className?: string;
		children?: ReactNode;
	}
>(function Badge({ variant = 'default', size = 'md', className, children }, ref) {
	return (
		<span ref={ref} className={cn('bf-badge', `bf-badge--${variant}`, `bf-badge--${size}`, className)}>
			{children}
		</span>
	);
});

Badge.displayName = 'Badge';
