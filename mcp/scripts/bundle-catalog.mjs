#!/usr/bin/env node
/**
 * Bakes repo artifacts into mcp/data/catalog.json for the hosted MCP server.
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const mcpRoot = path.resolve(here, '..');
const repoRoot = path.resolve(mcpRoot, '..');

function readJson(relFromRepo) {
	return JSON.parse(readFileSync(path.join(repoRoot, relFromRepo), 'utf8'));
}

function readText(relFromRepo) {
	return readFileSync(path.join(repoRoot, relFromRepo), 'utf8');
}

const tierDoc = readJson('docs/component-tiers.json');
const TIER_A = new Set(tierDoc.tierA);
const TIER_B = new Set(tierDoc.tierB);

const REGISTRY_CATEGORY_MAP = {
	Feedback: 'feedback',
	Display: 'data-display',
	Actions: 'actions',
	Layout: 'layout',
	Forms: 'forms',
	Navigation: 'navigation',
	Data: 'data-display',
	Overlay: 'feedback',
};

function parseRegistryMeta() {
	const tsx = readText('prototype/src/components/library/registry.tsx');
	/** @type {Map<string, { description: string; category: string; status: string; variants: string[] }>} */
	const map = new Map();
	for (const block of tsx.split(/\n\t\{/)) {
		const slugM = block.match(/slug:\s*'([^']+)'/);
		if (!slugM) continue;
		const descM = block.match(/description:\s*'((?:\\'|[^'])*)'/);
		const catM = block.match(/category:\s*'([^']+)'/);
		const statusM = block.match(/status:\s*'([^']+)'/);
		const variantsM = block.match(/variants:\s*\[([^\]]*)\]/);
		const variants = variantsM ? [...variantsM[1].matchAll(/'([^']+)'/g)].map((m) => m[1]) : [];
		map.set(slugM[1], {
			description: descM?.[1]?.replace(/\\'/g, "'") ?? '',
			category: catM?.[1] ?? '',
			status: statusM?.[1] ?? '',
			variants,
		});
	}
	return map;
}

const REGISTRY = parseRegistryMeta();

const SKIP_PROPS = new Set(['className', 'style', 'id', 'ref', 'as', 'slot']);
const KEY_PROPS = new Set([
	'variant',
	'size',
	'disabled',
	'loading',
	'dismissible',
	'open',
	'defaultOpen',
	'visible',
	'defaultVisible',
	'label',
	'title',
	'name',
	'type',
	'placeholder',
	'options',
	'value',
	'defaultValue',
	'onChange',
	'onPress',
	'onClick',
	'children',
]);

