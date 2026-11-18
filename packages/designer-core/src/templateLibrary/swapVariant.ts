import { attachConnectorButtonNodes } from '../connectorLinks.js';
import type { DesignDevice } from '../designSpec.js';
import type { Page, ProjectDocument } from '../types.js';
import type { ScreenTemplateId } from './types.js';
import { getScreenTemplate } from './registry.js';
import { buildScreenVariantTree, inferScreenTemplateId } from './render.js';
import { designToNodes } from '../designSpec.js';

export function resolvePageTemplateId(page: Page): ScreenTemplateId | null {
	const explicit = page.brief?.templateId;
	if (explicit) {
		try {
			getScreenTemplate(explicit as ScreenTemplateId);
			return explicit as ScreenTemplateId;
		} catch {
			/* fall through */
		}
	}
	const purpose = page.brief?.purpose?.replace(/^Template:\s*/, '') ?? '';
	if (purpose) {
		try {
			getScreenTemplate(purpose as ScreenTemplateId);
			return purpose as ScreenTemplateId;
		} catch {
			/* not a template id */
		}
	}
	return inferScreenTemplateId(page.name, page.brief?.purpose ?? '');
}

export function variantsForPage(page: Page) {
	const id = resolvePageTemplateId(page);
	if (!id) return null;
	const tpl = getScreenTemplate(id);
	const current = page.brief?.templateVariant;
	return { templateId: id, title: tpl.title, variants: tpl.variants, currentVariantId: current };
}

/** Swap layout variant; connector button labels are re-matched on the frame. */
export function swapScreenVariant(
	document: ProjectDocument,
	pageId: string,
	frameId: string,
	variantId: string,
	device: DesignDevice,
	newId: (prefix: string) => string,
): ProjectDocument {
	const doc = structuredClone(document) as ProjectDocument;
	const pageIndex = doc.project.pages.findIndex((p) => p.id === pageId);
	const page = doc.project.pages[pageIndex];
	if (!page) throw new Error('page not found');
	const templateId = resolvePageTemplateId(page);
	if (!templateId) throw new Error('no template for screen');
	const tpl = getScreenTemplate(templateId);
	if (!tpl.variants.some((v) => v.id === variantId)) throw new Error('unknown variant');
	const tree = buildScreenVariantTree(templateId, variantId, device);
	const brief = {
		...(page.brief ?? { key: page.id, purpose: '', keyContent: [], states: ['default'] }),
		templateId,
		templateVariant: variantId,
		purpose: page.brief?.purpose || tpl.description,
	};
	doc.project.pages[pageIndex] = {
		...designToNodes(page, tree, newId),
		brief,
	};
	attachConnectorButtonNodes(doc, pageId, frameId);
	return doc;
}