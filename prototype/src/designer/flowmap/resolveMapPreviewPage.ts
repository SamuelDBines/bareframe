import {
	defaultNewId,
	designToNodes,
	screenKeyForPage,
	type DesignDevice,
	type DesignSpec,
	type Page,
} from '@bareframe/designer-core';
import { buildTemplateFallbackPage } from './templateFallbackPage';

let previewNodeSeq = 0;
function previewNodeId(prefix: string) {
	previewNodeSeq += 1;
	return `${prefix}-pv-${previewNodeSeq}`;
}

/** Page nodes to render on the map or in prototype for the chosen device breakpoint. */
export function resolveMapPreviewPage(
	page: Page,
	device: DesignDevice,
	designs: Map<string, DesignSpec>,
	productDescription: string,
	outgoingActions: string[],
): Page {
	const key = screenKeyForPage(page);
	const spec = designs.get(`${key}:${device}`);
	if (spec?.states?.default) {
		return designToNodes({ ...page, nodes: { ...page.nodes } }, spec.states.default, previewNodeId);
	}
	const fallback = buildTemplateFallbackPage(page, device, productDescription, outgoingActions);
	if (fallback) return fallback;
	return page;
}