function summarizeProps(props, variantNames = []) {
	const required = [];
	const optional = [];
	let variants = [...variantNames];
	for (const prop of props) {
		if (SKIP_PROPS.has(prop.name)) continue;
		const isRequired =
			!prop.default &&
			prop.type !== 'boolean' &&
			!String(prop.type).includes('undefined') &&
			!String(prop.type).includes('?') &&
			prop.name !== 'children';
		const entry = { name: prop.name, type: prop.type };
		if (prop.default) entry.default = prop.default;
		if (prop.name === 'variant' && String(prop.type).includes('|')) {
			const fromType = String(prop.type)
				.replace(/"/g, '')
				.split('|')
				.map((s) => s.trim())
				.filter(Boolean);
			if (fromType.length > 0) variants = fromType;
		}
		if (KEY_PROPS.has(prop.name)) {
			if (isRequired && prop.name !== 'children') required.push(prop.name);
			else optional.push(entry);
		}
	}
	const summary = { required, optional: optional.slice(0, 12) };
	if (variants.length > 0) summary.variants = variants;
	return summary;
}

function descriptionFor(slug) {
	const reg = REGISTRY.get(slug);
	if (reg?.description) return reg.description;
	return `Bareframe bf-${slug} primitive for themed UI surfaces.`;
}

function stabilityFor(slug) {
	const reg = REGISTRY.get(slug);
	if (reg?.status === 'stable') return 'stable';
	if (reg?.status === 'beta') return 'beta';
	if (reg?.status === 'coming') return 'experimental';
	if (TIER_A.has(slug)) return 'stable';
	if (TIER_B.has(slug)) return 'beta';
	return 'experimental';
}

function categoryForSlugHeuristic(slug) {
	if (['button', 'link', 'split-button', 'fab'].includes(slug)) return 'actions';
	if (
		[
			'input',
			'checkbox',
			'radio',
			'select',
			'toggle',
			'textarea',
			'form-field',
			'number-field',
			'otp-input',
			'range',
			'combobox',
			'date-picker',
			'date-range-picker',
			'file-upload',
		].includes(slug)
	)
		return 'forms';
	if (['modal', 'dialog', 'drawer', 'dropdown', 'menu', 'toast', 'message'].includes(slug)) return 'feedback';
	if (['header', 'footer', 'nav', 'breadcrumb', 'pagination', 'tab', 'bottom-navigation'].includes(slug))
		return 'navigation';
	if (['card', 'table', 'data-grid', 'avatar', 'badge', 'tag', 'metric-card', 'empty-state'].includes(slug))
		return 'data-display';
	if (slug.includes('theme') || slug === 'divider') return 'layout';
	return 'misc';
}

function categoryFor(slug) {
	const reg = REGISTRY.get(slug);
	if (reg?.category && REGISTRY_CATEGORY_MAP[reg.category]) {
		return REGISTRY_CATEGORY_MAP[reg.category];
	}
	return categoryForSlugHeuristic(slug);
}

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

/** Docs example folders use slightly different names than manifest slugs. */
const SLUG_TO_EXAMPLE_DIR = {
	'date-picker': 'datepicker',
	tabs: 'tabs',
	'radio-group': 'radio-group',
};

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

function parseRkAliases(cssText) {
	/** @type {Record<string, string>} */
	const aliases = {};
	const re = /(--rk-theme-[a-z0-9-]+)\s*:\s*([^;]+);/gi;
	let m;
	while ((m = re.exec(cssText)) !== null) {
		aliases[m[1]] = m[2].trim();
	}
	return aliases;
}

function loadExampleSources(slug) {
	const dirName = SLUG_TO_EXAMPLE_DIR[slug] ?? slug;
	const dir = path.join(repoRoot, 'prototype/src/docs/examples', dirName);
	if (!existsSync(dir)) return [];
	return readdirSync(dir)
		.filter((f) => f.endsWith('.example.tsx'))
		.sort()
		.map((filename) => {
			const id = filename.replace(/\.example\.tsx$/, '');
			return {
				id,
				filename,
				source: readFileSync(path.join(dir, filename), 'utf8'),
			};
		});
}

function loadDocPages(manifestData, propsBySlug) {
	const pages = [];
	const docsDir = path.join(repoRoot, 'docs');
	for (const file of readdirSync(docsDir).filter((f) => f.endsWith('.md'))) {
		const id = file.replace(/\.md$/, '');
		const body = readFileSync(path.join(docsDir, file), 'utf8');
		const title = body.match(/^#\s+(.+)/m)?.[1]?.trim() ?? file;
		pages.push({
			id,
			title,
			path: `docs/${file}`,
			url: `https://bareframe.org/${file.replace(/\.md$/, '')}`,
			body,
		});
	}

	for (const slug of manifestData.components) {
		const exportName = SLUG_TO_REACT[slug];
		if (!exportName) continue;
		const props = propsBySlug[slug] ?? [];
		pages.push({
			id: `component-${slug}`,
			title: `${exportName} component (${slug})`,
			path: `prototype/docs/${slug}`,
			url: `https://bareframe.org/#/components/${slug}`,
			body: [`# ${exportName}`, '', '## Props', '', JSON.stringify(props, null, 2)].join('\n'),
		});
	}

	pages.push({
		id: 'react-readme',
		title: '@bareframe/react README',
		path: 'packages/react/README.md',
		url: 'https://github.com/SamuelDBines/bareframe/tree/main/packages/react',
		body: readText('packages/react/README.md'),
	});

	return pages;
}

const manifest = readJson('dist/manifest.json');
const tokens = readJson('dist/tokens.json');
const reactProps = readJson('prototype/src/components/library/generated-props.json');

function loadInstallSteps() {
	return {
		npm: readText('packages/react/README.md').match(/## Install[\s\S]*?(?=## Styles)/)?.[0]?.trim() ?? '',
		styles:
			readText('packages/react/README.md').match(/## Styles and themes[\s\S]*?(?=## Quick usage)/)?.[0]?.trim() ??
			'',
		localBeforePublish:
			readText('packages/react/README.md').match(/## Use locally before npm publish[\s\S]*?(?=## Development)/)?.[0]
				?.trim ?? '',
		peerDependencies: 'react ^18.3.0 || ^19.0.0, react-dom ^18.3.0 || ^19.0.0',
		packageName: '@bareframe/react',
	};
}

const migrationGuideMarkdown = readText('docs/MIGRATING-TO-BAREFRAME-REACT.md');
const rkAliases = parseRkAliases(readText('packages/react/src/styles/bareframe-ui.css'));

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
		cssImport: `@bareframe/react/themes/${file}`,
		variableCount: Object.keys(variables).length,
		variables,
	};
});

const componentsFromManifest = manifest.components.map((slug) => {
	const reg = REGISTRY.get(slug);
	const props = reactProps[slug] ?? [];
	return {
		slug,
		description: descriptionFor(slug),
		category: categoryFor(slug),
		stability: stabilityFor(slug),
		reactExport: SLUG_TO_REACT[slug] ?? null,
		props,
		propsSummary: summarizeProps(props, reg?.variants ?? []),
		examples: loadExampleSources(slug),
	};
});

const manifestSlugs = new Set(manifest.components);
const reactOnly = [];
for (const [slug, meta] of REGISTRY.entries()) {
	if (manifestSlugs.has(slug)) continue;
	const exportName = SLUG_TO_REACT[slug];
	if (!exportName) continue;
	const props = reactProps[slug] ?? [];
	reactOnly.push({
		slug,
		description: meta.description || descriptionFor(slug),
		category: categoryFor(slug),
		stability: stabilityFor(slug),
		reactExport: exportName,
		props,
		propsSummary: summarizeProps(props, meta.variants ?? []),
		examples: loadExampleSources(slug),
	});
}

const components = [...componentsFromManifest, ...reactOnly].sort((a, b) => a.slug.localeCompare(b.slug));

const catalog = {
	bundledAt: new Date().toISOString(),
	bareframeVersion: JSON.parse(readFileSync(path.join(repoRoot, 'package.json'), 'utf8')).version,
	defaultThemeId: 'light',
	manifest,
	tokens,
	themes,
	components,
	docPages: loadDocPages(manifest, reactProps),
	installSteps: loadInstallSteps(),
	migrationGuideMarkdown,
	repkitTokenAliases: rkAliases,
};

const outDir = path.join(mcpRoot, 'data');
mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'catalog.json');
writeFileSync(outPath, JSON.stringify(catalog));
console.log(
	'Wrote',
	outPath,
	`(${components.length} components, ${themes.length} themes, ${catalog.docPages.length} doc pages)`,
);
