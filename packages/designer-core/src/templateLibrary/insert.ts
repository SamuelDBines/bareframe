import { applyFlowSpec, designToNodes, repairFlowSpec, type ApplyFlowSpecOptions, type DesignDevice, type FlowSpec, type ProjectDocument } from '../index.js';
import { FLOW_CARD_GAP_X, FLOW_CARD_WIDTH } from '../flowLayout.js';
import type { FlowTemplateMeta, ScreenTemplateId } from './types.js';
import { buildScreenVariantTree, pickVariantId } from './render.js';
import { getFlowTemplate, getScreenTemplate } from './registry.js';
import type { ScreenBrief } from '../types.js';

export type InsertScreenTemplateOptions = {
	projectId?: string;
	pageId?: string;
	screenTemplateId: ScreenTemplateId;
	variantId?: string;
	device: DesignDevice;
	brief?: Partial<ScreenBrief>;
	screenName?: string;
	newId: (prefix: string) => string;
};

/** Apply a screen template variant to an existing page (default state nodes). */
export function applyScreenTemplateToPage(
	document: ProjectDocument,
	options: InsertScreenTemplateOptions,
): ProjectDocument {
	const doc = structuredClone(document) as ProjectDocument;
	const page = doc.project.pages.find((p) => p.id === options.pageId);
	if (!page) throw new Error('page not found');
	const tpl = getScreenTemplate(options.screenTemplateId);
	const brief: ScreenBrief = {
		key: page.brief?.key ?? page.id,
		purpose: options.brief?.purpose ?? tpl.description,
		keyContent: options.brief?.keyContent ?? tpl.variants[0]!.hotspots.map(String),
		states: page.brief?.states ?? ['default'],
	};
	const variantId = pickVariantId(options.screenTemplateId, brief, brief.keyContent, options.variantId);
	const tree = buildScreenVariantTree(options.screenTemplateId, variantId, options.device);
	const idx = doc.project.pages.findIndex((p) => p.id === page.id);
	doc.project.pages[idx] = designToNodes({ ...page, name: options.screenName ?? page.name }, tree, options.newId);
	return doc;
}

export type InsertFlowTemplateOptions = ApplyFlowSpecOptions & {
	flowTemplateId: import('./types.js').FlowTemplateId;
	merge?: boolean;
};

function designDeviceFromOptions(options: InsertFlowTemplateOptions): DesignDevice {
	if (options.platforms?.includes('desktop')) return 'desktop';
	if (options.platforms?.includes('tablet')) return 'tablet';
	return 'phone';
}

function paintFlowScreens(
	doc: ProjectDocument,
	flow: FlowTemplateMeta,
	screens: FlowSpec['screens'],
	screenId: (id: string) => string,
	newId: (prefix: string) => string,
	device: DesignDevice,
) {
	for (const screen of screens) {
		const templateId = screen.purpose.replace(/^Template:\s*/, '') as ScreenTemplateId;
		const key = screenId(screen.id);
		const page = doc.project.pages.find((p) => (p.brief?.key ?? p.id) === key);
		if (!page) continue;
		try {
			const variantId = flow.defaultScreenVariants[templateId] ?? getScreenTemplate(templateId).variants[0]!.id;
			const tree = buildScreenVariantTree(templateId, variantId, device);
			const idx = doc.project.pages.findIndex((p) => p.id === page.id);
			doc.project.pages[idx] = designToNodes(page, tree, newId);
		} catch {
			/* skip */
		}
	}
}

function flowBounds(frames: { x: number; width?: number }[]) {
	if (!frames.length) return { maxRight: 0 };
	return { maxRight: Math.max(...frames.map((f) => f.x + (f.width ?? FLOW_CARD_WIDTH))) };
}

/** Insert a flow without removing existing screens; offset new frames to the right. */
export function insertFlowTemplate(
	document: ProjectDocument,
	options: InsertFlowTemplateOptions,
): { document: ProjectDocument; screenFrameIds: Record<string, string> } {
	const flow = getFlowTemplate(options.flowTemplateId);
	const { spec } = repairFlowSpec(flow.spec);
	const device = designDeviceFromOptions(options);
	if (!options.merge) {
		const applied = applyFlowSpec(document, spec, options);
		paintFlowScreens(applied.document, flow, spec.screens, (id) => id, options.newId, device);
		return applied;
	}
	const prefix = `${options.flowTemplateId}-`;
	const merged: FlowSpec = {
		screens: spec.screens.map((s) => ({ ...s, id: `${prefix}${s.id}` })),
		connections: spec.connections.map((c) => ({
			from: `${prefix}${c.from}`,
			to: `${prefix}${c.to}`,
			trigger: c.trigger,
		})),
	};
	const existing = structuredClone(document) as ProjectDocument;
	const ghost = existing.project.frames.filter((f) => f.ghost);
	const real = existing.project.frames.filter((f) => !f.ghost);
	const offset = flowBounds(real).maxRight + FLOW_CARD_GAP_X;
	const { document: fresh, screenFrameIds } = applyFlowSpec(
		{ ...existing, project: { ...existing.project, pages: [], frames: ghost, connectors: [] } },
		merged,
		options,
	);
	paintFlowScreens(fresh, flow, spec.screens, (id) => `${prefix}${id}`, options.newId, device);
	for (const frame of fresh.project.frames) {
		if (!frame.ghost) {
			frame.x += offset;
		}
	}
	const mergedDoc: ProjectDocument = {
		...existing,
		project: {
			...existing.project,
			pages: [...existing.project.pages, ...fresh.project.pages],
			frames: [...existing.project.frames, ...fresh.project.frames],
			connectors: [...existing.project.connectors, ...fresh.project.connectors],
			annotations: [...existing.project.annotations, ...fresh.project.annotations],
			productBrief: fresh.project.productBrief ?? existing.project.productBrief,
		},
	};
	return { document: mergedDoc, screenFrameIds };
}
