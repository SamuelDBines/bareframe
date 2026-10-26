import { Link, useParams } from 'react-router-dom';
import { getRegistryEntry } from '../../components/library/registry';
import { ComponentPlayground } from './ComponentPlayground';

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

			<ComponentPlayground entry={entry} />

			<section style={{ marginTop: '2rem' }}>
				<h2>Props</h2>
				<div className="table-wrap" style={{ marginTop: '0.75rem' }}>
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
		</>
	);
}
