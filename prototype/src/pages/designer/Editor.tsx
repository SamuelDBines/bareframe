import { Link } from 'react-router-dom';

const PALETTE = ['Button', 'Card', 'Input', 'Tabs', 'Modal', 'Toast', 'Badge', 'Select'];

export function DesignerEditor() {
	return (
		<div className="designer-workspace">
			<aside className="designer-panel designer-panel-left">
				<h3>Components</h3>
				<ul className="palette-list">
					{PALETTE.map((name) => (
						<li key={name}>
							<button type="button" className="palette-item">{name}</button>
						</li>
					))}
				</ul>
				<p className="panel-hint">
					<Link to="/components">Browse full library →</Link>
				</p>
			</aside>

			<section className="designer-canvas" aria-label="Canvas">
				<div className="canvas-toolbar">
					<span>Home · Dashboard</span>
					<div style={{ display: 'flex', gap: '0.5rem' }}>
						<Link to="/designer/export" className="btn btn-ghost" style={{ padding: '0.35rem 0.65rem' }}>
							Export
						</Link>
						<button type="button" className="btn btn-primary" style={{ padding: '0.35rem 0.65rem' }}>
							Preview
						</button>
					</div>
				</div>
				<div className="canvas-frame">
					<header className="mock-app-header">
						<strong>Acme Analytics</strong>
						<span className="badge-pill">Live</span>
					</header>
					<div className="mock-app-body">
						<div className="card" style={{ flex: 1 }}>
							<h3>Weekly signups</h3>
							<div className="mock-chart" />
						</div>
						<div className="card" style={{ width: 220 }}>
							<h3>Filters</h3>
							<div className="field">
								<label>Region</label>
								<input readOnly value="North America" />
							</div>
							<button type="button" className="btn btn-primary" style={{ width: '100%' }}>
								Apply
							</button>
						</div>
					</div>
				</div>
			</section>

			<aside className="designer-panel designer-panel-right">
				<h3>Properties</h3>
				<div className="field">
					<label>Selected</label>
					<input readOnly value="Card / Weekly signups" />
				</div>
				<div className="field">
					<label>Padding</label>
					<input readOnly value="1.25rem" />
				</div>
				<h3 style={{ marginTop: '1.25rem' }}>Theme</h3>
				<p className="panel-hint">Uses global Bareframe theme from the header switcher.</p>
				<Link to="/designer/theme" className="btn btn-secondary" style={{ width: '100%' }}>
					Edit theme
				</Link>
			</aside>

			<aside className="designer-panel designer-panel-chat">
				<h3>AI assistant</h3>
				<div className="chat-thread">
					<div className="chat-bubble chat-user">Add a toast when filters apply.</div>
					<div className="chat-bubble chat-agent">
						Added a Toast below the Apply button using your active theme tokens.
					</div>
				</div>
				<div className="field">
					<input placeholder="Ask Bareframe to edit this screen…" />
				</div>
			</aside>
		</div>
	);
}
