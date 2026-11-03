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

function rowLayout(gap = 8, padding: [number, number, number, number] = [0, 0, 0, 0]) {
	return {
		mode: 'row' as const,
		gap,
		padding,
		align: 'center' as const,
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

function cardNode(id: string, parentId: string, title: string, body: string): Page['nodes'][string] {
	return {
		id,
		name: title,
		type: 'instance',
		parentId,
		children: [],
		instance: { definitionId: 'card', variantKey: 'elevated', props: { title, children: body } },
		layout: { ...stackLayout(), widthMode: 'fill' },
	};
}

function buildPage(
	id: string,
	name: string,
	routePath: string,
	rootId: string,
	nodes: Record<string, Page['nodes'][string]>,
): Page {
	return { id, name, routePath, rootNodeId: rootId, nodes };
}

function phoneFrame(pageId: string, frameId: string, name: string): Frame {
	return {
		id: frameId,
		name,
		pageId,
		x: 0,
		y: 0,
		width: PHONE_W,
		height: PHONE_H,
		devicePresetId: 'iphone-15',
		heightMode: 'fixed',
		frameSetId: `fs-${pageId}`,
	};
}

const landingRoot = 'landing-root';
const landingNodes: Record<string, Page['nodes'][string]> = {
	[landingRoot]: {
		id: landingRoot,
		name: 'Root',
		type: 'stack',
		parentId: null,
		children: ['landing-nav', 'landing-hero', 'landing-cta'],
		layout: stackLayout(20, [0, 0, 24, 0]),
	},
	'landing-nav': {
		id: 'landing-nav',
		name: 'Nav',
		type: 'row',
		parentId: landingRoot,
		children: ['landing-logo', 'landing-signin'],
		layout: { ...rowLayout(12, [12, 16, 12, 16]), justify: 'space-between', widthMode: 'fill' },
	},
	'landing-logo': textNode('landing-logo', 'landing-nav', 'Hookoh', 'h3'),
	'landing-signin': buttonNode('landing-signin', 'landing-nav', 'Sign in', 'ghost'),
	'landing-hero': {
		id: 'landing-hero',
		name: 'Hero',
		type: 'section',
		parentId: landingRoot,
		children: ['landing-badge', 'landing-h1', 'landing-lead'],
		layout: stackLayout(12, [24, 20, 16, 20]),
	},
	'landing-badge': {
		id: 'landing-badge',
		name: 'Badge',
		type: 'instance',
		parentId: 'landing-hero',
		children: [],
		instance: { definitionId: 'badge', variantKey: 'default', props: { children: 'For busy founders' } },
		layout: stackLayout(),
	},
	'landing-h1': textNode('landing-h1', 'landing-hero', 'Ship your social queue in minutes', 'h1'),
	'landing-lead': textNode(
		'landing-lead',
		'landing-hero',
		'Hookoh drafts, schedules, and learns your voice — so you post consistently without the grind.',
		'p',
	),
	'landing-cta': {
		id: 'landing-cta',
		name: 'CTA',
		type: 'stack',
		parentId: landingRoot,
		children: ['landing-email', 'landing-primary'],
		layout: stackLayout(10, [0, 20, 0, 20]),
	},
	'landing-email': inputNode('landing-email', 'landing-cta', 'you@startup.com'),
	'landing-primary': buttonNode('landing-primary', 'landing-cta', 'Email me a sign-in code', 'primary'),
};

const codeRoot = 'code-root';
const codeNodes: Record<string, Page['nodes'][string]> = {
	[codeRoot]: {
		id: codeRoot,
		name: 'Root',
		type: 'stack',
		parentId: null,
		children: ['code-header', 'code-form'],
		layout: stackLayout(24, [32, 20, 24, 20]),
	},
	'code-header': {
		id: 'code-header',
		name: 'Header',
		type: 'stack',
		parentId: codeRoot,
		children: ['code-h1', 'code-sub'],
		layout: stackLayout(8),
	},
	'code-h1': textNode('code-h1', 'code-header', 'Check your inbox', 'h1'),
	'code-sub': textNode('code-sub', 'code-header', 'We sent a 6-digit code to you@startup.com', 'p'),
	'code-form': {
		id: 'code-form',
		name: 'Form',
		type: 'section',
		parentId: codeRoot,
		children: ['code-input', 'code-submit'],
		layout: stackLayout(12, [16, 16, 16, 16]),
	},
	'code-input': inputNode('code-input', 'code-form', '••••••'),
	'code-submit': buttonNode('code-submit', 'code-form', 'Enter code', 'primary'),
};

const homeRoot = 'home-root';
const homeNodes: Record<string, Page['nodes'][string]> = {
	[homeRoot]: {
		id: homeRoot,
		name: 'Root',
		type: 'stack',
		parentId: null,
		children: ['home-nav', 'home-queue'],
		layout: stackLayout(16, [0, 0, 24, 0]),
	},
	'home-nav': {
		id: 'home-nav',
		name: 'Nav',
		type: 'row',
		parentId: homeRoot,
		children: ['home-logo', 'home-compose'],
		layout: { ...rowLayout(8, [12, 16, 12, 16]), justify: 'space-between', widthMode: 'fill' },
	},
	'home-logo': textNode('home-logo', 'home-nav', 'Hookoh', 'h3'),
	'home-compose': buttonNode('home-compose', 'home-nav', 'Compose', 'primary'),
	'home-queue': {
		id: 'home-queue',
		name: 'Queue',
		type: 'stack',
		parentId: homeRoot,
		children: ['home-title', 'home-card-1', 'home-card-2'],
		layout: stackLayout(12, [0, 16, 0, 16]),
	},
	'home-title': textNode('home-title', 'home-queue', 'This week’s queue', 'h2'),
	'home-card-1': cardNode(
		'home-card-1',
		'home-queue',
		'Tue · Product launch',
		'Draft ready · LinkedIn + X · tone: confident',
	),
	'home-card-2': cardNode(
		'home-card-2',
		'home-queue',
		'Thu · Founder story',
		'Scheduled · Instagram · awaiting your tweak',
	),
};

const composeRoot = 'compose-root';
const composeNodes: Record<string, Page['nodes'][string]> = {
	[composeRoot]: {
		id: composeRoot,
		name: 'Root',
		type: 'stack',
		parentId: null,
		children: ['compose-header', 'compose-editor', 'compose-actions'],
		layout: stackLayout(16, [16, 16, 24, 16]),
	},
	'compose-header': textNode('compose-header', composeRoot, 'New post', 'h1'),
	'compose-editor': cardNode(
		'compose-editor',
		composeRoot,
		'AI draft',
		'Just shipped our booking flow — barbers can finally ditch the phone tag. What would you post?',
	),
	'compose-actions': {
		id: 'compose-actions',
		name: 'Actions',
		type: 'row',
		parentId: composeRoot,
		children: ['compose-regen', 'compose-schedule'],
		layout: { ...rowLayout(8), justify: 'start' },
	},
	'compose-regen': buttonNode('compose-regen', 'compose-actions', 'Regenerate', 'secondary'),
	'compose-schedule': buttonNode('compose-schedule', 'compose-actions', 'Schedule', 'primary'),
};

const PAGES: Record<string, { page: Page; frame: Frame }> = {
	scr_landing: {
		page: buildPage('page-landing', 'Landing', '/', landingRoot, landingNodes),
		frame: phoneFrame('page-landing', 'frame-landing', 'Landing'),
	},
	scr_code: {
		page: buildPage('page-code', 'Sign-in code', '/sign-in', codeRoot, codeNodes),
		frame: phoneFrame('page-code', 'frame-code', 'Sign-in code'),
	},
	scr_home: {
		page: buildPage('page-home', 'Home queue', '/home', homeRoot, homeNodes),
		frame: phoneFrame('page-home', 'frame-home', 'Home queue'),
	},
	scr_compose: {
		page: buildPage('page-compose', 'Compose', '/compose', composeRoot, composeNodes),
		frame: phoneFrame('page-compose', 'frame-compose', 'Compose'),
	},
};

export function getHookohDemoPreview(screenId: string): { page: Page; frame: Frame } {
	return PAGES[screenId] ?? PAGES.scr_landing;
}
