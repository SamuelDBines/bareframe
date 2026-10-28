import { forwardRef } from 'react';
import { cn } from './utils/cn';

export const Progress = forwardRef<
	HTMLDivElement,
	{
		value?: number;
		max?: number;
		label?: string;
		className?: string;
	}
>(function Progress({ value = 0, max = 100, label = 'Progress', className }, ref) {
	const pct = Math.round((value / max) * 100);
	return (
		<div ref={ref} className={cn('bf-progress', className)}>
			<div className="bf-progress__label">
				<span>{label}</span>
				<span>{pct}%</span>
			</div>
			<div
				className="bf-progress__track"
				role="progressbar"
				aria-valuenow={value}
				aria-valuemin={0}
				aria-valuemax={max}
			>
				<div className="bf-progress__bar" style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
});

export const Spinner = forwardRef<
	HTMLDivElement,
	{ size?: 'sm' | 'md' | 'lg'; label?: string; className?: string }
>(function Spinner({ size = 'md', label = 'Loading', className }, ref) {
	return (
		<div
			ref={ref}
			className={cn('bf-spinner', `bf-spinner--${size}`, className)}
			role="status"
			aria-label={label}
		>
			<span className="bf-spinner__ring" aria-hidden />
		</div>
	);
});

export function Skeleton({ lines = 3, className }: { lines?: number; className?: string }) {
	return (
		<div className={cn('bf-skeleton-stack', className)} aria-hidden>
			{Array.from({ length: lines }, (_, i) => (
				<div key={i} className="bf-skeleton" style={{ width: i === lines - 1 ? '70%' : '100%' }} />
			))}
		</div>
	);
}

export const Toast = forwardRef<
	HTMLDivElement,
	{ variant?: 'default' | 'success' | 'error'; children?: React.ReactNode; className?: string }
>(function Toast({ variant = 'default', children, className }, ref) {
	return (
		<div ref={ref} className={cn('bf-toast', `bf-toast--${variant}`, className)} role="status">
			{children}
		</div>
	);
});
