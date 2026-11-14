import type { ThemeId } from '../theme/themes';
import type { ProductBrief, ScreenBrief } from '@bareframe/designer-core';
import type { MatrixLayout } from './frameLayout';

export type { ProductBrief, ScreenBrief };

export type BreakpointId = 'base' | 'sm' | 'md' | 'lg' | 'xl';

export type DeviceCategory = 'phone' | 'tablet' | 'desktop' | 'custom';

export type DevicePreset = {
	id: string;
	label: string;
	width: number;
	height: number;
	category: DeviceCategory;
	breakpointId: BreakpointId;
};

export type LayoutMode = 'free' | 'stack' | 'row' | 'column' | 'grid';

export type SizingMode = 'fixed' | 'fill' | 'hug' | 'percent';

export type LayoutModel = {
	mode: LayoutMode;
	gap: number;
	padding: [number, number, number, number];
	align: 'start' | 'center' | 'end' | 'stretch';
	justify: 'start' | 'center' | 'end' | 'space-between';
	widthMode: SizingMode;
	heightMode: SizingMode;
	width?: number;
	height?: number;
	minWidth?: number;
	maxWidth?: number;
};

export type StyleModel = {
	fillToken?: string;
	textColorToken?: string;
	radius?: number;
};

export type DesignNode = {
	id: string;
	name: string;
	type:
		| 'frame-root'
		| 'stack'
		| 'row'
		| 'column'
		| 'section'
		| 'text'
		| 'instance'
		| 'image';
	parentId: string | null;
	children: string[];
	instance?: {
		definitionId: string;
		variantKey: string;
		props?: Record<string, unknown>;
	};
	image?: {
		assetId: string;
		alt?: string;
	};
	content?: { text?: string; textTag?: 'h1' | 'h2' | 'h3' | 'p' };
	layout: LayoutModel;
	style?: StyleModel;
	overrides?: Partial<Record<BreakpointId, { layout?: Partial<LayoutModel> }>>;
	visibility?: Partial<Record<BreakpointId, boolean>>;
};

export type Page = {
	id: string;
	name: string;
	routePath: string;
	rootNodeId: string;
	nodes: Record<string, DesignNode>;
	/** What this screen is for, from "Describe your product". */
	brief?: ScreenBrief;
};

export type Frame = {
	id: string;
	name: string;
	pageId: string;
	x: number;
	y: number;
	width: number;
	height: number;
	devicePresetId: string;
	heightMode: 'fixed' | 'hug';
	themeId?: ThemeId;
	trialId?: string;
	frameSetId?: string;
	ghost?: boolean;
	readOnly?: boolean;
	landscape?: boolean;
};

export type StyleTrial = {
	id: string;
	name: string;
	pageId: string;
	baseThemeId: ThemeId;
	tokenOverrides: Record<string, string>;
	variantSwaps: { nodeId: string; variantKey: string }[];
	status: 'draft' | 'promoted' | 'discarded';
};

export type CompareMode =
	| { kind: 'devices'; pageId: string; tempFrameIds: string[] }
	| { kind: 'themes'; sourceFrameId: string; themeIds: ThemeId[]; ghostFrameIds: string[] }
	| {
			kind: 'matrix';
			pageId: string;
			themeIds: ThemeId[];
			devicePresetIds: string[];
			ghostFrameIds: string[];
			layout?: MatrixLayout;
		}
	| { kind: 'trials'; pageId: string; frameIds: string[] };

export type Connector = {
	id: string;
	fromFrameId: string;
	toFrameId: string;
	label?: string;
	trigger?: string;
};

export type Annotation = {
	id: string;
	frameId: string;
	kind: 'callout' | 'arrow' | 'box' | 'note';
	target:
		| { kind: 'node'; nodeId: string }
		| { kind: 'rect'; x: number; y: number; w: number; h: number };
	index?: number;
	text: string;
};

export type DesignerProject = {
	id: string;
	name: string;
	defaultThemeId: ThemeId;
	pages: Page[];
	frames: Frame[];
	trials: StyleTrial[];
	customTokenOverrides: Record<string, string>;
	canvas: { x: number; y: number; zoom: number };
	connectors: Connector[];
	annotations: Annotation[];
	/** When set, prototype player starts on this screen instead of inferring from connectors. */
	prototypeEntryFrameId?: string | null;
	/** The description the flow was generated from. */
	productBrief?: ProductBrief;
};

export type EditScope = 'base' | 'breakpoint';

export type DesignerUiState = {
	activePageId: string;
	selectedFrameId: string | null;
	selectedNodeId: string | null;
	editScope: EditScope;
	compare: CompareMode | null;
	assistantOpen: boolean;
	panning: boolean;
	/** Viewport camera; kept out of undo/history and not deep-cloned on pan/zoom. */
	camera: { x: number; y: number; zoom: number };
	mobilePanel: 'none' | 'left' | 'right';
};

export type DesignerState = {
	project: DesignerProject;
	ui: DesignerUiState;
	history: DesignerProject[];
	historyIndex: number;
};
