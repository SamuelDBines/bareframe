import { useMemo, useState } from 'react';
import { THEME_IDS, THEME_LABELS, type ThemeId } from '../../theme/themes';
import { useTheme } from '../../theme/ThemeContext';
import { buildFramePreviewDoc } from '../../designer/framePreviewDoc';
import { createInitialProject } from '../../designer/initialProject';

const TOKEN_FIELDS = [
	{ key: '--bf-theme-button-primary-bg', label: 'Primary button' },
	{ key: '--bf-theme-surface-1', label: 'Surface 1' },
	{ key: '--bf-theme-surface-2', label: 'Surface 2' },
	{ key: '--bf-theme-text-1', label: 'Text' },
	{ key: '--bf-theme-border-1', label: 'Border' },
];

export function ThemesWorkspace() {
	const { theme: globalTheme, setTheme } = useTheme();
	const [editingTheme, setEditingTheme] = useState<ThemeId>(globalTheme);
	const [overrides, setOverrides] = useState<Record<string, string>>({});

	const previewDoc = useMemo(() => {
		const project = createInitialProject(editingTheme);
		const page = project.pages[0];
		return buildFramePreviewDoc({
			page,
			frameWidth: 393,
			themeId: editingTheme,
			tokenOverrides: overrides,
			selectedNodeId: null,
		});
	}, [editingTheme, overrides]);

	return (
		<div className="themes-workspace">
			<aside className="themes-sidebar card">
				<h3>Themes</h3>
				<ul className="sidebar-list">
					{THEME_IDS.map((id) => (
						<li key={id}>
							<button
								type="button"
								className={editingTheme === id ? 'active' : ''}
								onClick={() => {
									setEditingTheme(id);
									setOverrides({});
								}}
							>
								{THEME_LABELS[id]}
								{id === globalTheme && <span className="badge-pill">Project default</span>}
							</button>
						</li>
					))}
				</ul>
				<button
					type="button"
					className="btn btn-secondary"
					onClick={() => setTheme(editingTheme)}
				>
					Set as project default
				</button>
			</aside>
			<div className="themes-editor">
				<h2>Theme &amp; tokens</h2>
				<p className="lead">Merged theme and token editor — edits restyle the live preview.</p>
				<div className="grid-2">
					{TOKEN_FIELDS.map((f) => (
						<div key={f.key} className="field">
							<label>{f.label}</label>
							<input
								placeholder={f.key}
								onChange={(e) =>
									setOverrides((o) => ({ ...o, [f.key]: e.target.value }))
								}
							/>
						</div>
					))}
				</div>
				<details open style={{ marginTop: '1rem' }}>
					<summary>Code (CSS variables)</summary>
					<pre className="code-block">
						{Object.entries(overrides)
							.map(([k, v]) => `${k}: ${v};`)
							.join('\n') || '/* edit tokens above */'}
					</pre>
				</details>
			</div>
			<div className="themes-preview card">
				<h3>Live preview</h3>
				<iframe title="Theme preview" className="themes-preview-iframe" srcDoc={previewDoc} />
			</div>
		</div>
	);
}
