/** Curated token sample for the tokens explorer (full export lives in dist/tokens.json). */
export const TOKEN_GROUPS: { label: string; tokens: { name: string; sample: string }[] }[] = [
	{
		label: 'Surfaces & text',
		tokens: [
			{ name: '--bf-theme-surface-1', sample: 'var(--bf-theme-surface-1)' },
			{ name: '--bf-theme-surface-2', sample: 'var(--bf-theme-surface-2)' },
			{ name: '--bf-theme-text-1', sample: 'var(--bf-theme-text-1)' },
			{ name: '--bf-theme-text-2', sample: 'var(--bf-theme-text-2)' },
			{ name: '--bf-theme-border-1', sample: 'var(--bf-theme-border-1)' },
		],
	},
	{
		label: 'Buttons',
		tokens: [
			{ name: '--bf-theme-button-primary-bg', sample: 'var(--bf-theme-button-primary-bg)' },
			{ name: '--bf-theme-button-primary-color', sample: 'var(--bf-theme-button-primary-color)' },
			{ name: '--bf-theme-button-secondary-bg', sample: 'var(--bf-theme-button-secondary-bg)' },
			{ name: '--bf-theme-button-secondary-color', sample: 'var(--bf-theme-button-secondary-color)' },
		],
	},
	{
		label: 'Typography',
		tokens: [
			{ name: '--bf-theme-font-family', sample: 'var(--bf-theme-font-family)' },
			{ name: '--bf-theme-typography-h1-size', sample: 'var(--bf-theme-typography-h1-size)' },
			{ name: '--bf-theme-typography-body-size', sample: 'var(--bf-theme-body-size, 1rem)' },
			{ name: '--bf-theme-radius-md', sample: 'var(--bf-theme-radius-md)' },
		],
	},
	{
		label: 'Focus & motion',
		tokens: [
			{ name: '--bf-theme-focus-ring-color', sample: 'var(--bf-theme-focus-ring-color)' },
			{ name: '--bf-theme-focus-ring-width', sample: 'var(--bf-theme-focus-ring-width)' },
			{ name: '--bf-theme-opacity-hover', sample: 'var(--bf-theme-opacity-hover)' },
			{ name: '--bf-theme-active-translate-y', sample: 'var(--bf-theme-active-translate-y)' },
		],
	},
];
