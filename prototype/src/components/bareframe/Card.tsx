import type { PreviewInteractionState } from '../library/types';
import { previewClassName } from './utils';

export type CardVariant = 'elevated' | 'outlined' | 'ghost';

export type CardProps = {
	variant?: CardVariant;
	title?: string;
	footer?: string;
	children?: React.ReactNode;
	previewState?: PreviewInteractionState;
};

export function Card({
	variant = 'outlined',
	title = 'Card title',
	footer,
	children = 'Grouped content with optional header and footer.',
	previewState = 'default',
}: CardProps) {
	return (
		<article className={previewClassName(`bf-card bf-card--${variant}`, previewState)}>
			{title ? <header className="bf-card__header"><h3>{title}</h3></header> : null}
			<div className="bf-card__body">{children}</div>
			{footer ? <footer className="bf-card__footer">{footer}</footer> : null}
		</article>
	);
}
