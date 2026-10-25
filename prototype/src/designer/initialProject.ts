import type { ThemeId } from '../theme/themes';
import { CANVAS_ORIGIN, layoutFramesInRow } from './frameLayout';
import { DUPLICATE_TO_DEVICES_DEFAULT } from './devicePresets';
import type { DesignerProject, DesignNode, Frame, Page } from './types';

const PAGE_ID = 'page-home';
const ROOT_ID = 'node-root';

function homeNodes(): Record<string, DesignNode> {
	const baseLayout = {
		mode: 'stack' as const,
		gap: 16,
		padding: [0, 0, 0, 0] as [number, number, number, number],
		align: 'stretch' as const,
		justify: 'start' as const,
		widthMode: 'fill' as const,
		heightMode: 'hug' as const,
	};

	return {
		[ROOT_ID]: {
			id: ROOT_ID,
			name: 'Page root',
			type: 'stack',
			parentId: null,
			children: ['node-nav', 'node-hero', 'node-metrics', 'node-form'],
			layout: { ...baseLayout, padding: [0, 0, 24, 0], gap: 20 },
		},
		'node-nav': {
			id: 'node-nav',
			name: 'Nav',
			type: 'row',
			parentId: ROOT_ID,
			children: ['node-logo', 'node-nav-links'],
			layout: {
				mode: 'row',
				gap: 12,
				padding: [12, 16, 12, 16],
				align: 'center',
				justify: 'space-between',
				widthMode: 'fill',
				heightMode: 'hug',
			},
			overrides: {
				base: { layout: { mode: 'column', align: 'start', gap: 8 } },
				md: { layout: { mode: 'row', justify: 'space-between', align: 'center' } },
			},
		},
		'node-logo': {
			id: 'node-logo',
			name: 'Logo',
			type: 'text',
			parentId: 'node-nav',
			children: [],
			content: { text: 'Acme Analytics', textTag: 'h3' },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
		'node-nav-links': {
			id: 'node-nav-links',
			name: 'Nav links',
			type: 'row',
			parentId: 'node-nav',
			children: ['node-link-1', 'node-link-2', 'node-btn-nav'],
			layout: {
				mode: 'row',
				gap: 8,
				padding: [0, 0, 0, 0],
				align: 'center',
				justify: 'start',
				widthMode: 'hug',
				heightMode: 'hug',
			},
			overrides: {
				base: { layout: { mode: 'column', widthMode: 'fill' } },
				md: { layout: { mode: 'row' } },
			},
		},
		'node-link-1': {
			id: 'node-link-1',
			name: 'Dashboard',
			type: 'instance',
			parentId: 'node-nav-links',
			children: [],
			instance: { definitionId: 'button', variantKey: 'ghost', props: { children: 'Dashboard' } },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
		'node-link-2': {
			id: 'node-link-2',
			name: 'Reports',
			type: 'instance',
			parentId: 'node-nav-links',
			children: [],
			instance: { definitionId: 'button', variantKey: 'ghost', props: { children: 'Reports' } },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
		'node-btn-nav': {
			id: 'node-btn-nav',
			name: 'Upgrade',
			type: 'instance',
			parentId: 'node-nav-links',
			children: [],
			instance: { definitionId: 'button', variantKey: 'primary', props: { children: 'Upgrade' } },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
		'node-hero': {
			id: 'node-hero',
			name: 'Hero',
			type: 'section',
			parentId: ROOT_ID,
			children: ['node-hero-title', 'node-hero-lead', 'node-hero-actions', 'node-hero-alert'],
			layout: { ...baseLayout, padding: [16, 16, 16, 16], gap: 12 },
		},
		'node-hero-title': {
			id: 'node-hero-title',
			name: 'Hero title',
			type: 'text',
			parentId: 'node-hero',
			children: [],
			content: { text: 'Understand your growth', textTag: 'h1' },
			layout: baseLayout,
		},
		'node-hero-lead': {
			id: 'node-hero-lead',
			name: 'Hero lead',
			type: 'text',
			parentId: 'node-hero',
			children: [],
			content: {
				text: 'Real-time dashboards and signup funnels — styled with your Bareframe theme tokens.',
				textTag: 'p',
			},
			layout: baseLayout,
		},
		'node-hero-actions': {
			id: 'node-hero-actions',
			name: 'Hero actions',
			type: 'row',
			parentId: 'node-hero',
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
				md: { layout: { mode: 'row' } },
			},
		},
		'node-btn-primary': {
			id: 'node-btn-primary',
			name: 'Primary CTA',
			type: 'instance',
			parentId: 'node-hero-actions',
			children: [],
			instance: { definitionId: 'button', variantKey: 'primary', props: { children: 'Get started' } },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
		'node-btn-secondary': {
			id: 'node-btn-secondary',
			name: 'Secondary',
			type: 'instance',
			parentId: 'node-hero-actions',
			children: [],
			instance: { definitionId: 'button', variantKey: 'secondary', props: { children: 'View demo' } },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
		'node-hero-alert': {
			id: 'node-hero-alert',
			name: 'Alert',
			type: 'instance',
			parentId: 'node-hero',
			children: [],
			instance: {
				definitionId: 'alert',
				variantKey: 'default',
				props: { children: 'New: export frames to TSX with @bareframe/react imports.' },
			},
			layout: baseLayout,
		},
		'node-metrics': {
			id: 'node-metrics',
			name: 'Metrics grid',
			type: 'row',
			parentId: ROOT_ID,
			children: ['node-card-1', 'node-card-2', 'node-card-3'],
			layout: {
				mode: 'row',
				gap: 12,
				padding: [0, 16, 0, 16],
				align: 'stretch',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
			overrides: {
				base: { layout: { mode: 'column' } },
				md: { layout: { mode: 'row' } },
				lg: { layout: { mode: 'row', gap: 16 } },
			},
		},
		'node-card-1': {
			id: 'node-card-1',
			name: 'Signups',
			type: 'instance',
			parentId: 'node-metrics',
			children: [],
			instance: {
				definitionId: 'card',
				variantKey: 'elevated',
				props: { title: 'Signups', children: '+12% vs last week · 4,280 total' },
			},
			layout: { ...baseLayout, widthMode: 'fill' },
		},
		'node-card-2': {
			id: 'node-card-2',
			name: 'Conversion',
			type: 'instance',
			parentId: 'node-metrics',
			children: [],
			instance: {
				definitionId: 'card',
				variantKey: 'elevated',
				props: { title: 'Conversion', children: '3.8% trial → paid' },
			},
			layout: { ...baseLayout, widthMode: 'fill' },
		},
		'node-card-3': {
			id: 'node-card-3',
			name: 'MRR',
			type: 'instance',
			parentId: 'node-metrics',
			children: [],
			instance: {
				definitionId: 'card',
				variantKey: 'elevated',
				props: { title: 'MRR', children: '$128k · 18 teams' },
			},
			layout: { ...baseLayout, widthMode: 'fill' },
		},
		'node-form': {
			id: 'node-form',
			name: 'Lead form',
			type: 'section',
			parentId: ROOT_ID,
			children: ['node-form-title', 'node-form-row'],
			layout: { ...baseLayout, padding: [0, 16, 16, 16], gap: 10 },
		},
		'node-form-title': {
			id: 'node-form-title',
			name: 'Form title',
			type: 'text',
			parentId: 'node-form',
			children: [],
			content: { text: 'Get the report', textTag: 'h2' },
			layout: baseLayout,
		},
		'node-form-row': {
			id: 'node-form-row',
			name: 'Form fields',
			type: 'row',
			parentId: 'node-form',
			children: ['node-email', 'node-submit'],
			layout: {
				mode: 'row',
				gap: 8,
				padding: [0, 0, 0, 0],
				align: 'end',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
			overrides: {
				base: { layout: { mode: 'column', align: 'stretch' } },
				md: { layout: { mode: 'row', align: 'end' } },
			},
		},
		'node-email': {
			id: 'node-email',
			name: 'Email',
			type: 'instance',
			parentId: 'node-form-row',
			children: [],
			instance: {
				definitionId: 'input',
				variantKey: 'default',
				props: { children: 'you@company.com' },
			},
			layout: { ...baseLayout, widthMode: 'fill' },
		},
		'node-submit': {
			id: 'node-submit',
			name: 'Submit',
			type: 'instance',
			parentId: 'node-form-row',
			children: [],
			instance: { definitionId: 'button', variantKey: 'primary', props: { children: 'Send' } },
			layout: { ...baseLayout, widthMode: 'hug' },
		},
	};
}

function createFrame(
	id: string,
	pageId: string,
	presetId: string,
	width: number,
	height: number,
	frameSetId: string,
): Frame {
	return {
		id,
		name: 'Home',
		pageId,
		x: 0,
		y: 0,
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
		createFrame('frame-iphone', PAGE_ID, 'iphone-15', 393, 852, frameSetId),
		createFrame('frame-ipad', PAGE_ID, 'ipad-mini', 768, 1024, frameSetId),
		createFrame('frame-desktop', PAGE_ID, 'desktop-1440', 1440, 900, frameSetId),
	];
	layoutFramesInRow(frames, CANVAS_ORIGIN, CANVAS_ORIGIN);

	const phone = frames[0];
	const defaultZoom = 0.6;
	const viewW = 1100;
	const viewH = 640;
	const cx = phone.x + phone.width / 2;
	const cy = phone.y + phone.height / 2;

	return {
		id: 'proj-1',
		name: 'Onboarding flow',
		defaultThemeId: defaultTheme,
		pages: [page],
		frames,
		trials: [],
		customTokenOverrides: {},
		canvas: {
			zoom: defaultZoom,
			x: viewW / 2 - cx * defaultZoom,
			y: viewH / 2 - cy * defaultZoom,
		},
	};
}

export { PAGE_ID, DUPLICATE_TO_DEVICES_DEFAULT };
