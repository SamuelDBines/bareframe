import { forwardRef, type ReactNode } from 'react';
import { cn } from './utils/cn';
import { Button } from './Button/Button';

export const Table = forwardRef<HTMLDivElement, { className?: string }>(function Table({ className }, ref) {
	return (
		<div ref={ref} className={cn('bf-table-wrap', className)}>
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
});

export const EmptyState = forwardRef<
	HTMLDivElement,
	{ title?: string; description?: string; actionLabel?: string; onAction?: () => void; className?: string }
>(function EmptyState(
	{
		title = 'No projects yet',
		description = 'Create your first project to see it here.',
		actionLabel = 'Create project',
		onAction,
		className,
	},
	ref,
) {
	return (
		<div ref={ref} className={cn('bf-empty', className)}>
			<div className="bf-empty__icon" aria-hidden>
				◇
			</div>
			<h3>{title}</h3>
			<p>{description}</p>
			<Button size="sm" onPress={onAction}>
				{actionLabel}
			</Button>
		</div>
	);
});

export const StatCard = forwardRef<
	HTMLDivElement,
	{ label?: string; value?: string; delta?: string; className?: string }
>(function StatCard({ label = 'Active users', value = '12.4k', delta = '+8.2%', className }, ref) {
	return (
		<div ref={ref} className={cn('bf-stat-card', className)}>
			<p className="bf-stat-card__label">{label}</p>
			<p className="bf-stat-card__value">{value}</p>
			<p className="bf-stat-card__delta">{delta}</p>
		</div>
	);
});

export const Avatar = forwardRef<
	HTMLSpanElement | HTMLImageElement,
	{ name?: string; size?: 'sm' | 'md' | 'lg'; src?: string; className?: string }
>(function Avatar({ name = 'Sam', size = 'md', src, className }, ref) {
	const initials = name
		.split(' ')
		.map((p) => p[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	if (src) {
		return (
			<img
				ref={ref as React.Ref<HTMLImageElement>}
				className={cn('bf-avatar', `bf-avatar--${size}`, className)}
				src={src}
				alt={name}
			/>
		);
	}
	return (
		<span
			ref={ref as React.Ref<HTMLSpanElement>}
			className={cn('bf-avatar', `bf-avatar--${size}`, className)}
			role="img"
			aria-label={name}
		>
			{initials}
		</span>
	);
});
