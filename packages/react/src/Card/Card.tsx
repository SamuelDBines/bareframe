import { forwardRef, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export const Card = forwardRef<
	HTMLElement,
	{
		variant?: 'elevated' | 'outlined' | 'ghost';
		title?: string;
		footer?: ReactNode;
		className?: string;
		children?: ReactNode;
	}
>(function Card({ variant = 'outlined', title, footer, className, children }, ref) {
	return (
		<article ref={ref} className={cn('bf-card', `bf-card--${variant}`, className)}>
			{title ? (
				<header className="bf-card__header">
					<h3>{title}</h3>
				</header>
			) : null}
			<div className="bf-card__body">{children}</div>
			{footer ? <footer className="bf-card__footer">{footer}</footer> : null}
		</article>
	);
});

Card.displayName = 'Card';
