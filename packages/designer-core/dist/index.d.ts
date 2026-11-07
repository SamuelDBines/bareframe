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

declare function defaultNewId(prefix: string): string;
declare function createDefaultCommandContext(isValidComponentSlug: (slug: string) => boolean): CommandContext;

export { type Annotation, type AnnotationTarget, type BreakpointId, type CommandContext, CommandError, type CommandResult, type Connector, DEFAULT_DEVICE_PRESETS, type DesignNode, type DesignerProject, type DevicePreset, type Frame, type ImportScreenshotLink, type ImportScreenshotShot, type LayoutMode, type LayoutModel, type Page, type ProjectCommand, type ProjectDocument, type SizingMode, type StyleModel, type StyleTrial, type ThemeId, applyImportScreenshots, applyProjectCommand, autoPlaceFrame, createDefaultCommandContext, createEmptyProjectDocument, defaultNewId, deviceDimensions, getDevicePreset, layoutFramesInFlowRow, parseProjectCommand, projectCommandSchema };
