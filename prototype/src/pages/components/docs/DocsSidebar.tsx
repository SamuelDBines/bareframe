import { useEffect, useMemo, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { COMPONENT_REGISTRY } from '../../../components/library/registry';
import './docs.css';

const UTILITY_LINKS = [
	{ to: '/components/start', label: 'Get started' },
	{ to: '/components/migrating', label: 'Migrating from Repkit' },
	{ to: '/components', label: 'Components', end: true },
	{ to: '/components/tokens', label: 'Tokens' },
	{ to: '/components/mcp', label: 'Connect agent' },
] as const;

export function DocsSidebar({
	filter,
	onFilterChange,
}: {
	filter: string;
	onFilterChange: (value: string) => void;
}) {
	const grouped = useMemo(() => {
		const q = filter.trim().toLowerCase();
		const items = COMPONENT_REGISTRY.filter(
			(c) =>
				!q ||
				c.name.toLowerCase().includes(q) ||
				c.slug.includes(q) ||
				c.category.toLowerCase().includes(q),
		);
		const map = new Map<string, typeof items>();
		for (const item of items) {
			const list = map.get(item.category) ?? [];
			list.push(item);
			map.set(item.category, list);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [filter]);

	return (
		<>
			<div className="docs-nav__brand">
				<input
					type="search"
					className="docs-nav__search"
					placeholder="Filter components…"
					value={filter}
					onChange={(e) => onFilterChange(e.target.value)}
					aria-label="Filter components"
				/>
				<div className="docs-nav__hint">
					<span>Quick open</span>
					<kbd>⌘K</kbd>
				</div>
			</div>
			<nav className="docs-nav__utility">
				{UTILITY_LINKS.map((link) => (
					<NavLink
						key={link.to}
						to={link.to}
						end={'end' in link ? link.end : false}
						className={({ isActive }) => `docs-nav__link${isActive ? ' is-active' : ''}`}
					>
						{link.label}
					</NavLink>
				))}
			</nav>
			{grouped.map(([category, items]) => (
				<div key={category} className="docs-nav__section">
					<div className="docs-nav__section-title">{category}</div>
					{items.map((item) => (
						<NavLink
							key={item.slug}
							to={`/components/${item.slug}`}
							className={({ isActive }) => `docs-nav__link${isActive ? ' is-active' : ''}`}
						>
							{item.name}
						</NavLink>
					))}
				</div>
			))}
		</>
	);
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
	const navigate = useNavigate();
	const [query, setQuery] = useState('');
	const [selected, setSelected] = useState(0);

	const results = useMemo(() => {
		const q = query.trim().toLowerCase();
		const pool = [
			...UTILITY_LINKS.map((l) => ({ slug: l.to, name: l.label, category: 'Pages' })),
			...COMPONENT_REGISTRY.map((c) => ({ slug: `/components/${c.slug}`, name: c.name, category: c.category })),
		];
		if (!q) return pool.slice(0, 12);
		return pool
			.filter(
				(p) =>
					p.name.toLowerCase().includes(q) ||
					p.slug.toLowerCase().includes(q) ||
					p.category.toLowerCase().includes(q),
			)
			.slice(0, 12);
	}, [query]);

	useEffect(() => {
		if (!open) {
			setQuery('');
			setSelected(0);
		}
	}, [open]);

	useEffect(() => {
		setSelected(0);
	}, [query]);

	if (!open) return null;

	const choose = (path: string) => {
		onClose();
		navigate(path);
	};

	return (
		<div
			className="docs-cmd-overlay"
			role="presentation"
			onClick={onClose}
			onKeyDown={(e) => e.key === 'Escape' && onClose()}
		>
			<div
				className="docs-cmd"
				role="dialog"
				aria-modal="true"
				aria-label="Quick search"
				onClick={(e) => e.stopPropagation()}
			>
				<input
					autoFocus
					placeholder="Search components and pages…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === 'ArrowDown') {
							e.preventDefault();
							setSelected((i) => Math.min(i + 1, results.length - 1));
						}
						if (e.key === 'ArrowUp') {
							e.preventDefault();
							setSelected((i) => Math.max(i - 1, 0));
						}
						if (e.key === 'Enter' && results[selected]) {
							e.preventDefault();
							choose(results[selected].slug);
						}
					}}
				/>
				<div className="docs-cmd__list" role="listbox">
					{results.map((row, i) => (
						<button
							key={row.slug}
							type="button"
							className={`docs-cmd__item${i === selected ? ' is-selected' : ''}`}
							role="option"
							aria-selected={i === selected}
							onClick={() => choose(row.slug)}
						>
							<span>{row.name}</span>
							<span className="docs-cmd__meta">{row.category}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
}
