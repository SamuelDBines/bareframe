import { THEME_IDS, THEME_LABELS } from '../theme/themes';
import { useTheme } from '../theme/ThemeContext';

export function ThemeSwitcher() {
	const { theme, setTheme } = useTheme();

	return (
		<label className="theme-switcher-label">
			<span className="sr-only">Theme</span>
			<select
				className="theme-select"
				value={theme}
				onChange={(e) => setTheme(e.target.value as typeof theme)}
				aria-label="Bareframe theme"
			>
				{THEME_IDS.map((id) => (
					<option key={id} value={id}>
						{THEME_LABELS[id]}
					</option>
				))}
			</select>
		</label>
	);
}
