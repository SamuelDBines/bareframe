import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { COMPONENT_REGISTRY } from '../../components/library/registry';
import { useDocPageToc } from './docs/DocsShell';

const DEMO_OPTIONS = [{ value: 'a', label: 'Option A' }];

function galleryPreviewProps(entry: (typeof COMPONENT_REGISTRY)[number]) {
	const props: Record<string, unknown> = { ...entry.defaultProps };
	if (['select', 'combobox', 'multiselect', 'native-select'].includes(entry.slug)) {
		props.options = props.options ?? DEMO_OPTIONS;
		props['aria-label'] = entry.name;
	}
	if (entry.slug === 'calendar' || entry.slug === 'datepicker') {
		props.label = props.label ?? entry.name;
	}
	return props;
}

const CATEGORIES = [...new Set(COMPONENT_REGISTRY.map((c) => c.category))].sort();

export function ComponentsGallery() {
	const [query, setQuery] = useState('');
	const [category, setCategory] = useState<string>('All');

	useDocPageToc([{ id: 'components-index', label: 'Browse', depth: 2 }]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return COMPONENT_REGISTRY.filter((c) => {
			if (category !== 'All' && c.category !== category) return false;
			if (!q) return true;
			return (
				c.name.toLowerCase().includes(q) ||
				c.slug.includes(q) ||
				c.description.toLowerCase().includes(q)
			);
		});
	}, [query, category]);

	const stableCount = COMPONENT_REGISTRY.filter((c) => c.status === 'stable').length;

	return (
		<div id="components-index">
			<header className="doc-page-header">
				<h1>Components</h1>
				<p className="doc-page-header__lead">
					Accessible React primitives with live previews, token-driven themes, and copy-ready snippets.
				</p>
				<p className="doc-prose" style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--bf-theme-text-2)' }}>
					{stableCount} stable · {COMPONENT_REGISTRY.length} documented
				</p>
			</header>

			<div className="docs-index-toolbar">
				<input
					type="search"
					className="docs-index-search"
					placeholder="Search components…"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					aria-label="Search components"
				/>
				<div className="docs-filter-chips" role="group" aria-label="Filter by category">
					<button
						type="button"
						className={`docs-filter-chip${category === 'All' ? ' is-active' : ''}`}
						onClick={() => setCategory('All')}
					>
						All
					</button>
					{CATEGORIES.map((cat) => (
						<button
							key={cat}
							type="button"
							className={`docs-filter-chip${category === cat ? ' is-active' : ''}`}
							onClick={() => setCategory(cat)}
						>
							{cat}
						</button>
					))}
				</div>
			</div>

			<div className="docs-gallery-grid">
				{filtered.map((entry) => (
					<Link key={entry.slug} to={`/components/${entry.slug}`} className="docs-gallery-card">
						<div className="docs-gallery-card__preview" data-bf-theme="light">
							<div className="bf-docs-preview">{entry.render(galleryPreviewProps(entry))}</div>
						</div>
						<div className="docs-gallery-card__body">
							<div className="docs-gallery-card__row">
								<h3>{entry.name}</h3>
								<span className={`doc-status doc-status--${entry.status === 'stable' ? 'stable' : 'beta'}`}>
									{entry.status}
								</span>
							</div>
							<p>{entry.description}</p>
						</div>
					</Link>
				))}
			</div>
			{filtered.length === 0 ? (
				<p className="doc-prose" style={{ marginTop: '1.5rem' }}>
					No components match your search.
				</p>
			) : null}
		</div>
	);
}
