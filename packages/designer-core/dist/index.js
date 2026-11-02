// src/devicePresets.ts
var DEFAULT_DEVICE_PRESETS = [
  { id: "iphone-se", label: "iPhone SE", width: 375, height: 667 },
  { id: "iphone-15", label: "iPhone 15", width: 393, height: 852 },
  { id: "mobile", label: "Mobile", width: 390, height: 844 },
  { id: "pixel-8", label: "Pixel 8", width: 412, height: 915 },
  { id: "ipad-mini", label: "iPad Mini", width: 768, height: 1024 },
  { id: "tablet", label: "Tablet", width: 768, height: 1024 },
  { id: "ipad-pro", label: "iPad Pro 11", width: 834, height: 1194 },
  { id: "desktop", label: "Desktop 1280", width: 1280, height: 800 },
  { id: "desktop-1440", label: "Desktop 1440", width: 1440, height: 900 },
  { id: "desktop-1920", label: "Desktop 1920", width: 1920, height: 1080 }
];
function getDevicePreset(id) {
  return DEFAULT_DEVICE_PRESETS.find((p) => p.id === id);
}
function deviceDimensions(preset, landscape) {
  if (!landscape) return { width: preset.width, height: preset.height };
  return { width: preset.height, height: preset.width };
}

// src/placement.ts
var FRAME_GAP_X = 56;
var FRAME_GAP_Y = 80;
var CANVAS_ORIGIN = 40;
var FRAME_LABEL_HEIGHT = 28;
function frameBounds(f) {
  return {
    x: f.x,
    y: f.y - FRAME_LABEL_HEIGHT,
    w: f.width,
    h: f.height + FRAME_LABEL_HEIGHT
  };
}
function intersects(a, b, gap = 16) {
  return !(a.x + a.w + gap <= b.x || b.x + b.w + gap <= a.x || a.y + a.h + gap <= b.y || b.y + b.h + gap <= a.y);
}
function autoPlaceFrame(allFrames, width, height) {
  let attempt = 0;
  while (attempt < 200) {
    const idx = allFrames.length + attempt;
    const x = CANVAS_ORIGIN + idx % 3 * (width + FRAME_GAP_X);
    const y = CANVAS_ORIGIN + Math.floor(idx / 3) * (height + FRAME_GAP_Y);
    const candidate = {
      x,
      y: y - FRAME_LABEL_HEIGHT,
      w: width,
      h: height + FRAME_LABEL_HEIGHT
    };
    const hit = allFrames.some((f) => intersects(candidate, frameBounds(f)));
    if (!hit) return { x, y };
    attempt++;
  }
  const maxX = Math.max(CANVAS_ORIGIN, ...allFrames.map((f) => f.x + f.width));
  return { x: maxX + FRAME_GAP_X, y: CANVAS_ORIGIN };
}
function layoutFramesInFlowRow(frames, startX = CANVAS_ORIGIN, startY = CANVAS_ORIGIN) {
  let x = startX;
  for (const f of frames) {
    f.x = x;
    f.y = startY;
    x += f.width + FRAME_GAP_X;
  }
}

