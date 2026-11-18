#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const lib = path.join(import.meta.dirname, '..', 'src', 'templateLibrary');
const screensDir = path.join(lib, 'screens');
const flowsDir = path.join(lib, 'flows');

const screens = fs
	.readdirSync(screensDir)
	.filter((f) => f.endsWith('.ts'))
	.map((f) => f.replace(/\.ts$/, ''))
	.sort();

const flows = fs
	.readdirSync(flowsDir)
	.filter((f) => f.endsWith('.ts'))
	.map((f) => f.replace(/\.ts$/, ''))
	.sort();

const screenImports = screens.map((id) => `import screen_${id.replace(/-/g, '_')} from './screens/${id}.js';`).join('\n');
const screenArray = screens.map((id) => `screen_${id.replace(/-/g, '_')}`).join(', ');

const flowImports = flows.map((id) => `import flow_${id.replace(/-/g, '_')} from './flows/${id}.js';`).join('\n');
const flowArray = flows.map((id) => `flow_${id.replace(/-/g, '_')}`).join(', ');

const ids = screens.map((id) => `'${id}'`).join(' | ');
const flowIds = flows.map((id) => `'${id}'`).join(' | ');

const typesPatch = `// AUTO screen ids: ${screens.length}, flows: ${flows.length}`;

const registry = `${typesPatch}
import type { FlowTemplateId, FlowTemplateMeta, ScreenTemplateId, ScreenTemplateMeta } from './types.js';
${screenImports}
${flowImports}

const SCREEN_TEMPLATES: ScreenTemplateMeta[] = [${screenArray}];
const FLOW_TEMPLATES: FlowTemplateMeta[] = [${flowArray}];

const screenById = new Map<ScreenTemplateId, ScreenTemplateMeta>(
	SCREEN_TEMPLATES.map((s) => [s.id, s]),
);
const flowById = new Map<FlowTemplateId, FlowTemplateMeta>(FLOW_TEMPLATES.map((f) => [f.id, f]));

export function listScreenTemplates(): ScreenTemplateMeta[] {
	return [...SCREEN_TEMPLATES];
}

export function getScreenTemplate(id: ScreenTemplateId): ScreenTemplateMeta {
	const tpl = screenById.get(id);
	if (!tpl) throw new Error(\`Unknown screen template "\${id}"\`);
	return tpl;
}

export function listFlowTemplates(): FlowTemplateMeta[] {
	return [...FLOW_TEMPLATES];
}

export function getFlowTemplate(id: FlowTemplateId): FlowTemplateMeta {
	const tpl = flowById.get(id);
	if (!tpl) throw new Error(\`Unknown flow template "\${id}"\`);
	return tpl;
}

export const SCREEN_TEMPLATE_IDS = [${screens.map((s) => `'${s}'`).join(', ')}] as const;
export const FLOW_TEMPLATE_IDS = [${flows.map((f) => `'${f}'`).join(', ')}] as const;
`;

fs.writeFileSync(path.join(lib, 'registry.ts'), registry);
console.log('registry.ts', screens.length, 'screens', flows.length, 'flows');
console.log('ScreenTemplateId union size', screens.length);