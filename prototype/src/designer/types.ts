import type { ThemeId } from '../theme/themes';

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
		| 'instance';
	parentId: string | null;
	children: string[];
	instance?: {
		definitionId: string;
		variantKey: string;
		props?: Record<string, unknown>;
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
	| { kind: 'matrix'; pageId: string; themeIds: ThemeId[]; devicePresetIds: string[]; ghostFrameIds: string[] }
	| { kind: 'trials'; pageId: string; frameIds: string[] };

export type DesignerProject = {
	id: string;
	name: string;
	defaultThemeId: ThemeId;
	pages: Page[];
	frames: Frame[];
	trials: StyleTrial[];
	customTokenOverrides: Record<string, string>;
	canvas: { x: number; y: number; zoom: number };
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
};

export type DesignerState = {
	project: DesignerProject;
	ui: DesignerUiState;
	history: DesignerProject[];
	historyIndex: number;
};
