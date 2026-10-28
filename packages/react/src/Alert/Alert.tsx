import { forwardRef, useState, type ReactNode } from 'react';
import { cn } from '../utils/cn';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export type AlertProps = {
	variant?: AlertVariant;
	title?: string;
	children?: ReactNode;
	dismissible?: boolean;
	defaultVisible?: boolean;
	visible?: boolean;
	onDismiss?: () => void;
	className?: string;
	style?: React.CSSProperties;
	action?: ReactNode;
};

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
	{
		variant = 'info',
		title,
		children,
		dismissible = false,
		defaultVisible = true,
		visible,
		onDismiss,
		className,
		style,
		action,
	},
	ref,
) {
	const [internalVisible, setInternalVisible] = useState(defaultVisible);
	const isControlled = visible !== undefined;
	const shown = isControlled ? visible : internalVisible;

	if (!shown) return null;

	const dismiss = () => {
		if (!isControlled) setInternalVisible(false);
		onDismiss?.();
	};

	return (
		<div
			ref={ref}
			role="alert"
			className={cn('bf-alert', `bf-alert--${variant}`, className)}
			style={style}
		>
			<div className="bf-alert__body">
				{title ? <strong className="bf-alert__title">{title}</strong> : null}
				{children ? <p className="bf-alert__message">{children}</p> : null}
				{action ? <div className="bf-alert__action">{action}</div> : null}
			</div>
			{dismissible ? (
				<button type="button" className="bf-alert__dismiss" aria-label="Dismiss alert" onClick={dismiss}>
					×
				</button>
			) : null}
		</div>
	);
});

Alert.displayName = 'Alert';
