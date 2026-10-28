import { Link, useParams } from 'react-router-dom';
import { getRegistryEntry } from '../../components/library/registry';
import { ComponentDocPage, VariantThemeMatrix } from './ComponentDocPage';

export function ComponentDetailPage() {
	const { slug = '' } = useParams();
	const entry = getRegistryEntry(slug);

	if (!entry) {
		return (
			<div className="card">
				<h2>Component not found</h2>
				<Link to="/components">← Back to gallery</Link>
			</div>
		);
	}

	return (
		<>
			<p>
				<Link to="/components">← Gallery</Link>
			</p>
			<div className="page-hero">
				<h1>{entry.name}</h1>
				<p className="lead">{entry.description}</p>
				<span className={`badge-pill ${entry.status === 'stable' ? 'success' : entry.status}`}>
					{entry.status}
				</span>
			</div>

			<ComponentDocPage entry={entry} />
			<VariantThemeMatrix entry={entry} />

			<section className="doc-section">
				<h2>Props</h2>
				<div className="table-wrap">
					<table className="props-table">
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
									<td><code>{p.name}</code></td>
									<td><code>{p.type}</code></td>
									<td>{p.default ?? '—'}</td>
									<td>{p.description}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</section>

			<section className="doc-section">
				<h2>Accessibility</h2>
				<p>{entry.a11y.summary}</p>
				{entry.a11y.roles?.length ? <p><strong>Roles:</strong> {entry.a11y.roles.join(', ')}</p> : null}
				{entry.a11y.keyboard?.length ? (
					<>
						<h3>Keyboard</h3>
						<ul>
							{entry.a11y.keyboard.map((k) => (
								<li key={k}>{k}</li>
							))}
						</ul>
					</>
				) : null}
			</section>
		</>
	);
}
