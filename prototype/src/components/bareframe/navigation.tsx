import { useState } from 'react';
import type { PreviewInteractionState } from '../library/types';
import { previewClassName, stateProps } from './utils';

export function Tabs({
	variant = 'line',
	defaultValue = 'overview',
	previewState = 'default',
}: {
	variant?: 'line' | 'pills';
	defaultValue?: string;
	previewState?: PreviewInteractionState;
}) {
	const items = [
		{ id: 'overview', label: 'Overview' },
		{ id: 'analytics', label: 'Analytics' },
		{ id: 'settings', label: 'Settings' },
	];
	const [active, setActive] = useState(defaultValue);
	return (
		<div className={previewClassName(`bf-tabs bf-tabs--${variant}`, previewState)}>
			<div role="tablist" aria-label="Demo tabs" className="bf-tabs__list">
				{items.map((item) => (
					<button
						key={item.id}
						type="button"
						role="tab"
						aria-selected={active === item.id}
						className={`bf-tabs__tab${active === item.id ? ' is-active' : ''}`}
						onClick={() => setActive(item.id)}
						{...stateProps(previewState)}
					>
						{item.label}
					</button>
				))}
			</div>
			<div role="tabpanel" className="bf-tabs__panel">
				Content for <strong>{active}</strong> tab.
			</div>
		</div>
	);
}

export function Breadcrumbs({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	return (
		<nav className={previewClassName('bf-breadcrumbs', previewState)} aria-label="Breadcrumb">
			<ol>
				<li><a href="#/">Home</a></li>
				<li><a href="#/components">Components</a></li>
				<li><span aria-current="page">Alert</span></li>
			</ol>
		</nav>
	);
}

export function Pagination({
	page = 2,
	total = 5,
	previewState = 'default',
}: {
	page?: number;
	total?: number;
	previewState?: PreviewInteractionState;
}) {
	return (
		<nav className={previewClassName('bf-pagination', previewState)} aria-label="Pagination">
			<button type="button" disabled={page <= 1} {...stateProps(previewState)}>Previous</button>
			{Array.from({ length: total }, (_, i) => i + 1).map((n) => (
				<button
					key={n}
					type="button"
					className={n === page ? 'is-active' : undefined}
					aria-current={n === page ? 'page' : undefined}
					{...stateProps(previewState)}
				>
					{n}
				</button>
			))}
			<button type="button" disabled={page >= total} {...stateProps(previewState)}>Next</button>
		</nav>
	);
}

export function Accordion({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	const [open, setOpen] = useState('item-1');
	return (
		<div className={previewClassName('bf-accordion', previewState)}>
			{[
				{ id: 'item-1', title: 'What are design tokens?', body: 'Tokens are named variables for color, spacing, and typography.' },
				{ id: 'item-2', title: 'How do themes work?', body: 'Themes override token values via CSS custom properties.' },
			].map((item) => {
				const expanded = open === item.id;
				return (
					<div key={item.id} className="bf-accordion__item">
						<button
							type="button"
							className="bf-accordion__trigger"
							aria-expanded={expanded}
							onClick={() => setOpen(expanded ? '' : item.id)}
							{...stateProps(previewState)}
						>
							{item.title}
						</button>
						{expanded ? (
							<div className="bf-accordion__panel" role="region">
								{item.body}
							</div>
						) : null}
					</div>
				);
			})}
		</div>
	);
}
