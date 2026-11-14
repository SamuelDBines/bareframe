export type ThemeId = string;

export type BreakpointId = 'base' | 'sm' | 'md' | 'lg' | 'xl';

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
	/** What this screen is for, from "Describe your product" (or edited by hand). */
	brief?: ScreenBrief;
};

export type ScreenBrief = {
	/** Flow screen id; stays stable across regenerations so designs are kept. */
	key: string;
	purpose: string;
	keyContent: string[];
	states: ('default' | 'empty' | 'loading' | 'error' | 'success')[];
};

export type ProductBrief = {
	description: string;
	platform: 'mobile' | 'tablet' | 'desktop' | 'all';
	updatedAt: string;
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

export type Connector = {
	id: string;
	fromFrameId: string;
	toFrameId: string;
	label?: string;
	trigger?: string;
	/** When set, prototype navigation is tied to this designed node (button, etc.). */
	fromNodeId?: string;
};

export type AnnotationTarget =
	| { kind: 'node'; nodeId: string }
	| { kind: 'rect'; x: number; y: number; w: number; h: number };

export type Annotation = {
	id: string;
	frameId: string;
	kind: 'callout' | 'arrow' | 'box' | 'note';
	target: AnnotationTarget;
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

export type ProjectDocument = {
	schemaVersion: 1;
	project: DesignerProject;
};
