#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const lib = path.join(import.meta.dirname, '..', 'src', 'templateLibrary');
const screens = fs
	.readdirSync(path.join(lib, 'screens'))
	.filter((f) => f.endsWith('.ts'))
	.map((f) => f.replace(/\.ts$/, ''))
	.sort();
const flows = fs
	.readdirSync(path.join(lib, 'flows'))
	.filter((f) => f.endsWith('.ts'))
	.map((f) => f.replace(/\.ts$/, ''))
	.sort();

const body = `import type { DesignDevice, DesignTreeNode } from '../designSpec.js';
import type { FlowSpec } from '../flowSpec.js';

/** Library version bumps when variants or hotspot names change. */
export const TEMPLATE_LIBRARY_VERSION = 1;

export const TEMPLATE_CATEGORIES = [
	'auth',
	'onboarding',
	'app',
	'content',
	'commerce',
	'utility',
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export type ScreenTemplateId =
${screens.map((id) => `\t| '${id}'`).join('\n')};

export type FlowTemplateId =
${flows.map((id) => `\t| '${id}'`).join('\n')};

export type ScreenTemplateVariantMeta = {
	id: string;
	title: string;
	summary: string;
	/** Button labels that connectors can target. */
	hotspots: readonly string[];
	build: (device: DesignDevice) => DesignTreeNode;
};

export type ScreenTemplateMeta = {
	id: ScreenTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	variants: readonly ScreenTemplateVariantMeta[];
};

export type FlowTemplateMeta = {
	id: FlowTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	spec: FlowSpec;
	defaultScreenVariants: Partial<Record<ScreenTemplateId, string>>;
};

export type ScreenTemplateListItem = {
	libraryVersion: number;
	id: ScreenTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	variants: { id: string; title: string; summary: string; hotspots: string[] }[];
};

export type FlowTemplateListItem = {
	libraryVersion: number;
	id: FlowTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	screenCount: number;
	connectionCount: number;
};
`;

fs.writeFileSync(path.join(lib, 'types.ts'), body);
console.log('types.ts updated');