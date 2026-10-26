import type { ReactNode } from 'react';
import type { PreviewInteractionState } from '../library/types';
import { previewClassName, stateProps } from './utils';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export type AlertProps = {
	variant?: AlertVariant;
	title?: string;
	children?: ReactNode;
	dismissible?: boolean;
	onDismiss?: () => void;
	previewState?: PreviewInteractionState;
};

export function Alert({
	variant = 'info',
	title,
	children = 'Your theme variables drive alert surfaces too.',
	dismissible,
	onDismiss,
	previewState = 'default',
}: AlertProps) {
	const showDismiss = dismissible || previewState === 'dismiss';
	return (
		<div
			role="alert"
			className={previewClassName(`bf-alert bf-alert--${variant}`, previewState)}
			{...stateProps(previewState)}
		>
			<div className="bf-alert__body">
				{title ? <strong className="bf-alert__title">{title}</strong> : null}
				<p className="bf-alert__message">{children}</p>
			</div>
			{showDismiss ? (
				<button
					type="button"
					className="bf-alert__dismiss"
					aria-label="Dismiss alert"
					onClick={onDismiss}
				>
					×
				</button>
			) : null}
		</div>
	);
}
