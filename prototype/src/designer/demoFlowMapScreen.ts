import type { Frame, Page } from './types';

const PHONE_W = 393;
const PHONE_H = 852;

function stackLayout(gap = 16, padding: [number, number, number, number] = [0, 0, 0, 0]) {
	return {
		mode: 'stack' as const,
		gap,
		padding,
		align: 'stretch' as const,
		justify: 'start' as const,
		widthMode: 'fill' as const,
		heightMode: 'hug' as const,
	};
}

function textNode(
	id: string,
	parentId: string,
	text: string,
	tag: 'h1' | 'h2' | 'h3' | 'p' = 'p',
): Page['nodes'][string] {
	return {
		id,
		name: id,
		type: 'text',
		parentId,
		children: [],
		content: { text, textTag: tag },
		layout: { ...stackLayout(), widthMode: 'hug' },
	};
}

function buttonNode(
	id: string,
	parentId: string,
	label: string,
	variant: 'primary' | 'secondary' | 'ghost' = 'primary',
): Page['nodes'][string] {
	return {
		id,
		name: label,
		type: 'instance',
		parentId,
		children: [],
		instance: { definitionId: 'button', variantKey: variant, props: { children: label } },
		layout: { ...stackLayout(), widthMode: 'hug' },
	};
}

function inputNode(id: string, parentId: string, placeholder: string): Page['nodes'][string] {
	return {
		id,
		name: 'Input',
		type: 'instance',
		parentId,
		children: [],
		instance: { definitionId: 'input', variantKey: 'default', props: { children: placeholder } },
		layout: { ...stackLayout(), widthMode: 'fill' },
	};
}

export type DemoScreenSpec = {
	key: string;
	name: string;
	routePath: string;
	productName: string;
	headline: string;
	body: string;
	primaryCta?: string;
	secondaryCta?: string;
	fieldPlaceholder?: string;
};

/** Minimal phone screen for public flow-map examples (consistent with Hookoh previews). */
export function createDemoFlowScreen(spec: DemoScreenSpec): { page: Page; frame: Frame } {
	const pageId = `page-${spec.key}`;
	const frameId = `frame-${spec.key}`;
	const rootId = `${spec.key}-root`;
	const nodes: Record<string, Page['nodes'][string]> = {
		[rootId]: {
			id: rootId,
			name: 'Root',
			type: 'stack',
			parentId: null,
			children: ['nav', 'hero', 'actions'],
			layout: stackLayout(18, [0, 0, 28, 0]),
		},
		nav: {
			id: 'nav',
			name: 'Nav',
			type: 'row',
			parentId: rootId,
			children: ['logo'],
			layout: { ...stackLayout(8, [12, 16, 8, 16]), mode: 'row', justify: 'space-between', widthMode: 'fill' },
		},
		logo: textNode('logo', 'nav', spec.productName, 'h3'),
		hero: {
			id: 'hero',
			name: 'Hero',
			type: 'section',
			parentId: rootId,
			children: ['headline', 'body'],
			layout: stackLayout(10, [20, 20, 12, 20]),
		},
		headline: textNode('headline', 'hero', spec.headline, 'h1'),
		body: textNode('body', 'hero', spec.body, 'p'),
		actions: {
			id: 'actions',
			name: 'Actions',
			type: 'stack',
			parentId: rootId,
			children: [
				...(spec.fieldPlaceholder ? ['field'] : []),
				...(spec.primaryCta ? ['primary'] : []),
				...(spec.secondaryCta ? ['secondary'] : []),
			],
			layout: stackLayout(10, [0, 20, 0, 20]),
		},
	};
	if (spec.fieldPlaceholder) {
		nodes.field = inputNode('field', 'actions', spec.fieldPlaceholder);
	}
	if (spec.primaryCta) {
		nodes.primary = buttonNode('primary', 'actions', spec.primaryCta, 'primary');
	}
	if (spec.secondaryCta) {
		nodes.secondary = buttonNode('secondary', 'actions', spec.secondaryCta, 'ghost');
	}

	const page: Page = {
		id: pageId,
		name: spec.name,
		routePath: spec.routePath,
		rootNodeId: rootId,
		nodes,
	};
	const frame: Frame = {
		id: frameId,
		name: spec.name,
		pageId,
		x: 0,
		y: 0,
		width: PHONE_W,
		height: PHONE_H,
		devicePresetId: 'iphone-15',
		heightMode: 'fixed',
		frameSetId: `fs-${pageId}`,
	};
	return { page, frame };
}
