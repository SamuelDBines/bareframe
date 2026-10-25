import { Link } from 'react-router-dom';
import { MOCK_PROJECTS } from '../../data/projects';

export function DesignerDashboard() {
	return (
		<>
			<div className="page-hero" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end' }}>
				<div style={{ flex: 1 }}>
					<h1>Projects</h1>
					<p className="lead">Your workspaces — open the editor to compose screens with real components.</p>
				</div>
				<Link to="/designer/editor" className="btn btn-primary">New screen</Link>
			</div>
			<div className="grid-2">
				{MOCK_PROJECTS.map((p) => (
					<article key={p.id} className="card">
						<h3>{p.name}</h3>
						<p>
							{p.screens} screens · Theme <code>{p.theme}</code> · Updated {p.updatedAt}
						</p>
						<Link to="/designer/editor" className="btn btn-secondary">Open in editor</Link>
					</article>
				))}
			</div>
		</>
	);
}
