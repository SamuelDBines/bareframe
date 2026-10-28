import { forwardRef, useState } from 'react';
import { cn } from './utils/cn';
import { Button } from './Button/Button';

export const Tabs = forwardRef<
	HTMLDivElement,
	{
		variant?: 'line' | 'pills';
		defaultValue?: string;
		value?: string;
		onChange?: (value: string) => void;
		items?: { id: string; label: string; content?: React.ReactNode }[];
		className?: string;
	}
>(function Tabs(
	{
		variant = 'line',
		defaultValue = 'overview',
		value,
		onChange,
		items = [
			{ id: 'overview', label: 'Overview', content: 'Overview panel content.' },
			{ id: 'analytics', label: 'Analytics', content: 'Analytics panel content.' },
			{ id: 'settings', label: 'Settings', content: 'Settings panel content.' },
		],
		className,
	},
	ref,
) {
	const [internal, setInternal] = useState(defaultValue);
	const active = value ?? internal;
	const setActive = (id: string) => {
		if (value === undefined) setInternal(id);
		onChange?.(id);
	};
	const panel = items.find((i) => i.id === active);
	return (
		<div ref={ref} className={cn('bf-tabs', `bf-tabs--${variant}`, className)}>
			<div role="tablist" aria-label="Tabs" className="bf-tabs__list">
				{items.map((item) => (
					<button
						key={item.id}
						type="button"
						role="tab"
						aria-selected={active === item.id}
						className={cn('bf-tabs__tab', active === item.id && 'is-active')}
						onClick={() => setActive(item.id)}
					>
						{item.label}
					</button>
				))}
			</div>
			<div role="tabpanel" className="bf-tabs__panel">
				{panel?.content ?? `Content for ${active}`}
			</div>
		</div>
	);
});

export const Breadcrumbs = forwardRef<
	HTMLElement,
	{ items?: { href?: string; label: string }[]; className?: string }
>(function Breadcrumbs({ items, className }, ref) {
	const crumbs = items ?? [
		{ href: '/', label: 'Home' },
		{ href: '/components', label: 'Components' },
		{ label: 'Alert' },
	];
	return (
		<nav ref={ref} className={cn('bf-breadcrumbs', className)} aria-label="Breadcrumb">
			<ol>
				{crumbs.map((c, i) => (
					<li key={`${c.label}-${i}`}>
						{c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
					</li>
				))}
			</ol>
		</nav>
	);
});

export const Pagination = forwardRef<
	HTMLElement,
	{ page?: number; total?: number; onPageChange?: (page: number) => void; className?: string }
>(function Pagination({ page = 1, total = 5, onPageChange, className }, ref) {
	return (
		<nav ref={ref} className={cn('bf-pagination', className)} aria-label="Pagination">
			<Button variant="secondary" size="sm" isDisabled={page <= 1} onPress={() => onPageChange?.(page - 1)}>
				Previous
			</Button>
			{Array.from({ length: total }, (_, i) => i + 1).map((n) => (
				<Button
					key={n}
					variant={n === page ? 'primary' : 'secondary'}
					size="sm"
					aria-current={n === page ? 'page' : undefined}
					onPress={() => onPageChange?.(n)}
				>
					{n}
				</Button>
			))}
			<Button variant="secondary" size="sm" isDisabled={page >= total} onPress={() => onPageChange?.(page + 1)}>
				Next
			</Button>
		</nav>
	);
});

export const Accordion = forwardRef<
	HTMLDivElement,
	{ items?: { id: string; title: string; content: React.ReactNode }[]; className?: string }
>(function Accordion({ items, className }, ref) {
	const data = items ?? [
		{ id: '1', title: 'What are design tokens?', content: 'Named variables for color, spacing, and typography.' },
		{ id: '2', title: 'How do themes work?', content: 'Themes override CSS custom properties on `[data-bf-theme]`.' },
	];
	const [open, setOpen] = useState(data[0]?.id ?? '');
	return (
		<div ref={ref} className={cn('bf-accordion', className)}>
			{data.map((item) => {
				const expanded = open === item.id;
				return (
					<div key={item.id} className="bf-accordion__item">
						<button
							type="button"
							className="bf-accordion__trigger"
							aria-expanded={expanded}
							onClick={() => setOpen(expanded ? '' : item.id)}
						>
							{item.title}
						</button>
						{expanded ? (
							<div className="bf-accordion__panel" role="region">
								{item.content}
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
});
