import type { ThemeRecord } from './types.js';

export type TokenValue = {
	value: string;
	/** Present when `includeCssVariables` is true. */
	cssVariable?: string;
};

export type DesignTokenGroups = {
	colors: {
		semantic: Record<string, TokenValue>;
		interactive: Record<string, Record<string, TokenValue>>;
		components: Record<string, Record<string, TokenValue>>;
	};
	spacing: Record<string, TokenValue>;
	typography: {
		fontFamily: TokenValue | null;
		lineHeight: TokenValue | null;
		letterSpacing: TokenValue | null;
		scale: Record<string, TokenValue>;
	};
	radii: Record<string, TokenValue>;
	shadows: Record<string, TokenValue>;
	borders: Record<string, TokenValue>;
	focus: Record<string, TokenValue>;
	motion: Record<string, TokenValue>;
	zIndex: Record<string, TokenValue>;
	other: Record<string, TokenValue>;
};

const SEMANTIC_COLOR_KEYS = [
	'surface-1',
	'surface-2',
	'surface-3',
	'text-1',
	'text-2',
	'text-3',
	'border-1',
	'border-2',
	'canvas-bg',
	'canvas-color',
] as const;

const INTERACTIVE_GROUPS: Record<string, string[]> = {
	buttonPrimary: ['button-primary-bg', 'button-primary-color', 'button-primary-border-color'],
	buttonSecondary: ['button-secondary-bg', 'button-secondary-color', 'button-secondary-border-color'],
	buttonGhost: ['button-ghost-bg', 'button-ghost-color', 'button-ghost-border-color'],
	buttonOutlined: ['button-outlined-bg', 'button-outlined-color', 'button-outlined-border-color'],
	link: ['link-color', 'link-hover-color'],
};

function tokenKey(cssVar: string): string {
	return cssVar.replace(/^--bf-theme-/, '');
}

function camelKey(segment: string): string {
	return segment.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
}

function tv(name: string, value: string, includeCssVariables: boolean): TokenValue {
	return includeCssVariables ? { value, cssVariable: name } : { value };
}

export function structureDesignTokens(
	variables: Record<string, string>,
	includeCssVariables: boolean,
): DesignTokenGroups {
	const get = (suffix: string): string | undefined => variables[`--bf-theme-${suffix}`];

	const colors = {
		semantic: {} as Record<string, TokenValue>,
		interactive: {} as Record<string, Record<string, TokenValue>>,
		components: {} as Record<string, Record<string, TokenValue>>,
	};

	for (const key of SEMANTIC_COLOR_KEYS) {
		const cssVar = `--bf-theme-${key}`;
		const value = variables[cssVar];
		if (value) colors.semantic[camelKey(key)] = tv(cssVar, value, includeCssVariables);
	}

	for (const [group, suffixes] of Object.entries(INTERACTIVE_GROUPS)) {
		const bucket: Record<string, TokenValue> = {};
		for (const suffix of suffixes) {
			const cssVar = `--bf-theme-${suffix}`;
			const value = variables[cssVar];
			if (value) bucket[camelKey(suffix.replace(/^[^-]+-/, ''))] = tv(cssVar, value, includeCssVariables);
		}
		if (Object.keys(bucket).length > 0) colors.interactive[group] = bucket;
	}

	const spacing: Record<string, TokenValue> = {};
	const radii: Record<string, TokenValue> = {};
	const shadows: Record<string, TokenValue> = {};
	const borders: Record<string, TokenValue> = {};
	const focus: Record<string, TokenValue> = {};
	const motion: Record<string, TokenValue> = {};
	const zIndex: Record<string, TokenValue> = {};
	const typographyScale: Record<string, TokenValue> = {};
	const other: Record<string, TokenValue> = {};

	let fontFamily: TokenValue | null = null;
	let lineHeight: TokenValue | null = null;
	let letterSpacing: TokenValue | null = null;

	const assigned = new Set<string>();

	for (const [cssVar, value] of Object.entries(variables)) {
		const key = tokenKey(cssVar);
		if (key.startsWith('space-')) {
			spacing[`space${key.replace('space-', '')}`] = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key.startsWith('radius-')) {
			radii[camelKey(key.replace('radius-', ''))] = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key.startsWith('shadow-') || key === 'shadow') {
			shadows[camelKey(key.replace(/^shadow-?/, '') || 'default')] = tv(
				cssVar,
				value,
				includeCssVariables,
			);
			assigned.add(cssVar);
		} else if (key === 'border-width' || key === 'border-style' || key.startsWith('border-')) {
			if (key === 'border-1' || key === 'border-2') {
				// semantic color
			} else {
				borders[camelKey(key.replace('border-', ''))] = tv(cssVar, value, includeCssVariables);
				assigned.add(cssVar);
			}
		} else if (key.startsWith('focus-ring-') || key.startsWith('focus-')) {
			focus[camelKey(key.replace(/^focus-/, ''))] = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key.startsWith('opacity-') || key.includes('translate') || key.includes('cursor-')) {
			motion[camelKey(key)] = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key.startsWith('z-')) {
			zIndex[camelKey(key.replace('z-', ''))] = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key === 'font-family') {
			fontFamily = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key === 'typography-line-height') {
			lineHeight = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key === 'typography-letter-spacing') {
			letterSpacing = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (key.startsWith('typography-')) {
			const part = key.replace('typography-', '');
			typographyScale[camelKey(part)] = tv(cssVar, value, includeCssVariables);
			assigned.add(cssVar);
		} else if (
			key.includes('-bg') ||
			key.includes('-color') ||
			key.includes('-border-color') ||
			key.endsWith('-chevron-color')
		) {
			const component = key.split('-')[0];
			if (!colors.components[component]) colors.components[component] = {};
			colors.components[component][camelKey(key.slice(component.length + 1) || 'base')] = tv(
				cssVar,
				value,
				includeCssVariables,
			);
			assigned.add(cssVar);
		}
	}

	for (const [cssVar, value] of Object.entries(variables)) {
		if (assigned.has(cssVar)) continue;
		if (cssVar.startsWith('--bf-theme-')) {
			other[tokenKey(cssVar)] = tv(cssVar, value, includeCssVariables);
		}
	}

	return {
		colors,
		spacing,
		typography: {
			fontFamily,
			lineHeight,
			letterSpacing,
			scale: typographyScale,
		},
		radii,
		shadows,
		borders,
		focus,
		motion,
		zIndex,
		other,
	};
}

export function buildDesignTokensResponse(
	theme: ThemeRecord,
	includeCssVariables: boolean,
	defaultThemeId: string,
) {
	return {
		themeId: theme.id,
		label: theme.label,
		cssImport: theme.cssImport,
		stylesImport: '@bareframe/react/dist/styles.css',
		dataAttribute: `data-bf-theme="${theme.id}"`,
		defaultThemeId,
		tokens: structureDesignTokens(theme.variables, includeCssVariables),
		...(includeCssVariables ? { cssVariables: theme.variables } : {}),
	};
}

/** Resolve a single hop of `var(--bf-theme-…)` using the theme map (for tests / docs). */
export function resolveThemeVar(value: string, variables: Record<string, string>): string {
	const m = value.match(/^var\((--bf-theme-[a-z0-9-]+)\)$/i);
	if (!m) return value;
	return variables[m[1]] ?? value;
}
