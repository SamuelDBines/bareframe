#!/usr/bin/env node
/**
 * Generates prototype/src/components/library/generated-props.json from @bareframe/react sources.
 */
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { parse } from 'react-docgen-typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reactSrc = path.join(root, 'packages/react/src');

const EXPORT_TO_FILE = {
	Alert: 'Alert/Alert.tsx',
	Badge: 'Badge/Badge.tsx',
	Button: 'Button/Button.tsx',
	Calendar: 'Calendar/Calendar.tsx',
	Card: 'Card/Card.tsx',
	DatePicker: 'DatePicker/DatePicker.tsx',
	Checkbox: 'forms.tsx',
	Switch: 'forms.tsx',
	Textarea: 'forms.tsx',
	Slider: 'forms.tsx',
	RadioGroup: 'forms.tsx',
	Progress: 'feedback.tsx',
	Spinner: 'feedback.tsx',
	Skeleton: 'feedback.tsx',
	Toast: 'feedback.tsx',
	Input: 'Input/Input.tsx',
	Field: 'Input/Input.tsx',
	Modal: 'Modal/Modal.tsx',
	Drawer: 'Modal/Modal.tsx',
	Select: 'Select/Select.tsx',
	NativeSelect: 'Select/Select.tsx',
	Combobox: 'Select/Select.tsx',
	MultiSelect: 'Select/Select.tsx',
	Tabs: 'navigation.tsx',
	Breadcrumbs: 'navigation.tsx',
	Pagination: 'navigation.tsx',
	Accordion: 'navigation.tsx',
	Tooltip: 'overlays.tsx',
	Popover: 'overlays.tsx',
	PopoverPanel: 'overlays.tsx',
	DropdownMenu: 'overlays.tsx',
	Avatar: 'data-display.tsx',
	EmptyState: 'data-display.tsx',
	StatCard: 'data-display.tsx',
	Table: 'data-display.tsx',
};

const SLUG_TO_EXPORT = {
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
};

const options = {
	savePropValueAsString: true,
	shouldExtractLiteralValuesFromEnum: true,
	shouldRemoveUndefinedFromOptional: true,
	propFilter: (prop) => {
		if (prop.parent?.fileName.includes('node_modules')) return false;
		if (prop.name.startsWith('aria-')) return false;
		return true;
	},
};

const parsedFiles = new Map();

function getDocsForFile(relPath) {
	if (parsedFiles.has(relPath)) return parsedFiles.get(relPath);
	const abs = path.join(reactSrc, relPath);
	const program = ts.createProgram([abs], {
		target: ts.ScriptTarget.Latest,
		module: ts.ModuleKind.ESNext,
		jsx: ts.JsxEmit.ReactJSX,
		esModuleInterop: true,
		skipLibCheck: true,
	});
	const docs = parse(abs, options, program);
	parsedFiles.set(relPath, docs);
	return docs;
}

function findComponentDoc(exportName, relPath) {
	const docs = getDocsForFile(relPath);
	return docs.find((d) => d.displayName === exportName) ?? docs[0];
}

function formatType(prop) {
	if (!prop.type) return 'unknown';
	let t = prop.type.name;
	if (prop.type.value?.length) {
		t = prop.type.value.map((v) => v.value?.replace(/'/g, '') ?? v).join(' | ');
	}
	return t.replace(/\s+/g, ' ').trim();
}

/** @type {Record<string, { name: string; type: string; default?: string; description: string }[]>} */
const bySlug = {};

for (const [slug, exportName] of Object.entries(SLUG_TO_EXPORT)) {
	const rel = EXPORT_TO_FILE[exportName];
	if (!rel) continue;
	const doc = findComponentDoc(exportName, rel);
	if (!doc?.props) {
		bySlug[slug] = [];
		continue;
	}
	bySlug[slug] = Object.values(doc.props)
		.filter((p) => p.name !== 'ref' && p.name !== 'key')
		.map((p) => ({
			name: p.name,
			type: formatType(p),
			default: p.defaultValue?.value?.replace(/^"(.*)"$/, '$1'),
			description: p.description?.trim() || '',
		}));
}

const outPath = path.join(root, 'prototype/src/components/library/generated-props.json');
writeFileSync(outPath, JSON.stringify(bySlug, null, 2));
console.log('Wrote', outPath, 'for', Object.keys(bySlug).length, 'slugs');