// src/commands.ts
import { z } from "zod";
var layoutPatchSchema = z.object({
  mode: z.enum(["free", "stack", "row", "column", "grid"]).optional(),
  gap: z.number().optional(),
  padding: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
  align: z.enum(["start", "center", "end", "stretch"]).optional(),
  justify: z.enum(["start", "center", "end", "space-between"]).optional(),
  widthMode: z.enum(["fixed", "fill", "hug", "percent"]).optional(),
  heightMode: z.enum(["fixed", "fill", "hug", "percent"]).optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  minWidth: z.number().optional(),
  maxWidth: z.number().optional()
}).strict();
var projectCommandSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("add_frame"),
    pageId: z.string().optional(),
    presetId: z.string().optional(),
    name: z.string().optional(),
    x: z.number().optional(),
    y: z.number().optional(),
    themeId: z.string().nullable().optional()
  }),
  z.object({
    type: z.literal("add_screen"),
    pageId: z.string().optional(),
    name: z.string(),
    routePath: z.string().optional(),
    presetId: z.string().optional()
  }),
  z.object({
    type: z.literal("create_canvas"),
    name: z.string(),
    routePath: z.string().optional(),
    presetId: z.string().optional()
  }),
  z.object({
    type: z.literal("add_component"),
    pageId: z.string(),
    parentNodeId: z.string(),
    slug: z.string(),
    variantKey: z.string().optional(),
    props: z.record(z.unknown()).optional(),
    index: z.number().int().nonnegative().optional()
  }),
  z.object({
    type: z.literal("add_image_node"),
    pageId: z.string(),
    parentNodeId: z.string(),
    assetId: z.string(),
    name: z.string().optional(),
    alt: z.string().optional()
  }),
  z.object({
    type: z.literal("add_connector"),
    fromFrameId: z.string(),
    toFrameId: z.string(),
    label: z.string().optional(),
    trigger: z.string().optional()
  }),
  z.object({
    type: z.literal("add_annotation"),
    frameId: z.string(),
    kind: z.enum(["callout", "arrow", "box", "note"]),
    target: z.union([
      z.object({ kind: z.literal("node"), nodeId: z.string() }),
      z.object({ kind: z.literal("rect"), x: z.number(), y: z.number(), w: z.number(), h: z.number() })
    ]),
    text: z.string(),
    index: z.number().int().optional()
  }),
  z.object({
    type: z.literal("update_node"),
    pageId: z.string(),
    nodeId: z.string(),
    layout: layoutPatchSchema.optional(),
    content: z.object({ text: z.string().optional() }).optional(),
    variantKey: z.string().optional(),
    props: z.record(z.unknown()).optional(),
    name: z.string().optional()
  }),
  z.object({
    type: z.literal("delete_node"),
    pageId: z.string(),
    nodeId: z.string()
  })
]);
var CommandError = class extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
    this.name = "CommandError";
  }
  code;
};
function parseProjectCommand(input) {
  return projectCommandSchema.parse(input);
}
function createEmptyProjectDocument(id, name, themeId = "light", ctx) {
  const pageId = ctx.newId("page");
  const rootId = ctx.newId("node");
  const baseLayout = {
    mode: "stack",
    gap: 16,
    padding: [0, 0, 0, 0],
    align: "stretch",
    justify: "start",
    widthMode: "fill",
    heightMode: "hug"
  };
  return {
    schemaVersion: 1,
    project: {
      id,
      name,
      defaultThemeId: themeId,
      pages: [
        {
          id: pageId,
          name: "Home",
          routePath: "/",
          rootNodeId: rootId,
          nodes: {
            [rootId]: {
              id: rootId,
              name: "Page root",
              type: "stack",
              parentId: null,
              children: [],
              layout: baseLayout
            }
          }
        }
      ],
      frames: [],
      trials: [],
      customTokenOverrides: {},
      canvas: { x: 0, y: 0, zoom: 1 },
      connectors: [],
      annotations: []
    }
  };
}
function cloneDocument(doc) {
  return JSON.parse(JSON.stringify(doc));
}
function findPage(project, pageId) {
  const page = project.pages.find((p) => p.id === pageId);
  if (!page) throw new CommandError(`Unknown page: ${pageId}`, "page_not_found");
  return page;
}
function removeNodeTree(page, nodeId) {
  const node = page.nodes[nodeId];
  if (!node) return;
  for (const childId of [...node.children]) {
    removeNodeTree(page, childId);
  }
  if (node.parentId) {
    const parent = page.nodes[node.parentId];
    if (parent) parent.children = parent.children.filter((id) => id !== nodeId);
  }
  delete page.nodes[nodeId];
}
function applyProjectCommand(document, command, ctx) {
  const parsed = projectCommandSchema.parse(command);
  const doc = cloneDocument(document);
  const project = doc.project;
  const effects = {};
  switch (parsed.type) {
    case "create_canvas": {
      const pageId = ctx.newId("page");
      const rootId = ctx.newId("node");
      const page = {
        id: pageId,
        name: parsed.name,
        routePath: parsed.routePath ?? `/${pageId.slice(-6)}`,
        rootNodeId: rootId,
        nodes: {
          [rootId]: {
            id: rootId,
            name: "Page root",
            type: "stack",
            parentId: null,
            children: [],
            layout: {
              mode: "stack",
              gap: 16,
              padding: [0, 0, 0, 0],
              align: "stretch",
              justify: "start",
              widthMode: "fill",
              heightMode: "hug"
            }
          }
        }
      };
      project.pages.push(page);
      effects.pageId = pageId;
      effects.rootNodeId = rootId;
      const frameResult = applyProjectCommand(
        doc,
        {
          type: "add_frame",
          pageId,
          presetId: parsed.presetId ?? "iphone-15",
          name: parsed.name
        },
        ctx
      );
      return { document: frameResult.document, effects: { ...effects, ...frameResult.effects } };
    }
    case "add_screen": {
      const pageId = parsed.pageId ?? project.pages[0]?.id;
      if (!pageId) throw new CommandError("Project has no pages", "no_pages");
      const page = findPage(project, pageId);
      page.name = parsed.name;
      if (parsed.routePath) page.routePath = parsed.routePath;
      return applyProjectCommand(
        doc,
        {
          type: "add_frame",
          pageId,
          presetId: parsed.presetId ?? "iphone-15",
          name: parsed.name
        },
        ctx
      );
    }
    case "add_frame": {
      const pageId = parsed.pageId ?? project.pages[0]?.id;
      if (!pageId) throw new CommandError("Project has no pages", "no_pages");
      findPage(project, pageId);
      const preset = getDevicePreset(parsed.presetId ?? "iphone-15");
      if (!preset) throw new CommandError(`Unknown device preset: ${parsed.presetId}`, "invalid_preset");
      const dim = deviceDimensions(preset);
      const place = parsed.x != null && parsed.y != null ? { x: parsed.x, y: parsed.y } : autoPlaceFrame(project.frames, dim.width, dim.height);
      const frameId = ctx.newId("frame");
      project.frames.push({
        id: frameId,
        name: parsed.name ?? "New frame",
        pageId,
        x: place.x,
        y: place.y,
        width: dim.width,
        height: dim.height,
        devicePresetId: preset.id,
        heightMode: "fixed",
        themeId: parsed.themeId ?? void 0
      });
      effects.frameId = frameId;
      return { document: doc, effects };
    }
    case "add_component": {
      const page = findPage(project, parsed.pageId);
      if (!ctx.isValidComponentSlug(parsed.slug)) {
        throw new CommandError(`Unknown component slug: ${parsed.slug}`, "invalid_component");
      }
      const parent = page.nodes[parsed.parentNodeId];
      if (!parent) throw new CommandError(`Unknown parent node: ${parsed.parentNodeId}`, "node_not_found");
      const id = ctx.newId("node");
      const node = {
        id,
        name: parsed.slug,
        type: "instance",
        parentId: parsed.parentNodeId,
        children: [],
        instance: {
          definitionId: parsed.slug,
          variantKey: parsed.variantKey ?? "primary",
          props: parsed.props ?? { children: "Label" }
        },
        layout: {
          mode: "stack",
          gap: 0,
          padding: [0, 0, 0, 0],
          align: "start",
          justify: "start",
          widthMode: "hug",
          heightMode: "hug"
        }
      };
      page.nodes[id] = node;
      const index = parsed.index ?? parent.children.length;
      parent.children.splice(index, 0, id);
      effects.nodeId = id;
      return { document: doc, effects };
    }
    case "add_image_node": {
      const page = findPage(project, parsed.pageId);
      const parent = page.nodes[parsed.parentNodeId];
      if (!parent) throw new CommandError(`Unknown parent node: ${parsed.parentNodeId}`, "node_not_found");
      const id = ctx.newId("node");
      page.nodes[id] = {
        id,
        name: parsed.name ?? "Image",
        type: "image",
        parentId: parsed.parentNodeId,
        children: [],
        image: { assetId: parsed.assetId, alt: parsed.alt },
        layout: {
          mode: "stack",
          gap: 0,
          padding: [0, 0, 0, 0],
          align: "start",
          justify: "start",
          widthMode: "fill",
          heightMode: "hug"
        }
      };
      parent.children.push(id);
      effects.nodeId = id;
      return { document: doc, effects };
    }
    case "add_connector": {
      if (parsed.fromFrameId === parsed.toFrameId) {
        throw new CommandError("Connector endpoints must differ", "invalid_connector");
      }
      const from = project.frames.find((f) => f.id === parsed.fromFrameId);
      const to = project.frames.find((f) => f.id === parsed.toFrameId);
      if (!from || !to) throw new CommandError("Unknown frame endpoint", "frame_not_found");
      const id = ctx.newId("conn");
      project.connectors.push({
        id,
        fromFrameId: parsed.fromFrameId,
        toFrameId: parsed.toFrameId,
        label: parsed.label,
        trigger: parsed.trigger
      });
      effects.connectorId = id;
      return { document: doc, effects };
    }
    case "add_annotation": {
      const frame = project.frames.find((f) => f.id === parsed.frameId);
      if (!frame) throw new CommandError(`Unknown frame: ${parsed.frameId}`, "frame_not_found");
      const id = ctx.newId("anno");
      project.annotations.push({
        id,
        frameId: parsed.frameId,
        kind: parsed.kind,
        target: parsed.target,
        text: parsed.text,
        index: parsed.index
      });
      effects.annotationId = id;
      return { document: doc, effects };
    }
    case "update_node": {
      const page = findPage(project, parsed.pageId);
      const node = page.nodes[parsed.nodeId];
      if (!node) throw new CommandError(`Unknown node: ${parsed.nodeId}`, "node_not_found");
      if (parsed.name) node.name = parsed.name;
      if (parsed.layout) node.layout = { ...node.layout, ...parsed.layout };
      if (parsed.content?.text != null) {
        node.content = { ...node.content, text: parsed.content.text };
      }
      if (parsed.variantKey && node.instance) node.instance.variantKey = parsed.variantKey;
      if (parsed.props && node.instance) {
        node.instance.props = { ...node.instance.props, ...parsed.props };
      }
      effects.nodeId = node.id;
      return { document: doc, effects };
    }
    case "delete_node": {
      const page = findPage(project, parsed.pageId);
      if (page.rootNodeId === parsed.nodeId) {
        throw new CommandError("Cannot delete page root node", "root_protected");
      }
      if (!page.nodes[parsed.nodeId]) {
        throw new CommandError(`Unknown node: ${parsed.nodeId}`, "node_not_found");
      }
      removeNodeTree(page, parsed.nodeId);
      effects.nodeId = parsed.nodeId;
      return { document: doc, effects };
    }
    default:
      throw new CommandError("Unsupported command", "unsupported");
  }
}
function applyImportScreenshots(document, shots, links, ctx, opts) {
  let doc = document;
  const frameByAsset = /* @__PURE__ */ new Map();
  for (const shot of shots) {
    const pageId = opts?.pageId ?? doc.project.pages[0]?.id;
    if (!pageId) throw new CommandError("Project has no pages", "no_pages");
    const page = findPage(doc.project, pageId);
    const frameRes = applyProjectCommand(
      doc,
      {
        type: "add_frame",
        pageId,
        name: shot.title ?? shot.url ?? "Screen",
        presetId: "mobile"
      },
      ctx
    );
    doc = frameRes.document;
    const frameId = frameRes.effects.frameId;
    frameByAsset.set(shot.assetId, frameId);
    const imageRes = applyProjectCommand(
      doc,
      {
        type: "add_image_node",
        pageId,
        parentNodeId: page.rootNodeId,
        assetId: shot.assetId,
        name: shot.title ?? "Screenshot"
      },
      ctx
    );
    doc = imageRes.document;
  }
  const newFrames = shots.map((s) => frameByAsset.get(s.assetId)).filter(Boolean).map((id) => doc.project.frames.find((f) => f.id === id));
  layoutFramesInFlowRow(newFrames);
  for (const link of links) {
    const from = frameByAsset.get(link.fromAssetId);
    const to = frameByAsset.get(link.toAssetId);
    if (!from || !to) continue;
    const res = applyProjectCommand(
      doc,
      {
        type: "add_connector",
        fromFrameId: from,
        toFrameId: to,
        label: link.label,
        trigger: link.trigger
      },
      ctx
    );
    doc = res.document;
  }
  return { document: doc, effects: { frameIds: [...frameByAsset.values()] } };
}

// src/index.ts
function defaultNewId(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
function createDefaultCommandContext(isValidComponentSlug) {
  return {
    isValidComponentSlug,
    newId: defaultNewId
  };
}
export {
  CommandError,
  DEFAULT_DEVICE_PRESETS,
  applyImportScreenshots,
  applyProjectCommand,
  autoPlaceFrame,
  createDefaultCommandContext,
  createEmptyProjectDocument,
  defaultNewId,
  deviceDimensions,
  getDevicePreset,
  layoutFramesInFlowRow,
  parseProjectCommand,
  projectCommandSchema
};
