import type { PreviewInteractionState } from '../library/types';
import { previewClassName } from './utils';
import { Button } from './Button';

export function Table({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	return (
		<div className={previewClassName('bf-table-wrap', previewState)}>
			<table className="bf-table">
				<thead>
					<tr>
						<th scope="col">Name</th>
						<th scope="col">Role</th>
						<th scope="col">Status</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Ava Chen</td>
						<td>Designer</td>
						<td>Active</td>
					</tr>
					<tr>
						<td>Jordan Lee</td>
						<td>Engineer</td>
						<td>Active</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
}

export function EmptyState({
	title = 'No projects yet',
	description = 'Create your first project to see it here.',
	previewState = 'default',
}: {
	title?: string;
	description?: string;
	previewState?: PreviewInteractionState;
}) {
	return (
		<div className={previewClassName('bf-empty', previewState)}>
			<div className="bf-empty__icon" aria-hidden>◇</div>
			<h3>{title}</h3>
			<p>{description}</p>
			<Button size="sm" previewState={previewState}>Create project</Button>
		</div>
	);
}

export function StatCard({
	label = 'Active users',
	value = '12.4k',
	delta = '+8.2%',
	previewState = 'default',
}: {
	label?: string;
	value?: string;
	delta?: string;
	previewState?: PreviewInteractionState;
}) {
	return (
		<div className={previewClassName('bf-stat-card', previewState)}>
			<p className="bf-stat-card__label">{label}</p>
			<p className="bf-stat-card__value">{value}</p>
			<p className="bf-stat-card__delta">{delta}</p>
		</div>
	);
}

export function Avatar({
	name = 'Sam',
	size = 'md',
	src,
	previewState = 'default',
}: {
	name?: string;
	size?: 'sm' | 'md' | 'lg';
	src?: string;
	previewState?: PreviewInteractionState;
}) {
	const initials = name
		.split(' ')
		.map((p) => p[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	return src ? (
		<img
			className={previewClassName(`bf-avatar bf-avatar--${size}`, previewState)}
			src={src}
			alt={name}
		/>
	) : (
		<span
			className={previewClassName(`bf-avatar bf-avatar--${size}`, previewState)}
			role="img"
			aria-label={name}
		>
			{initials}
		</span>
	);
}

export function CalendarPlaceholder({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	return (
		<div className={previewClassName('bf-calendar', previewState)} role="application" aria-label="Calendar preview">
			<div className="bf-calendar__header">
				<button type="button" aria-label="Previous month">‹</button>
				<strong>October 2026</strong>
				<button type="button" aria-label="Next month">›</button>
			</div>
			<div className="bf-calendar__grid" role="grid">
				{['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
					<span key={d} className="bf-calendar__dow">{d}</span>
				))}
				{Array.from({ length: 35 }, (_, i) => (
					<button
						key={i}
						type="button"
						className={`bf-calendar__day${i === 15 ? ' is-selected' : ''}${i < 2 ? ' is-muted' : ''}`}
					>
						{i < 2 ? '' : i - 1}
					</button>
				))}
			</div>
			<p className="bf-muted">React Aria calendar integration planned — grid preview uses theme tokens.</p>
		</div>
	);
}

export function DatePickerPlaceholder({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	return (
		<div className={previewClassName('bf-datepicker', previewState)}>
			<label className="bf-field__label">Date</label>
			<input className="bf-input" readOnly value="Oct 26, 2026" aria-haspopup="dialog" />
			<div className="bf-datepicker__popover">
				<CalendarPlaceholder previewState={previewState} />
			</div>
		</div>
	);
}
