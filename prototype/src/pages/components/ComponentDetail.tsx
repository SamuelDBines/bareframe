import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getRegistryEntry } from '../../components/library/registry';
import { DocPageHeader, DocSection, useDocPageToc } from './docs/DocsShell';
import { ComponentDocPage } from './ComponentDocPage';

export function ComponentDetailPage() {
	const { slug = '' } = useParams();
	const entry = getRegistryEntry(slug);

	const toc = useMemo(() => {
		if (!entry) return [];
		const items = [
			{ id: 'overview', label: 'Overview', depth: 2 as const },
			{ id: 'playground', label: 'Playground', depth: 2 as const },
		];
		if (entry.docExamples?.length) items.push({ id: 'examples', label: 'Examples', depth: 2 as const });
		items.push(
			{ id: 'props', label: 'Props', depth: 2 as const },
			{ id: 'accessibility', label: 'Accessibility', depth: 2 as const },
		);
		if (entry.dosDonts?.length) items.push({ id: 'guidelines', label: 'Guidelines', depth: 2 as const });
		if (entry.themeTokens?.length) items.push({ id: 'tokens', label: 'Tokens', depth: 2 as const });
		return items;
	}, [entry]);

	useDocPageToc(toc);

	if (!entry) {
		return (
			<div className="doc-prose">
				<h1>Component not found</h1>
				<Link to="/components">Back to components</Link>
			</div>
		);
	}

	const importName = entry.importName ?? entry.name.replace(/\s+/g, '');

	return (
		<>
			<DocPageHeader
				title={entry.name}
				description={entry.description}
				status={entry.status}
				importName={importName}
			/>

			<ComponentDocPage entry={entry} />

			<DocSection id="props" title="Props">
				<div className="doc-table-wrap">
					<table className="doc-props-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Type</th>
								<th>Default</th>
								<th>Description</th>
							</tr>
						</thead>
						<tbody>
							{entry.props.map((p) => (
								<tr key={p.name}>
									<td>
										<code>{p.name}</code>
									</td>
									<td>
										<code>{p.type}</code>
									</td>
									<td>{p.default ?? '—'}</td>
									<td>{p.description || '—'}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</DocSection>

			<DocSection id="accessibility" title="Accessibility">
				<div className="doc-prose">
					<p>{entry.a11y.summary}</p>
					{entry.a11y.roles?.length ? (
						<p>
							<strong>Roles:</strong> {entry.a11y.roles.join(', ')}
						</p>
					) : null}
					{entry.a11y.keyboard?.length ? (
						<>
							<h3 className="doc-section-title" style={{ fontSize: '0.95rem' }}>
								Keyboard
							</h3>
							<ul>
								{entry.a11y.keyboard.map((k) => (
									<li key={k}>{k}</li>
								))}
							</ul>
						</>
					) : null}
				</div>
			</DocSection>
		</>
	);
}
