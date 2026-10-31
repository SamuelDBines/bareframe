#!/usr/bin/env node
/**
 * Bakes repo artifacts into mcp/data/catalog.json for the hosted MCP server.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(here, '..');
const repoRoot = path.resolve(mcpRoot, '..');

const TIER_A = new Set([
	'button',
	'link',
	'input',
	'header',
	'footer',
	'modal',
	'dialog',
	'toast',
	'message',
	'error-summary',
	'checkbox',
	'radio',
	'select',
	'toggle',
]);

const TIER_B = new Set([
	'combobox',
	'autocomplete',
	'menu',
	'dropdown',
	'data-grid',
	'date-picker',
	'command-palette',
	'nav',
	'pagination',
	'tab',
	'breadcrumb',
]);

const SLUG_TO_REACT = {
	alert: 'Alert',
	badge: 'Badge',
	button: 'Button',
	calendar: 'Calendar',
	card: 'Card',
	checkbox: 'Checkbox',
	switch: 'Switch',
	field: 'Field',
	input: 'Input',
	textarea: 'Textarea',
	select: 'Select',
	slider: 'Slider',
	'radio-group': 'RadioGroup',
	multiselect: 'MultiSelect',
	combobox: 'Combobox',
	modal: 'Modal',
	drawer: 'Drawer',
	tooltip: 'Tooltip',
	popover: 'Popover',
	'dropdown-menu': 'DropdownMenu',
	tabs: 'Tabs',
	breadcrumbs: 'Breadcrumbs',
	pagination: 'Pagination',
	accordion: 'Accordion',
	toast: 'Toast',
	progress: 'Progress',
	spinner: 'Spinner',
	skeleton: 'Skeleton',
	avatar: 'Avatar',
	table: 'Table',
	'empty-state': 'EmptyState',
	'stat-card': 'StatCard',
	datepicker: 'DatePicker',
	'date-picker': 'DatePicker',
};

function stabilityFor(slug) {
	if (TIER_A.has(slug)) return 'stable';
	if (TIER_B.has(slug)) return 'beta';
	return 'experimental';
}

function categoryFor(slug) {
	if (['button', 'link', 'split-button', 'fab'].includes(slug)) return 'actions';
	if (['input', 'checkbox', 'radio', 'select', 'toggle', 'textarea', 'form-field', 'number-field', 'otp-input', 'range', 'combobox', 'date-picker', 'date-range-picker', 'file-upload'].includes(slug))
		return 'forms';
	if (['modal', 'dialog', 'drawer', 'dropdown', 'menu', 'toast', 'message'].includes(slug)) return 'feedback';
	if (['header', 'footer', 'nav', 'breadcrumb', 'pagination', 'tab', 'bottom-navigation'].includes(slug)) return 'navigation';
	if (['card', 'table', 'data-grid', 'avatar', 'badge', 'tag', 'metric-card', 'empty-state'].includes(slug)) return 'data-display';
	if (slug.includes('theme') || slug === 'divider') return 'layout';
	return 'misc';
}

function readJson(relFromRepo) {
	return JSON.parse(readFileSync(path.join(repoRoot, relFromRepo), 'utf8'));
}

function parseThemeVariables(cssText) {
	/** @type {Record<string, string>} */
	const vars = {};
	const re = /(--bf-theme-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
	let m;
	while ((m = re.exec(cssText)) !== null) {
		vars[m[1]] = m[2].trim();
	}
	return vars;
}

const manifest = readJson('dist/manifest.json');
const tokens = readJson('dist/tokens.json');
const reactProps = readJson('prototype/src/components/library/generated-props.json');

const themesDir = path.join(repoRoot, 'themes');
const themeFiles = readdirSync(themesDir)
	.filter((f) => f.endsWith('.css') && f !== 'layout.css')
	.sort();

const themes = themeFiles.map((file) => {
	const id = file.replace(/\.css$/, '');
	const css = readFileSync(path.join(themesDir, file), 'utf8');
	const variables = parseThemeVariables(css);
	return {
		id,
		label: id.charAt(0).toUpperCase() + id.slice(1),
		cssImport: `bareframe/themes/${file}`,
		variableCount: Object.keys(variables).length,
		variables,
	};
});

const components = manifest.components.map((slug) => ({
	slug,
	category: categoryFor(slug),
	stability: stabilityFor(slug),
	reactExport: SLUG_TO_REACT[slug] ?? null,
	props: reactProps[slug] ?? [],
}));

const catalog = {
	bundledAt: new Date().toISOString(),
	bareframeVersion: JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')).version,
	manifest,
	tokens,
	themes,
	components,
};

const outDir = path.join(mcpRoot, 'data');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'catalog.json');
writeFileSync(outPath, JSON.stringify(catalog));
console.log('Wrote', outPath, `(${components.length} components, ${themes.length} themes)`);
