import type { ThemeId } from '../theme/themes';
import { DUPLICATE_TO_DEVICES_DEFAULT } from './devicePresets';
import type { DesignerProject, DesignNode, Frame, Page } from './types';

const PAGE_ID = 'page-home';
const ROOT_ID = 'node-root';
const ROW_ID = 'node-hero-row';

function homeNodes(): Record<string, DesignNode> {
	return {
		[ROOT_ID]: {
			id: ROOT_ID,
			name: 'Page root',
			type: 'stack',
			parentId: null,
			children: ['node-title', ROW_ID, 'node-card'],
			layout: {
				mode: 'stack',
				gap: 16,
				padding: [16, 16, 16, 16],
				align: 'stretch',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
		},
		'node-title': {
			id: 'node-title',
			name: 'Heading',
			type: 'text',
			parentId: ROOT_ID,
			children: [],
			content: { text: 'Welcome home', textTag: 'h1' },
			layout: {
				mode: 'stack',
				gap: 0,
				padding: [0, 0, 0, 0],
				align: 'start',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
		},
		[ROW_ID]: {
			id: ROW_ID,
			name: 'Actions row',
			type: 'row',
			parentId: ROOT_ID,
			children: ['node-btn-primary', 'node-btn-secondary'],
			layout: {
				mode: 'row',
				gap: 12,
				padding: [0, 0, 0, 0],
				align: 'center',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
			overrides: {
				base: { layout: { mode: 'column', gap: 8 } },
				md: { layout: { mode: 'row', gap: 12 } },
			},
		},
		'node-btn-primary': {
			id: 'node-btn-primary',
			name: 'Primary CTA',
			type: 'instance',
			parentId: ROW_ID,
			children: [],
			instance: { definitionId: 'button', variantKey: 'primary', props: { children: 'Get started' } },
			layout: {
				mode: 'stack',
				gap: 0,
				padding: [0, 0, 0, 0],
				align: 'start',
				justify: 'start',
				widthMode: 'hug',
				heightMode: 'hug',
			},
		},
		'node-btn-secondary': {
			id: 'node-btn-secondary',
			name: 'Secondary',
			type: 'instance',
			parentId: ROW_ID,
			children: [],
			instance: { definitionId: 'button', variantKey: 'secondary', props: { children: 'Learn more' } },
			layout: {
				mode: 'stack',
				gap: 0,
				padding: [0, 0, 0, 0],
				align: 'start',
				justify: 'start',
				widthMode: 'hug',
				heightMode: 'hug',
			},
		},
		'node-card': {
			id: 'node-card',
			name: 'Highlight card',
			type: 'instance',
			parentId: ROOT_ID,
			children: [],
			instance: {
				definitionId: 'card',
				variantKey: 'elevated',
				props: { title: 'This week', children: 'Signups are up 12% across all regions.' },
			},
			layout: {
				mode: 'stack',
				gap: 0,
				padding: [0, 0, 0, 0],
				align: 'stretch',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
		},
	};
}

function createFrame(
	id: string,
	pageId: string,
	presetId: string,
	width: number,
	height: number,
	x: number,
	y: number,
	frameSetId: string,
): Frame {
	return {
		id,
		name: 'Home',
		pageId,
		x,
		y,
		width,
		height,
		devicePresetId: presetId,
		heightMode: 'fixed',
		frameSetId,
	};
}

export function createInitialProject(defaultTheme: ThemeId = 'light'): DesignerProject {
	const page: Page = {
		id: PAGE_ID,
		name: 'Home',
		routePath: '/',
		rootNodeId: ROOT_ID,
		nodes: homeNodes(),
	};

	const frameSetId = 'fs-home-1';
	const frames: Frame[] = [
		createFrame('frame-iphone', PAGE_ID, 'iphone-15', 393, 852, 40, 40, frameSetId),
		createFrame('frame-ipad', PAGE_ID, 'ipad-mini', 768, 1024, 40 + 393 + 56, 40, frameSetId),
		createFrame(
			'frame-desktop',
			PAGE_ID,
			'desktop-1440',
			1440,
			900,
			40 + 393 + 56 + 768 + 56,
			40,
			frameSetId,
		),
	];

	return {
		id: 'proj-1',
		name: 'Onboarding flow',
		defaultThemeId: defaultTheme,
		pages: [page],
		frames,
		trials: [],
		customTokenOverrides: {},
		canvas: { x: 80, y: 60, zoom: 0.45 },
	};
}

export { PAGE_ID, DUPLICATE_TO_DEVICES_DEFAULT };
