import type { DesignDevice, DesignTreeNode } from '../designSpec.js';
import type { ScreenTemplateMeta, ScreenTemplateVariantMeta } from './types.js';

export function variant(
	id: string,
	title: string,
	summary: string,
	hotspots: readonly string[],
	build: (device: DesignDevice) => DesignTreeNode,
): ScreenTemplateVariantMeta {
	return { id, title, summary, hotspots, build };
}

export function defineScreen(
	meta: Omit<ScreenTemplateMeta, 'variants'> & { variants: ScreenTemplateVariantMeta[] },
): ScreenTemplateMeta {
	if (meta.variants.length < 2) {
		throw new Error(`${meta.id}: screen templates need at least 2 variants`);
	}
	return meta;
}