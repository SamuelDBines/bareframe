import { describe, expect, it } from 'vitest';
import { getDesignTokens, loadCatalog } from './catalog.js';
import { resolveThemeVar } from './design-tokens.js';

describe('get_design_tokens', () => {
	const catalog = loadCatalog();

	it('defaults to light theme with semantic colors and spacing', () => {
		const payload = getDesignTokens(catalog, undefined, false);
		expect(payload).toBeDefined();
		expect(payload!.themeId).toBe('light');
		expect(payload!.tokens.colors.semantic.surface1?.value).toBeTruthy();
		expect(payload!.tokens.spacing.space2?.value).toBeTruthy();
		expect(payload!.tokens.typography.scale.bodySize?.value).toBeTruthy();
	});

	it('includes css variable names when requested', () => {
		const aurora = getDesignTokens(catalog, 'aurora', true);
		expect(aurora!.tokens.colors.semantic.text1?.cssVariable).toBe('--bf-theme-text-1');
		expect(aurora!.cssVariables?.['--bf-theme-button-primary-bg']).toBe('#7c3aed');
	});

	it('resolves single-hop var() references', () => {
		const theme = catalog.themes.find((t) => t.id === 'aurora')!;
		const resolved = resolveThemeVar('var(--bf-theme-text-1)', theme.variables);
		expect(resolved).toBe('#2d1b44');
	});
});
