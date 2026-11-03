import type { ThemeId } from '../theme/themes';

export type ThemeSwatch = {
	surface: string;
	surfaceMuted: string;
	accent: string;
	text: string;
	fontSample: string;
};

/** Representative tokens for direction picker previews (matches shipped theme CSS). */
export const THEME_SWATCHES: Partial<Record<ThemeId, ThemeSwatch>> = {
	simple: {
		surface: '#ffffff',
		surfaceMuted: '#f5f5f5',
		accent: '#111111',
		text: '#111111',
		fontSample: 'Segoe UI',
	},
	noir: {
		surface: '#111111',
		surfaceMuted: '#1a1a1a',
		accent: '#f59e0b',
		text: '#f3f3f3',
		fontSample: 'Helvetica Neue',
	},
};

export function swatchForTheme(themeId: ThemeId): ThemeSwatch {
	return (
		THEME_SWATCHES[themeId] ?? {
			surface: '#ffffff',
			surfaceMuted: '#f5f5f5',
			accent: '#334155',
			text: '#111111',
			fontSample: 'system-ui',
		}
	);
}
