import { Link } from 'react-router-dom';
import { Alert } from '../../components/bareframe/Alert';
import { Button } from '../../components/bareframe/Button';
import { COMPONENT_LIBRARY } from '../../data/components';
import { THEME_LABELS, type ThemeId } from '../../theme/themes';

const THEME_COMPARE: ThemeId[] = ['light', 'dark', 'aurora', 'noir'];

export function ComponentsGallery() {
	const stable = COMPONENT_LIBRARY.filter((c) => c.status === 'stable');

	return (
		<>
			<div className="page-hero">
				<h1>Component gallery</h1>
				<p className="lead">
					Preview @bareframe/react primitives with live playgrounds, theme switching, and copy-ready snippets.
				</p>
			</div>

			<section className="gallery-theme-matrix card">
				<h2>Across themes</h2>
				<p style={{ margin: 0, color: 'var(--bf-theme-text-2)', fontSize: '0.9rem' }}>
					Primary button and alert surfaces on a few theme presets — open any component for the full playground.
				</p>
				<div className="gallery-theme-row">
					{THEME_COMPARE.map((themeId) => (
						<div key={themeId} className="gallery-theme-cell" data-bf-theme={themeId}>
							<span className="gallery-theme-cell__label">{THEME_LABELS[themeId]}</span>
							<Button size="sm" variant="primary">Action</Button>
							<Alert variant="info" title="Note" dismissible={false}>
								Token-driven UI
							</Alert>
						</div>
					))}
				</div>
			</section>

			<div className="grid-2" style={{ marginTop: '1.5rem' }}>
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

			<p className="footer-note">
				{stable.length} stable components · {COMPONENT_LIBRARY.length} documented total
			</p>
		</>
	);
}
