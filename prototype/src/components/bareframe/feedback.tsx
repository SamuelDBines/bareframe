import type { PreviewInteractionState } from '../library/types';
import { previewClassName } from './utils';

export function Progress({
	value = 45,
	max = 100,
	label = 'Uploading',
	previewState = 'default',
}: {
	value?: number;
	max?: number;
	label?: string;
	previewState?: PreviewInteractionState;
}) {
	const pct = Math.round((value / max) * 100);
	return (
		<div className={previewClassName('bf-progress', previewState)}>
			<div className="bf-progress__label">
				<span>{label}</span>
				<span>{pct}%</span>
			</div>
			<div className="bf-progress__track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
				<div className="bf-progress__bar" style={{ width: `${pct}%` }} />
			</div>
		</div>
	);
}

export function Spinner({
	size = 'md',
	label = 'Loading',
	previewState = 'default',
}: {
	size?: 'sm' | 'md' | 'lg';
	label?: string;
	previewState?: PreviewInteractionState;
}) {
	return (
		<div className={previewClassName(`bf-spinner bf-spinner--${size}`, previewState)} role="status" aria-label={label}>
			<span className="bf-spinner__ring" aria-hidden />
		</div>
	);
}

export function Skeleton({
	lines = 3,
	previewState = 'default',
}: {
	lines?: number;
	previewState?: PreviewInteractionState;
}) {
	return (
		<div className={previewClassName('bf-skeleton-stack', previewState)} aria-hidden>
			{Array.from({ length: lines }, (_, i) => (
				<div key={i} className="bf-skeleton" style={{ width: i === lines - 1 ? '70%' : '100%' }} />
			))}
		</div>
	);
}

export function Toast({
	variant = 'default',
	message = 'Changes saved',
	previewState = 'default',
}: {
	variant?: 'default' | 'success' | 'error';
	message?: string;
	previewState?: PreviewInteractionState;
}) {
	return (
		<div className={previewClassName(`bf-toast bf-toast--${variant}`, previewState)} role="status">
			{message}
		</div>
	);
}
