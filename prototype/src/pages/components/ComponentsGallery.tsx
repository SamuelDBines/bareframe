import { Link } from 'react-router-dom';
import { COMPONENT_LIBRARY } from '../../data/components';

export function ComponentsGallery() {
	return (
		<>
			<div className="page-hero">
				<h1>Component gallery</h1>
				<p className="lead">
					Preview @bareframe/react primitives with live theme switching and copy-ready snippets.
				</p>
			</div>
			<div className="grid-2">
				{COMPONENT_LIBRARY.map((c) => (
					<Link
						key={c.slug}
						to={`/components/${c.slug}`}
						className="card"
						style={{ textDecoration: 'none', color: 'inherit' }}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
							<h3>{c.name}</h3>
							<span className={`badge-pill ${c.status === 'stable' ? 'success' : c.status}`}>
								{c.status}
							</span>
						</div>
						<p style={{ marginBottom: 0 }}>{c.description}</p>
						<p style={{ marginTop: '0.75rem', fontSize: '0.8rem' }}>{c.category}</p>
					</Link>
				))}
			</div>
		</>
	);
}
