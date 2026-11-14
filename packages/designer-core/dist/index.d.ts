import { z } from 'zod';

type ThemeId = string;
type BreakpointId = 'base' | 'sm' | 'md' | 'lg' | 'xl';
type LayoutMode = 'free' | 'stack' | 'row' | 'column' | 'grid';
type SizingMode = 'fixed' | 'fill' | 'hug' | 'percent';
type LayoutModel = {
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
type StyleModel = {
    fillToken?: string;
    textColorToken?: string;
    radius?: number;
};
type DesignNode = {
    id: string;
    name: string;
    type: 'frame-root' | 'stack' | 'row' | 'column' | 'section' | 'text' | 'instance' | 'image';
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
    content?: {
        text?: string;
        textTag?: 'h1' | 'h2' | 'h3' | 'p';
    };
    layout: LayoutModel;
    style?: StyleModel;
    overrides?: Partial<Record<BreakpointId, {
        layout?: Partial<LayoutModel>;
    }>>;
    visibility?: Partial<Record<BreakpointId, boolean>>;
};
type Page = {
    id: string;
    name: string;
    routePath: string;
    rootNodeId: string;
    nodes: Record<string, DesignNode>;
    /** What this screen is for, from "Describe your product" (or edited by hand). */
    brief?: ScreenBrief;
};
type ScreenBrief = {
    /** Flow screen id; stays stable across regenerations so designs are kept. */
    key: string;
    purpose: string;
    keyContent: string[];
    states: ('default' | 'empty' | 'loading' | 'error' | 'success')[];
};
type ProductBrief = {
    description: string;
    platform: 'mobile' | 'tablet' | 'desktop' | 'all';
    updatedAt: string;
};
type Frame = {
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
type StyleTrial = {
    id: string;
    name: string;
    pageId: string;
    baseThemeId: ThemeId;
    tokenOverrides: Record<string, string>;
    variantSwaps: {
        nodeId: string;
        variantKey: string;
    }[];
    status: 'draft' | 'promoted' | 'discarded';
};
type Connector = {
    id: string;
    fromFrameId: string;
    toFrameId: string;
    label?: string;
    trigger?: string;
};
type AnnotationTarget = {
    kind: 'node';
    nodeId: string;
} | {
    kind: 'rect';
    x: number;
    y: number;
    w: number;
    h: number;
};
type Annotation = {
    id: string;
    frameId: string;
    kind: 'callout' | 'arrow' | 'box' | 'note';
    target: AnnotationTarget;
    index?: number;
    text: string;
};
type DesignerProject = {
    id: string;
    name: string;
    defaultThemeId: ThemeId;
    pages: Page[];
    frames: Frame[];
    trials: StyleTrial[];
    customTokenOverrides: Record<string, string>;
    canvas: {
        x: number;
        y: number;
        zoom: number;
    };
    connectors: Connector[];
    annotations: Annotation[];
    /** When set, prototype player starts on this screen instead of inferring from connectors. */
    prototypeEntryFrameId?: string | null;
    /** The description the flow was generated from. */
    productBrief?: ProductBrief;
};
type ProjectDocument = {
    schemaVersion: 1;
    project: DesignerProject;
};

declare const projectCommandSchema: z.ZodDiscriminatedUnion<"type", [z.ZodObject<{
    type: z.ZodLiteral<"add_frame">;
    pageId: z.ZodOptional<z.ZodString>;
    presetId: z.ZodOptional<z.ZodString>;
    name: z.ZodOptional<z.ZodString>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    themeId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    type: "add_frame";
    pageId?: string | undefined;
    presetId?: string | undefined;
    name?: string | undefined;
    x?: number | undefined;
    y?: number | undefined;
    themeId?: string | null | undefined;
}, {
    type: "add_frame";
    pageId?: string | undefined;
    presetId?: string | undefined;
    name?: string | undefined;
    x?: number | undefined;
    y?: number | undefined;
    themeId?: string | null | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"add_screen">;
    pageId: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    routePath: z.ZodOptional<z.ZodString>;
    presetId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "add_screen";
    name: string;
    pageId?: string | undefined;
    presetId?: string | undefined;
    routePath?: string | undefined;
}, {
    type: "add_screen";
    name: string;
    pageId?: string | undefined;
    presetId?: string | undefined;
    routePath?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"create_canvas">;
    name: z.ZodString;
    routePath: z.ZodOptional<z.ZodString>;
    presetId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "create_canvas";
    name: string;
    presetId?: string | undefined;
    routePath?: string | undefined;
}, {
    type: "create_canvas";
    name: string;
    presetId?: string | undefined;
    routePath?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"add_component">;
    pageId: z.ZodString;
    parentNodeId: z.ZodString;
    slug: z.ZodString;
    variantKey: z.ZodOptional<z.ZodString>;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    index: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "add_component";
    pageId: string;
    parentNodeId: string;
    slug: string;
    variantKey?: string | undefined;
    props?: Record<string, unknown> | undefined;
    index?: number | undefined;
}, {
    type: "add_component";
    pageId: string;
    parentNodeId: string;
    slug: string;
    variantKey?: string | undefined;
    props?: Record<string, unknown> | undefined;
    index?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"add_image_node">;
    pageId: z.ZodString;
    parentNodeId: z.ZodString;
    assetId: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    alt: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "add_image_node";
    pageId: string;
    parentNodeId: string;
    assetId: string;
    name?: string | undefined;
    alt?: string | undefined;
}, {
    type: "add_image_node";
    pageId: string;
    parentNodeId: string;
    assetId: string;
    name?: string | undefined;
    alt?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"add_connector">;
    fromFrameId: z.ZodString;
    toFrameId: z.ZodString;
    label: z.ZodOptional<z.ZodString>;
    trigger: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "add_connector";
    fromFrameId: string;
    toFrameId: string;
    label?: string | undefined;
    trigger?: string | undefined;
}, {
    type: "add_connector";
    fromFrameId: string;
    toFrameId: string;
    label?: string | undefined;
    trigger?: string | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"add_annotation">;
    frameId: z.ZodString;
    kind: z.ZodEnum<["callout", "arrow", "box", "note"]>;
    target: z.ZodUnion<[z.ZodObject<{
        kind: z.ZodLiteral<"node">;
        nodeId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        kind: "node";
        nodeId: string;
    }, {
        kind: "node";
        nodeId: string;
    }>, z.ZodObject<{
        kind: z.ZodLiteral<"rect">;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        x: number;
        y: number;
        kind: "rect";
        w: number;
        h: number;
    }, {
        x: number;
        y: number;
        kind: "rect";
        w: number;
        h: number;
    }>]>;
    text: z.ZodString;
    index: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    text: string;
    type: "add_annotation";
    frameId: string;
    kind: "callout" | "arrow" | "box" | "note";
    target: {
        kind: "node";
        nodeId: string;
    } | {
        x: number;
        y: number;
        kind: "rect";
        w: number;
        h: number;
    };
    index?: number | undefined;
}, {
    text: string;
    type: "add_annotation";
    frameId: string;
    kind: "callout" | "arrow" | "box" | "note";
    target: {
        kind: "node";
        nodeId: string;
    } | {
        x: number;
        y: number;
        kind: "rect";
        w: number;
        h: number;
    };
    index?: number | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"update_node">;
    pageId: z.ZodString;
    nodeId: z.ZodString;
    layout: z.ZodOptional<z.ZodObject<{
        mode: z.ZodOptional<z.ZodEnum<["free", "stack", "row", "column", "grid"]>>;
        gap: z.ZodOptional<z.ZodNumber>;
        padding: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber, z.ZodNumber, z.ZodNumber], null>>;
        align: z.ZodOptional<z.ZodEnum<["start", "center", "end", "stretch"]>>;
        justify: z.ZodOptional<z.ZodEnum<["start", "center", "end", "space-between"]>>;
        widthMode: z.ZodOptional<z.ZodEnum<["fixed", "fill", "hug", "percent"]>>;
        heightMode: z.ZodOptional<z.ZodEnum<["fixed", "fill", "hug", "percent"]>>;
        width: z.ZodOptional<z.ZodNumber>;
        height: z.ZodOptional<z.ZodNumber>;
        minWidth: z.ZodOptional<z.ZodNumber>;
        maxWidth: z.ZodOptional<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        mode?: "free" | "stack" | "row" | "column" | "grid" | undefined;
        gap?: number | undefined;
        padding?: [number, number, number, number] | undefined;
        align?: "start" | "center" | "end" | "stretch" | undefined;
        justify?: "start" | "center" | "end" | "space-between" | undefined;
        widthMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        heightMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
    }, {
        mode?: "free" | "stack" | "row" | "column" | "grid" | undefined;
        gap?: number | undefined;
        padding?: [number, number, number, number] | undefined;
        align?: "start" | "center" | "end" | "stretch" | undefined;
        justify?: "start" | "center" | "end" | "space-between" | undefined;
        widthMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        heightMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
    }>>;
    content: z.ZodOptional<z.ZodObject<{
        text: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        text?: string | undefined;
    }, {
        text?: string | undefined;
    }>>;
    variantKey: z.ZodOptional<z.ZodString>;
    props: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    name: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    type: "update_node";
    pageId: string;
    nodeId: string;
    name?: string | undefined;
    variantKey?: string | undefined;
    props?: Record<string, unknown> | undefined;
    layout?: {
        mode?: "free" | "stack" | "row" | "column" | "grid" | undefined;
        gap?: number | undefined;
        padding?: [number, number, number, number] | undefined;
        align?: "start" | "center" | "end" | "stretch" | undefined;
        justify?: "start" | "center" | "end" | "space-between" | undefined;
        widthMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        heightMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
    } | undefined;
    content?: {
        text?: string | undefined;
    } | undefined;
}, {
    type: "update_node";
    pageId: string;
    nodeId: string;
    name?: string | undefined;
    variantKey?: string | undefined;
    props?: Record<string, unknown> | undefined;
    layout?: {
        mode?: "free" | "stack" | "row" | "column" | "grid" | undefined;
        gap?: number | undefined;
        padding?: [number, number, number, number] | undefined;
        align?: "start" | "center" | "end" | "stretch" | undefined;
        justify?: "start" | "center" | "end" | "space-between" | undefined;
        widthMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        heightMode?: "fixed" | "fill" | "hug" | "percent" | undefined;
        width?: number | undefined;
        height?: number | undefined;
        minWidth?: number | undefined;
        maxWidth?: number | undefined;
    } | undefined;
    content?: {
        text?: string | undefined;
    } | undefined;
}>, z.ZodObject<{
    type: z.ZodLiteral<"delete_node">;
    pageId: z.ZodString;
    nodeId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    type: "delete_node";
    pageId: string;
    nodeId: string;
}, {
    type: "delete_node";
    pageId: string;
    nodeId: string;
}>]>;
type ProjectCommand = z.infer<typeof projectCommandSchema>;
type CommandContext = {
    isValidComponentSlug: (slug: string) => boolean;
    newId: (prefix: string) => string;
};
type CommandResult = {
    document: ProjectDocument;
    effects: Record<string, unknown>;
};
declare class CommandError extends Error {
    code: string;
    constructor(message: string, code: string);
}
declare function parseProjectCommand(input: unknown): ProjectCommand;
declare function createEmptyProjectDocument(id: string, name: string, themeId: string | undefined, ctx: Pick<CommandContext, 'newId'>): ProjectDocument;
declare function applyProjectCommand(document: ProjectDocument, command: ProjectCommand, ctx: CommandContext): CommandResult;
type ImportScreenshotShot = {
    assetId: string;
    title?: string;
    url?: string;
};
type ImportScreenshotLink = {
    fromAssetId: string;
    toAssetId: string;
    label?: string;
    trigger?: string;
};
declare function applyImportScreenshots(document: ProjectDocument, shots: ImportScreenshotShot[], links: ImportScreenshotLink[], ctx: CommandContext, opts?: {
    pageId?: string;
}): CommandResult;

type DevicePreset = {
    id: string;
    label: string;
    width: number;
    height: number;
};
declare const DEFAULT_DEVICE_PRESETS: DevicePreset[];
declare function getDevicePreset(id: string): DevicePreset | undefined;
declare function deviceDimensions(preset: DevicePreset, landscape?: boolean): {
    width: number;
    height: number;
};

declare function autoPlaceFrame(allFrames: Frame[], width: number, height: number): {
    x: number;
    y: number;
};
/** Flow-map layout: place frames in a horizontal row with gaps. */
declare function layoutFramesInFlowRow(frames: Frame[], startX?: number, startY?: number): void;

/** Visible card width on the flow map (world units). */
declare const FLOW_CARD_WIDTH = 272;
declare const FLOW_THUMB_HEIGHT = 392;
declare const FLOW_LABEL_HEIGHT = 44;
declare const FLOW_CARD_HEIGHT: number;
declare const FLOW_CARD_GAP_X = 200;
declare const FLOW_CARD_GAP_Y = 96;
declare const FLOW_ORIGIN_X = 96;
declare const FLOW_ORIGIN_Y = 88;
type Edge = {
    fromFrameId: string;
    toFrameId: string;
};
/**
 * Layered (left-to-right) layout: each screen goes in the column after the
 * furthest screen that links to it; rows inside a column follow the order of
 * their parents so connectors cross as little as possible. Cycles are broken
 * at the back edge, so "Try again" loops don't push screens rightwards.
 */
declare function layeredFlowLayout(frameIds: string[], edges: Edge[], startX?: number, startY?: number): Map<string, {
    x: number;
    y: number;
}>;

/**
 * "Describe your product" → flow map. The AI returns a FlowSpec (screens and the links between
 * them); `repairFlowSpec` turns whatever came back into a valid spec or rejects it, and
 * `applyFlowSpec` writes it into a project document as pages, frames and connectors.
 */
declare const FLOW_PLATFORMS: readonly ["mobile", "tablet", "desktop", "all"];
type FlowPlatform = (typeof FLOW_PLATFORMS)[number];
/** Device preset used for flow-map frames; `all` maps screens on phone first. */
declare const FLOW_PLATFORM_PRESET: Record<FlowPlatform, string>;
declare const SCREEN_STATES: readonly ["default", "empty", "loading", "error", "success"];
type ScreenState = (typeof SCREEN_STATES)[number];
type FlowScreen = {
    id: string;
    name: string;
    purpose: string;
    keyContent: string[];
    states: ScreenState[];
};
type FlowConnection = {
    from: string;
    to: string;
    trigger: string;
};
type FlowSpec = {
    screens: FlowScreen[];
    connections: FlowConnection[];
};
declare const FLOW_LIMITS: {
    readonly maxScreens: 24;
    readonly maxConnections: 60;
    readonly nameLength: 60;
    readonly purposeLength: 280;
    readonly keyContentItems: 8;
    readonly keyContentLength: 120;
    readonly triggerLength: 40;
    readonly descriptionLength: 4000;
    readonly instructionLength: 1000;
};
/** JSON shape shown to the model. */
declare const FLOW_SPEC_SCHEMA_HINT = "{\n  \"screens\": [\n    {\n      \"id\": \"kebab-case-id\",\n      \"name\": \"Short screen name\",\n      \"purpose\": \"One sentence: what the user does here\",\n      \"keyContent\": [\"main content or controls on the screen\"],\n      \"states\": [\"default\", \"empty\", \"loading\", \"error\", \"success\"]\n    }\n  ],\n  \"connections\": [{ \"from\": \"screen-id\", \"to\": \"screen-id\", \"trigger\": \"Button or action label\" }]\n}";
declare class FlowSpecError extends Error {
    issues: string[];
    constructor(message: string, issues: string[]);
}
declare function slugifyScreenId(value: string): string;
/**
 * Validate model output, repairing what can be repaired (missing ids, duplicate ids, unknown
 * states, links to screens that don't exist, over-long text) and recording each repair.
 * Throws FlowSpecError when nothing usable is left.
 */
declare function repairFlowSpec(raw: unknown): {
    spec: FlowSpec;
    repairs: string[];
};
/** Stable key linking a page to a flow screen id (pages added by hand use their page id). */
declare function screenKeyForPage(page: Page): string;
/** The current flow, in FlowSpec terms, for refine prompts. */
declare function flowSpecFromDocument(document: ProjectDocument): FlowSpec;
/** No real screens yet: no frames, or only untouched starter pages without content or links. */
declare function isEmptyFlow(document: ProjectDocument): boolean;
type ApplyFlowSpecOptions = {
    platform: FlowPlatform;
    description: string;
    newId: (prefix: string) => string;
    now?: () => Date;
};
/**
 * Replace the project's flow with `spec`. Screens whose id matches an existing page (by brief key
 * or page id) keep that page and its design nodes; everything not in the spec is removed, along
 * with annotations on removed frames. Frames are laid out with the flow-map layered layout.
 */
declare function applyFlowSpec(document: ProjectDocument, spec: FlowSpec, options: ApplyFlowSpecOptions): {
    document: ProjectDocument;
    screenFrameIds: Record<string, string>;
};

declare function defaultNewId(prefix: string): string;
declare function createDefaultCommandContext(isValidComponentSlug: (slug: string) => boolean): CommandContext;

export { type Annotation, type AnnotationTarget, type ApplyFlowSpecOptions, type BreakpointId, type CommandContext, CommandError, type CommandResult, type Connector, DEFAULT_DEVICE_PRESETS, type DesignNode, type DesignerProject, type DevicePreset, FLOW_CARD_GAP_X, FLOW_CARD_GAP_Y, FLOW_CARD_HEIGHT, FLOW_CARD_WIDTH, FLOW_LABEL_HEIGHT, FLOW_LIMITS, FLOW_ORIGIN_X, FLOW_ORIGIN_Y, FLOW_PLATFORMS, FLOW_PLATFORM_PRESET, FLOW_SPEC_SCHEMA_HINT, FLOW_THUMB_HEIGHT, type FlowConnection, type FlowPlatform, type FlowScreen, type FlowSpec, FlowSpecError, type Frame, type ImportScreenshotLink, type ImportScreenshotShot, type LayoutMode, type LayoutModel, type Page, type ProductBrief, type ProjectCommand, type ProjectDocument, SCREEN_STATES, type ScreenBrief, type ScreenState, type SizingMode, type StyleModel, type StyleTrial, type ThemeId, applyFlowSpec, applyImportScreenshots, applyProjectCommand, autoPlaceFrame, createDefaultCommandContext, createEmptyProjectDocument, defaultNewId, deviceDimensions, flowSpecFromDocument, getDevicePreset, isEmptyFlow, layeredFlowLayout, layoutFramesInFlowRow, parseProjectCommand, projectCommandSchema, repairFlowSpec, screenKeyForPage, slugifyScreenId };
