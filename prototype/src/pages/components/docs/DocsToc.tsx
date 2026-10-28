import { useEffect, useState } from 'react';

export type TocItem = { id: string; label: string; depth: 2 | 3 };

export function DocsToc({ items }: { items: TocItem[] }) {
	const [active, setActive] = useState(items[0]?.id ?? '');

	useEffect(() => {
		if (!items.length) return;
		const observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
				if (visible[0]?.target.id) setActive(visible[0].target.id);
			},
			{ rootMargin: '-20% 0px -55% 0px', threshold: 0.1 },
		);
		for (const item of items) {
			const el = document.getElementById(item.id);
			if (el) observer.observe(el);
		}
		return () => observer.disconnect();
	}, [items]);

	if (!items.length) return null;

	return (
		<aside className="docs-shell__toc" aria-label="On this page">
			<p className="docs-toc__title">On this page</p>
			<nav>
				{items.map((item) => (
					<a
						key={item.id}
						href={`#${item.id}`}
						className={`docs-toc__link${active === item.id ? ' is-active' : ''}`}
						data-depth={item.depth}
					>
						{item.label}
					</a>
				))}
			</nav>
		</aside>
	);
}
