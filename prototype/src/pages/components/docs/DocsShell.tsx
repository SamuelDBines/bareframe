import { useCallback, useEffect, useLayoutEffect, useState, type ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Button } from '@bareframe/react';
import { CommandPalette, DocsSidebar } from './DocsSidebar';
import { DocsToc, type TocItem } from './DocsToc';

const TOC_EVENT = 'bareframe-docs-toc';

export function DocsShell() {
	const [navFilter, setNavFilter] = useState('');
	const [cmdOpen, setCmdOpen] = useState(false);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [tocItems, setTocItems] = useState<TocItem[]>([]);
	const location = useLocation();

	useEffect(() => {
		setSidebarOpen(false);
	}, [location.pathname]);

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				setCmdOpen(true);
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, []);

	useLayoutEffect(() => {
		const handler = (e: Event) => {
			const detail = (e as CustomEvent<TocItem[]>).detail;
			setTocItems(detail ?? []);
		};
		window.addEventListener(TOC_EVENT, handler);
		return () => window.removeEventListener(TOC_EVENT, handler);
	}, []);

	return (
		<div className="docs-shell">
			<CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
			<aside
				className={`docs-shell__sidebar${sidebarOpen ? ' is-open' : ''}`}
				id="docs-sidebar"
				aria-label="Component navigation"
			>
				<DocsSidebar filter={navFilter} onFilterChange={setNavFilter} />
			</aside>
			<div>
				<div className="docs-shell__mobile-bar">
					<Button variant="secondary" size="sm" onPress={() => setSidebarOpen((v) => !v)}>
						{sidebarOpen ? 'Close menu' : 'Browse'}
					</Button>
					<Button variant="ghost" size="sm" onPress={() => setCmdOpen(true)}>
						Search ⌘K
					</Button>
				</div>
				<main className="docs-shell__main" id="docs-main">
					<Outlet />
				</main>
			</div>
			<DocsToc items={tocItems} />
		</div>
	);
}

export function publishDocToc(items: TocItem[]) {
	window.dispatchEvent(new CustomEvent(TOC_EVENT, { detail: items }));
}

export function useDocPageToc(items: TocItem[]) {
	const key = items.map((i) => i.id).join('|');
	useLayoutEffect(() => {
		publishDocToc(items);
		return () => publishDocToc([]);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by section ids
	}, [key]);
	// Republish after DocsShell attaches its listener (child layout effects run before parent effects).
	useEffect(() => {
		publishDocToc(items);
		// eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by section ids
	}, [key]);
}

export function DocPageHeader({
	title,
	description,
	status,
	importName,
}: {
	title: string;
	description: string;
	status: string;
	importName: string;
}) {
	const [copied, setCopied] = useState(false);
	const sourceUrl = `https://github.com/SamuelDBines/bareframe/tree/main/packages/react/src`;
	const importLine = `import { ${importName} } from '@bareframe/react';`;

	const copyImport = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(importLine);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	}, [importLine]);

	return (
		<header className="doc-page-header">
			<div className="doc-page-header__top">
				<div>
					<h1>{title}</h1>
					<p className="doc-page-header__lead">{description}</p>
				</div>
				<div className="doc-page-header__actions">
					<span className={`doc-status doc-status--${status === 'stable' ? 'stable' : 'beta'}`}>{status}</span>
					<a className="doc-ghost-btn" href={sourceUrl} target="_blank" rel="noreferrer">
						Source
					</a>
					<button type="button" className="doc-ghost-btn" onClick={copyImport}>
						{copied ? 'Copied' : 'Copy import'}
					</button>
				</div>
			</div>
		</header>
	);
}

export function DocSection({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section className="doc-anchor-section" id={id}>
			<h2 className="doc-section-title">{title}</h2>
			{children}
		</section>
	);
}
