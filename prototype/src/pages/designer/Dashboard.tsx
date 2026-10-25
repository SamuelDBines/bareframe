import { Link } from 'react-router-dom';
import { MOCK_PROJECTS } from '../../data/projects';

export function DesignerDashboard() {
	return (
		<>
			<div className="page-hero" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
				<div style={{ flex: 1 }}>
					<h1>Projects</h1>
					<p className="lead">
						Open the canvas to pan/zoom across device frames, compare themes, and edit the shared page tree.
					</p>
				</div>
				<Link to="/designer/editor" className="btn btn-primary">Open canvas</Link>
			</div>
			<div className="grid-2">
				{MOCK_PROJECTS.map((p) => (
					<article key={p.id} className="card">
						<h3>{p.name}</h3>
						<p>
							{p.screens} screens · Theme <code>{p.theme}</code> · Updated {p.updatedAt}
						</p>
						<p style={{ fontSize: '0.85rem' }}>
							<span className="badge-pill">iPhone 15</span>
							<span className="badge-pill" style={{ marginLeft: '0.35rem' }}>iPad Mini</span>
							<span className="badge-pill" style={{ marginLeft: '0.35rem' }}>Desktop 1440</span>
						</p>
						<Link to="/designer/editor" className="btn btn-secondary">Open in canvas</Link>
					</article>
				))}
			</div>
		</>
	);
}
