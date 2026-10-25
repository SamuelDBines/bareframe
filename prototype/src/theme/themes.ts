/** Theme ids match `data-bf-theme` and files in `/themes/*.css` (layout.css is structural only). */
export const THEME_IDS = [
	'light',
	'dark',
	'system',
	'aurora',
	'desert',
	'future',
	'matrix',
	'modern',
	'nature',
	'nebula',
	'noir',
	'oceanic',
	'retro',
	'simple',
	'sprint',
	'sunrise',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export const DEFAULT_THEME: ThemeId = 'light';

export const THEME_LABELS: Record<ThemeId, string> = {
	light: 'Light',
	dark: 'Dark',
	system: 'System',
	aurora: 'Aurora',
	desert: 'Desert',
	future: 'Future',
	matrix: 'Matrix',
	modern: 'Modern',
	nature: 'Nature',
	nebula: 'Nebula',
	noir: 'Noir',
	oceanic: 'Oceanic',
	retro: 'Retro',
	simple: 'Simple',
	sprint: 'Sprint',
	sunrise: 'Sunrise',
};
