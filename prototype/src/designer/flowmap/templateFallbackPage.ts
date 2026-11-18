import {
	designToNodes,
	templateDesignStatesForBrief,
	type DesignDevice,
	type Page,
} from '@bareframe/designer-core';

let previewSeq = 0;

export function buildTemplateFallbackPage(
	page: Page,
	device: DesignDevice,
	productDescription: string,
	outgoingActions: string[],
): Page | null {
	const brief = {
		key: page.brief?.key ?? page.id,
		purpose: page.brief?.purpose || productDescription,
		keyContent: page.brief?.keyContent ?? [],
		states: page.brief?.states ?? ['default'],
	};
	const states = templateDesignStatesForBrief(page.name, brief, outgoingActions, device);
	const tree = states.default;
	if (!tree) return null;
	previewSeq += 1;
	return designToNodes({ ...page, nodes: { ...page.nodes } }, tree, (p) => `${p}-fb-${previewSeq}`);
}