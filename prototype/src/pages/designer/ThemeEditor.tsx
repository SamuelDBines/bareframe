import { useTheme } from '../../theme/ThemeContext';
import { THEME_IDS, THEME_LABELS } from '../../theme/themes';

export function ThemeEditorPage() {
	const { theme, setTheme } = useTheme();

	return (
		<div className="designer-split">
			<div className="designer-split-main">
				<div className="page-hero">
					<h1>Theme editor</h1>
					<p className="lead">Adjust brand colors — preview updates instantly across Designer.</p>
				</div>
				<div className="card form-stack" style={{ maxWidth: 480 }}>
					<div className="field">
						<label htmlFor="base-theme">Base theme</label>
						<select
							id="base-theme"
							className="theme-select"
							value={theme}
							onChange={(e) => setTheme(e.target.value as typeof theme)}
						>
							{THEME_IDS.map((id) => (
								<option key={id} value={id}>{THEME_LABELS[id]}</option>
							))}
						</select>
					</div>
					<div className="field">
						<label>Primary</label>
						<input readOnly value="var(--bf-theme-button-primary-bg)" />
					</div>
					<div className="field">
						<label>Surface</label>
						<input readOnly value="var(--bf-theme-surface-1)" />
					</div>
					<button type="button" className="btn btn-primary">Save theme draft</button>
				</div>
			</div>
			<div className="designer-split-preview card">
				<h3>Live preview</h3>
				<button type="button" className="btn btn-primary">Primary action</button>
				<button type="button" className="btn btn-secondary" style={{ marginLeft: '0.5rem' }}>
					Secondary
				</button>
				<div className="card" style={{ marginTop: '1rem' }}>
					<p style={{ margin: 0 }}>Card on surface — reflects current CSS variables.</p>
				</div>
			</div>
		</div>
	);
}
