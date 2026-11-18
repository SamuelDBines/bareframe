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
    trigger: z.string().optional(),
    fromNodeId: z.string().optional()
  }),
  z.object({
    type: z.literal("update_connector"),
    connectorId: z.string(),
    label: z.string().optional(),
    trigger: z.string().optional(),
    fromNodeId: z.string().nullable().optional()
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
};
function parseProjectCommand(input) {
  return projectCommandSchema.parse(input);
}
function createEmptyProjectDocument(id, name, themeId = "light", ctx) {
  const pageId = ctx.newId("page");
  const rootId = ctx.newId("node");
  const baseLayout2 = {
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
              layout: baseLayout2
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
        trigger: parsed.trigger,
        fromNodeId: parsed.fromNodeId
      });
      effects.connectorId = id;
      return { document: doc, effects };
    }
    case "update_connector": {
      const conn = project.connectors.find((c) => c.id === parsed.connectorId);
      if (!conn) throw new CommandError("Unknown connector", "connector_not_found");
      if (parsed.label !== void 0) conn.label = parsed.label;
      if (parsed.trigger !== void 0) conn.trigger = parsed.trigger;
      if (parsed.fromNodeId !== void 0) {
        conn.fromNodeId = parsed.fromNodeId ?? void 0;
      }
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
  const frameByRoute = /* @__PURE__ */ new Map();
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
    frameByRoute.set(shot.routePath, frameId);
    if (shot.assetId) {
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
    if (shot.error) {
      const ann = applyProjectCommand(
        doc,
        {
          type: "add_annotation",
          frameId,
          kind: "note",
          target: { kind: "rect", x: 16, y: 48, w: 300, h: 72 },
          text: shot.error
        },
        ctx
      );
      doc = ann.document;
    }
  }
  const newFrames = shots.map((s) => frameByRoute.get(s.routePath)).filter(Boolean).map((id) => doc.project.frames.find((f) => f.id === id));
  layoutFramesInFlowRow(newFrames);
  for (const link of links) {
    const from = frameByRoute.get(link.fromRoutePath);
    const to = frameByRoute.get(link.toRoutePath);
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
  return { document: doc, effects: { frameIds: [...frameByRoute.values()] } };
}

// src/flowLayout.ts
var FLOW_CARD_WIDTH = 272;
var FLOW_THUMB_HEIGHT = 392;
var FLOW_LABEL_HEIGHT = 44;
var FLOW_CARD_HEIGHT = FLOW_THUMB_HEIGHT + FLOW_LABEL_HEIGHT;
var FLOW_CARD_GAP_X = 200;
var FLOW_CARD_GAP_Y = 96;
var FLOW_ORIGIN_X = 96;
var FLOW_ORIGIN_Y = 88;
function layeredFlowLayout(frameIds, edges, startX = FLOW_ORIGIN_X, startY = FLOW_ORIGIN_Y) {
  const ids = new Set(frameIds);
  const out = /* @__PURE__ */ new Map();
  for (const id of frameIds) out.set(id, []);
  for (const e of edges) {
    if (ids.has(e.fromFrameId) && ids.has(e.toFrameId) && e.fromFrameId !== e.toFrameId) {
      out.get(e.fromFrameId).push(e.toFrameId);
    }
  }
  const state = /* @__PURE__ */ new Map();
  const dag = new Map(frameIds.map((id) => [id, []]));
  const visit = (id) => {
    state.set(id, 1);
    for (const to of out.get(id)) {
      const s = state.get(to) ?? 0;
      if (s === 1) continue;
      dag.get(id).push(to);
      if (s === 0) visit(to);
    }
    state.set(id, 2);
  };
  const incoming = new Map(frameIds.map((id) => [id, 0]));
  for (const e of edges) {
    if (ids.has(e.toFrameId) && e.fromFrameId !== e.toFrameId && ids.has(e.fromFrameId)) {
      incoming.set(e.toFrameId, (incoming.get(e.toFrameId) ?? 0) + 1);
    }
  }
  for (const id of frameIds) if ((incoming.get(id) ?? 0) === 0 && !state.get(id)) visit(id);
  for (const id of frameIds) if (!state.get(id)) visit(id);
  const indeg = new Map(frameIds.map((id) => [id, 0]));
  for (const tos of dag.values()) for (const to of tos) indeg.set(to, indeg.get(to) + 1);
  const rank = new Map(frameIds.map((id) => [id, 0]));
  const queue = frameIds.filter((id) => indeg.get(id) === 0);
  while (queue.length) {
    const id = queue.shift();
    for (const to of dag.get(id)) {
      rank.set(to, Math.max(rank.get(to), rank.get(id) + 1));
      indeg.set(to, indeg.get(to) - 1);
      if (indeg.get(to) === 0) queue.push(to);
    }
  }
  const columns = [];
  for (const id of frameIds) {
    const r = rank.get(id);
    (columns[r] ??= []).push(id);
  }
  const parents = new Map(frameIds.map((id) => [id, []]));
  for (const [from, tos] of dag) for (const to of tos) parents.get(to).push(from);
  const rowOf = /* @__PURE__ */ new Map();
  columns.forEach((col) => col.forEach((id, i) => rowOf.set(id, i)));
  for (let pass = 0; pass < 2; pass++) {
    for (let c = 1; c < columns.length; c++) {
      const col = columns[c] ?? [];
      const score = (id) => {
        const ps = parents.get(id);
        if (ps.length === 0) return rowOf.get(id);
        return ps.reduce((sum, p) => sum + rowOf.get(p), 0) / ps.length;
      };
      col.sort((a, b) => score(a) - score(b));
      col.forEach((id, i) => rowOf.set(id, i));
    }
  }
  const maxRows = Math.max(1, ...columns.map((c) => c?.length ?? 0));
  const pitchY = FLOW_CARD_HEIGHT + FLOW_CARD_GAP_Y;
  const positions = /* @__PURE__ */ new Map();
  columns.forEach((col, c) => {
    if (!col) return;
    const offset = (maxRows - col.length) * pitchY / 2;
    col.forEach((id, i) => {
      positions.set(id, {
        x: startX + c * (FLOW_CARD_WIDTH + FLOW_CARD_GAP_X),
        y: startY + offset + i * pitchY
      });
    });
  });
  return positions;
}

// src/flowSpec.ts
var FLOW_PLATFORMS = ["mobile", "tablet", "desktop", "all"];
var FLOW_PLATFORM_PRESET = {
  mobile: "mobile",
  tablet: "tablet",
  desktop: "desktop-1440",
  all: "mobile"
};
var FLOW_DEVICES = ["mobile", "tablet", "desktop"];
function platformForDevices(devices) {
  const unique = FLOW_DEVICES.filter((d) => devices.includes(d));
  return unique.length === 1 ? unique[0] : "all";
}
function devicesForPlatform(platform) {
  return platform === "all" ? [...FLOW_DEVICES] : [platform];
}
var SCREEN_STATES = ["default", "empty", "loading", "error", "success"];
var FLOW_LIMITS = {
  maxScreens: 24,
  maxConnections: 60,
  nameLength: 60,
  purposeLength: 280,
  keyContentItems: 8,
  keyContentLength: 120,
  triggerLength: 40,
  descriptionLength: 4e3,
  instructionLength: 1e3
};
var FLOW_SPEC_SCHEMA_HINT = `{
  "screens": [
    {
      "id": "kebab-case-id",
      "name": "Short screen name",
      "purpose": "One sentence: what the user does here",
      "keyContent": ["main content or controls on the screen"],
      "states": ["default", "empty", "loading", "error", "success"]
    }
  ],
  "connections": [{ "from": "screen-id", "to": "screen-id", "trigger": "Button or action label" }]
}`;
var FlowSpecError = class extends Error {
  constructor(message, issues) {
    super(message);
    this.issues = issues;
    this.name = "FlowSpecError";
  }
};
var STATE_ALIASES = {
  default: "default",
  normal: "default",
  populated: "default",
  ideal: "default",
  empty: "empty",
  "no data": "empty",
  "no results": "empty",
  "zero state": "empty",
  loading: "loading",
  skeleton: "loading",
  pending: "loading",
  error: "error",
  failure: "error",
  failed: "error",
  offline: "error",
  success: "success",
  done: "success",
  confirmation: "success",
  complete: "success"
};
function isRecord(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function text(v, max) {
  if (typeof v !== "string" && typeof v !== "number") return "";
  return String(v).replace(/\s+/g, " ").trim().slice(0, max);
}
function slugifyScreenId(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "screen";
}
function repairFlowSpec(raw) {
  const repairs = [];
  if (!isRecord(raw)) throw new FlowSpecError("Response is not a JSON object", ["root: expected an object"]);
  const rawScreens = raw.screens;
  if (!Array.isArray(rawScreens)) {
    throw new FlowSpecError("Response has no screens", ["screens: expected an array"]);
  }
  const screens = [];
  const idMap = /* @__PURE__ */ new Map();
  const used = /* @__PURE__ */ new Set();
  rawScreens.forEach((item, index) => {
    if (!isRecord(item)) {
      repairs.push(`screens[${index}]: dropped (not an object)`);
      return;
    }
    const name = text(item.name ?? item.title, FLOW_LIMITS.nameLength);
    const rawId = text(item.id ?? item.key, 80);
    if (!name && !rawId) {
      repairs.push(`screens[${index}]: dropped (no id or name)`);
      return;
    }
    if (screens.length >= FLOW_LIMITS.maxScreens) {
      repairs.push(`screens[${index}]: dropped (more than ${FLOW_LIMITS.maxScreens} screens)`);
      return;
    }
    let id = slugifyScreenId(rawId || name);
    if (rawId && id !== rawId) repairs.push(`screens[${index}]: id "${rawId}" normalised to "${id}"`);
    if (!rawId) repairs.push(`screens[${index}]: missing id, derived "${id}" from name`);
    if (used.has(id)) {
      let n = 2;
      while (used.has(`${id}-${n}`)) n++;
      repairs.push(`screens[${index}]: duplicate id "${id}" renamed to "${id}-${n}"`);
      id = `${id}-${n}`;
    }
    used.add(id);
    if (rawId && !idMap.has(rawId)) idMap.set(rawId, id);
    if (!idMap.has(id)) idMap.set(id, id);
    const rawContent = item.keyContent ?? item.key_content ?? item.content;
    const keyContent = (Array.isArray(rawContent) ? rawContent : typeof rawContent === "string" ? [rawContent] : []).map((c) => text(c, FLOW_LIMITS.keyContentLength)).filter(Boolean).slice(0, FLOW_LIMITS.keyContentItems);
    const states = /* @__PURE__ */ new Set(["default"]);
    const rawStates = Array.isArray(item.states) ? item.states : [];
    for (const s of rawStates) {
      const mapped = STATE_ALIASES[text(s, 40).toLowerCase()];
      if (mapped) states.add(mapped);
      else repairs.push(`screens[${index}]: unknown state "${text(s, 40)}" dropped`);
    }
    screens.push({
      id,
      name: name || id.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()),
      purpose: text(item.purpose ?? item.description, FLOW_LIMITS.purposeLength),
      keyContent,
      states: SCREEN_STATES.filter((s) => states.has(s))
    });
  });
  if (screens.length === 0) throw new FlowSpecError("Response has no usable screens", ["screens: empty"]);
  const connections = [];
  const seen = /* @__PURE__ */ new Set();
  const rawConnections = Array.isArray(raw.connections) ? raw.connections : Array.isArray(raw.links) ? raw.links : [];
  if (raw.connections !== void 0 && !Array.isArray(raw.connections)) repairs.push("connections: not an array, ignored");
  rawConnections.forEach((item, index) => {
    if (!isRecord(item)) {
      repairs.push(`connections[${index}]: dropped (not an object)`);
      return;
    }
    const fromRaw = text(item.from ?? item.source, 80);
    const toRaw = text(item.to ?? item.target, 80);
    const from = idMap.get(fromRaw) ?? (used.has(slugifyScreenId(fromRaw)) ? slugifyScreenId(fromRaw) : void 0);
    const to = idMap.get(toRaw) ?? (used.has(slugifyScreenId(toRaw)) ? slugifyScreenId(toRaw) : void 0);
    if (!from || !to) {
      repairs.push(`connections[${index}]: dropped (unknown screen "${!from ? fromRaw : toRaw}")`);
      return;
    }
    if (from === to) {
      repairs.push(`connections[${index}]: dropped (links a screen to itself)`);
      return;
    }
    const trigger = text(item.trigger ?? item.label, FLOW_LIMITS.triggerLength) || "Next";
    const key = `${from}>${to}>${trigger.toLowerCase()}`;
    if (seen.has(key)) {
      repairs.push(`connections[${index}]: dropped (duplicate)`);
      return;
    }
    if (connections.length >= FLOW_LIMITS.maxConnections) {
      repairs.push(`connections[${index}]: dropped (more than ${FLOW_LIMITS.maxConnections} links)`);
      return;
    }
    seen.add(key);
    connections.push({ from, to, trigger });
  });
  return { spec: { screens, connections }, repairs };
}
function screenKeyForPage(page) {
  return page.brief?.key ?? page.id;
}
function flowSpecFromDocument(document) {
  const { project } = document;
  const frames = project.frames.filter((f) => !f.ghost);
  const pageByFrame = new Map(frames.map((f) => [f.id, project.pages.find((p) => p.id === f.pageId)]));
  const screens = [];
  const seen = /* @__PURE__ */ new Set();
  for (const frame of [...frames].sort((a, b) => a.x - b.x || a.y - b.y)) {
    const page = pageByFrame.get(frame.id);
    if (!page) continue;
    const key = screenKeyForPage(page);
    if (seen.has(key)) continue;
    seen.add(key);
    screens.push({
      id: key,
      name: page.name || frame.name,
      purpose: page.brief?.purpose ?? "",
      keyContent: page.brief?.keyContent ?? [],
      states: page.brief?.states ?? ["default"]
    });
  }
  const keyOfFrame = (id) => {
    const page = pageByFrame.get(id);
    return page ? screenKeyForPage(page) : void 0;
  };
  const connections = project.connectors.flatMap((c) => {
    const from = keyOfFrame(c.fromFrameId);
    const to = keyOfFrame(c.toFrameId);
    return from && to && from !== to ? [{ from, to, trigger: c.label ?? c.trigger ?? "Next" }] : [];
  });
  return { screens, connections };
}
function isEmptyFlow(document) {
  const { project } = document;
  const frames = project.frames.filter((f) => !f.ghost);
  if (frames.length === 0) return true;
  if (project.connectors.length > 0 || frames.length > 1) return false;
  return project.pages.every((p) => (p.nodes[p.rootNodeId]?.children.length ?? 0) === 0);
}
function rootNode(id) {
  return {
    id,
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
  };
}
function applyFlowSpec(document, spec, options) {
  const doc = JSON.parse(JSON.stringify(document));
  const project = doc.project;
  const devices = options.platforms?.length ? FLOW_DEVICES.filter((d) => options.platforms.includes(d)) : devicesForPlatform(options.platform);
  const presetId = FLOW_PLATFORM_PRESET[devices[0] ?? options.platform];
  const preset = getDevicePreset(presetId);
  const dim = deviceDimensions(preset);
  const existingByKey = new Map(project.pages.map((p) => [screenKeyForPage(p), p]));
  const pages = [];
  const frames = [];
  const screenFrameIds = {};
  spec.screens.forEach((screen, index) => {
    const brief = {
      key: screen.id,
      purpose: screen.purpose,
      keyContent: screen.keyContent,
      states: screen.states
    };
    let page = existingByKey.get(screen.id);
    if (page) {
      page.name = screen.name;
      page.brief = brief;
    } else {
      const rootId = options.newId("node");
      page = {
        id: options.newId("page"),
        name: screen.name,
        routePath: index === 0 ? "/" : `/${screen.id}`,
        rootNodeId: rootId,
        nodes: { [rootId]: rootNode(rootId) },
        brief
      };
    }
    pages.push(page);
    const pageId = page.id;
    const existingFrame = project.frames.find((f) => !f.ghost && f.pageId === pageId && f.devicePresetId === presetId) ?? project.frames.find((f) => !f.ghost && f.pageId === pageId);
    const frame = existingFrame ? { ...existingFrame, name: screen.name } : {
      id: options.newId("frame"),
      name: screen.name,
      pageId,
      x: 0,
      y: 0,
      width: dim.width,
      height: dim.height,
      devicePresetId: preset.id,
      heightMode: "fixed"
    };
    frames.push(frame);
    screenFrameIds[screen.id] = frame.id;
  });
  const connectors = spec.connections.map((c) => ({
    id: options.newId("conn"),
    fromFrameId: screenFrameIds[c.from],
    toFrameId: screenFrameIds[c.to],
    label: c.trigger,
    trigger: "click"
  }));
  const positions = layeredFlowLayout(
    frames.map((f) => f.id),
    connectors
  );
  for (const f of frames) Object.assign(f, positions.get(f.id));
  const frameIds = new Set(frames.map((f) => f.id));
  project.pages = pages;
  project.frames = frames;
  project.connectors = connectors;
  project.annotations = project.annotations.filter((a) => frameIds.has(a.frameId));
  project.trials = project.trials.filter((t) => pages.some((p) => p.id === t.pageId));
  if (project.prototypeEntryFrameId && !frameIds.has(project.prototypeEntryFrameId)) {
    project.prototypeEntryFrameId = null;
  }
  project.productBrief = {
    description: options.description,
    platform: options.platform,
    platforms: devices,
    updatedAt: (options.now?.() ?? /* @__PURE__ */ new Date()).toISOString()
  };
  return { document: doc, screenFrameIds };
}

// src/designSpec.ts
var DESIGN_DEVICES = ["phone", "tablet", "desktop"];
var DESIGN_COMPONENTS = {
  button: { props: ["label", "variant"], variants: ["primary", "secondary", "ghost"] },
  input: { props: ["label", "placeholder"], variants: [] },
  card: { props: ["title", "body", "variant"], variants: ["outlined", "elevated", "ghost"] },
  badge: { props: ["label", "variant"], variants: ["default", "success", "outline"] },
  alert: { props: ["text", "variant"], variants: ["info", "success", "warning", "danger"] }
};
var DESIGN_LAYOUTS = ["stack", "row", "section"];
var DESIGN_LIMITS = { maxNodes: 80, maxDepth: 6, textLength: 240, maxChildren: 24 };
var DESIGN_SPEC_SCHEMA_HINT = `{
  "states": {
    "default": { "type": "stack", "gap": 16, "padding": 24, "children": [
      { "type": "heading", "level": 1, "text": "Screen title" },
      { "type": "text", "text": "Supporting copy" },
      { "type": "input", "props": { "label": "Email", "placeholder": "you@example.com" } },
      { "type": "button", "props": { "label": "Continue", "variant": "primary" } }
    ] },
    "empty": { "...": "same shape; include only states the screen has" }
  }
}
Allowed "type" values ONLY: stack, row, section (layout, with children), heading, text,
button {label, variant: primary|secondary|ghost}, input {label, placeholder},
card {title, body, variant: outlined|elevated|ghost}, badge {label, variant: default|success|outline},
alert {text, variant: info|success|warning|danger}. No HTML, no other components.`;
var DesignSpecError = class extends Error {
  constructor(message, issues) {
    super(message);
    this.issues = issues;
    this.name = "DesignSpecError";
  }
};
function isRecord2(v) {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
function clean(v, max = DESIGN_LIMITS.textLength) {
  if (typeof v !== "string" && typeof v !== "number") return "";
  return String(v).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, max);
}
function clampNumber(v, min, max, fallback) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}
function repairTree(raw, path, repairs, budget, depth = 0) {
  if (!isRecord2(raw)) {
    repairs.push(`${path}: dropped (not an object)`);
    return null;
  }
  if (budget.nodes >= DESIGN_LIMITS.maxNodes) {
    repairs.push(`${path}: dropped (more than ${DESIGN_LIMITS.maxNodes} nodes)`);
    return null;
  }
  const type = clean(raw.type ?? raw.component, 40).toLowerCase();
  if (DESIGN_LAYOUTS.includes(type)) {
    if (depth >= DESIGN_LIMITS.maxDepth) {
      repairs.push(`${path}: dropped (nested deeper than ${DESIGN_LIMITS.maxDepth})`);
      return null;
    }
    budget.nodes++;
    const rawChildren = Array.isArray(raw.children) ? raw.children : [];
    const children = rawChildren.slice(0, DESIGN_LIMITS.maxChildren).map((c, i) => repairTree(c, `${path}.children[${i}]`, repairs, budget, depth + 1)).filter((c) => c !== null);
    if (rawChildren.length > DESIGN_LIMITS.maxChildren) repairs.push(`${path}: kept the first ${DESIGN_LIMITS.maxChildren} children`);
    return {
      type,
      gap: clampNumber(raw.gap, 0, 64, 16),
      padding: clampNumber(raw.padding, 0, 64, type === "row" ? 0 : 16),
      children
    };
  }
  if (type === "heading" || type === "text") {
    const text2 = clean(raw.text ?? (isRecord2(raw.props) ? raw.props.text : void 0));
    if (!text2) {
      repairs.push(`${path}: dropped (empty ${type})`);
      return null;
    }
    budget.nodes++;
    if (type === "text") return { type, text: text2 };
    return { type, text: text2, level: clampNumber(raw.level, 1, 3, 2) };
  }
  const def = DESIGN_COMPONENTS[type];
  if (!def) {
    repairs.push(`${path}: dropped "${type || "unknown"}" (not a Bareframe component)`);
    return null;
  }
  const rawProps = isRecord2(raw.props) ? raw.props : raw;
  const props = {};
  for (const key of def.props) {
    const value = clean(rawProps[key], key === "variant" ? 20 : DESIGN_LIMITS.textLength);
    if (!value) continue;
    if (key === "variant" && !def.variants.includes(value)) {
      repairs.push(`${path}: unknown ${type} variant "${value}" dropped`);
      continue;
    }
    props[key] = value;
  }
  const textKey = def.props.find((k) => k !== "variant" && k !== "placeholder") ?? "label";
  if (!props[textKey] && type !== "input") {
    repairs.push(`${path}: dropped ${type} without ${textKey}`);
    return null;
  }
  budget.nodes++;
  return { type, props };
}
function repairDesignSpec(raw, wantedStates = ["default"]) {
  const repairs = [];
  if (!isRecord2(raw)) throw new DesignSpecError("Response is not a JSON object", ["root: expected an object"]);
  const rawStates = isRecord2(raw.states) ? raw.states : isRecord2(raw.root) || raw.type ? { default: raw.root ?? raw } : null;
  if (!rawStates) throw new DesignSpecError("Response has no states", ["states: expected an object"]);
  const states = {};
  for (const name of ["default", "empty", "loading", "error", "success"]) {
    if (rawStates[name] === void 0) continue;
    const budget = { nodes: 0 };
    const tree = repairTree(rawStates[name], `states.${name}`, repairs, budget);
    if (tree) states[name] = wrapRoot(tree);
  }
  for (const extra of Object.keys(rawStates)) {
    if (!["default", "empty", "loading", "error", "success"].includes(extra)) repairs.push(`states.${extra}: unknown state dropped`);
  }
  if (!states.default) throw new DesignSpecError("Response has no usable default state", ["states.default: missing or empty"]);
  for (const name of wantedStates) {
    if (!states[name]) repairs.push(`states.${name}: not designed`);
  }
  return { spec: { states }, repairs };
}
function wrapRoot(tree) {
  return tree.type === "stack" ? tree : { type: "stack", gap: 16, padding: 16, children: [tree] };
}
function baseLayout(patch = {}) {
  return {
    mode: "stack",
    gap: 0,
    padding: [0, 0, 0, 0],
    align: "stretch",
    justify: "start",
    widthMode: "fill",
    heightMode: "hug",
    ...patch
  };
}
var PROP_FOR_RENDER = {
  button: (p) => ({ variantKey: p.variant ?? "primary", props: { children: p.label } }),
  input: (p) => ({ variantKey: "default", props: { placeholder: p.placeholder ?? p.label, label: p.label } }),
  card: (p) => ({ variantKey: p.variant ?? "outlined", props: { title: p.title, children: p.body ?? "" } }),
  badge: (p) => ({ variantKey: p.variant ?? "default", props: { children: p.label } }),
  alert: (p) => ({ variantKey: p.variant ?? "info", props: { children: p.text } })
};
function designToNodes(page, tree, newId) {
  const nodes = {};
  const build = (node, parentId) => {
    const id = parentId === null ? page.rootNodeId : newId("node");
    if (node.type === "stack" || node.type === "row" || node.type === "section") {
      const pad = node.padding ?? 0;
      nodes[id] = {
        id,
        name: parentId === null ? "Page root" : node.type,
        type: node.type,
        parentId,
        children: [],
        layout: baseLayout({
          mode: node.type === "row" ? "row" : "stack",
          gap: node.gap ?? 16,
          padding: [pad, pad, pad, pad],
          align: node.type === "row" ? "center" : "stretch"
        })
      };
      nodes[id].children = node.children.map((c) => build(c, id));
      return id;
    }
    if (node.type === "heading" || node.type === "text") {
      nodes[id] = {
        id,
        name: node.type === "heading" ? "Heading" : "Text",
        type: "text",
        parentId,
        children: [],
        content: { text: node.text, textTag: node.type === "heading" ? `h${node.level}` : "p" },
        layout: baseLayout()
      };
      return id;
    }
    const comp = node;
    const { variantKey, props } = PROP_FOR_RENDER[comp.type](comp.props);
    nodes[id] = {
      id,
      name: comp.type,
      type: "instance",
      parentId,
      children: [],
      instance: { definitionId: comp.type, variantKey, props },
      layout: baseLayout({ widthMode: comp.type === "button" || comp.type === "badge" ? "hug" : "fill" })
    };
    return id;
  };
  build(tree, null);
  return { ...page, nodes };
}
function countDesignNodes(tree) {
  return "children" in tree ? 1 + tree.children.reduce((n, c) => n + countDesignNodes(c), 0) : 1;
}

// src/connectorLinks.ts
function normalizeLabel(value) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}
function buttonLabel(node) {
  if (node.type !== "instance" || node.instance?.definitionId !== "button") return null;
  const label = String(node.instance.props?.children ?? "").trim();
  return label || null;
}
function listPageButtons(page) {
  const out = [];
  for (const node of Object.values(page.nodes)) {
    const label = buttonLabel(node);
    if (label) out.push({ nodeId: node.id, label });
  }
  return out;
}
function attachConnectorButtonNodes(document, pageId, frameId) {
  const notes = [];
  const page = document.project.pages.find((p) => p.id === pageId);
  if (!page) return notes;
  const buttons = listPageButtons(page);
  if (!buttons.length) return notes;
  const connectors = document.project.connectors.filter(
    (c) => c.fromFrameId === frameId && c.fromFrameId !== c.toFrameId
  );
  for (const conn of connectors) {
    const target = normalizeLabel(conn.label ?? conn.trigger ?? "next");
    if (!target) continue;
    const match = buttons.find((b) => normalizeLabel(b.label) === target) ?? buttons.find((b) => target.includes(normalizeLabel(b.label)) || normalizeLabel(b.label).includes(target));
    if (match) {
      conn.fromNodeId = match.nodeId;
      notes.push(`Linked button "${match.label}" to ${conn.label ?? "next screen"}`);
    }
  }
  return notes;
}

// src/templateLibrary/types.ts
var TEMPLATE_LIBRARY_VERSION = 1;
var TEMPLATE_CATEGORIES = [
  "auth",
  "onboarding",
  "app",
  "content",
  "commerce",
  "utility"
];

// src/templateLibrary/nodes.ts
function h1(text2) {
  return { type: "heading", level: 1, text: text2 };
}
function h2(text2) {
  return { type: "heading", level: 2, text: text2 };
}
function copy(text2) {
  return { type: "text", text: text2 };
}
function field(label, placeholder) {
  return { type: "input", props: { label, placeholder: placeholder ?? label } };
}
function btn(label, variant2 = "primary") {
  return { type: "button", props: { label, variant: variant2 } };
}
function card(title, body, variant2 = "outlined") {
  return { type: "card", props: { title, body, variant: variant2 } };
}
function alert(text2, variant2 = "info") {
  return { type: "alert", props: { text: text2, variant: variant2 } };
}
function badge(label, variant2 = "default") {
  return { type: "badge", props: { label, variant: variant2 } };
}
function stack(children, gap = 16, padding = 24) {
  return { type: "stack", gap, padding, children };
}
function row(children, gap = 16, padding = 0) {
  return { type: "row", gap, padding, children };
}
function section(children, gap = 12, padding = 16) {
  return { type: "section", gap, padding, children };
}
function columnOrSplit(device, single, split) {
  if (device === "phone") return stack(single);
  return row([stack(split[0]), stack(split[1])], 24);
}
function primaryActions(labels) {
  const buttons = labels.map((label, i) => btn(label, i === 0 ? "primary" : "secondary"));
  return labels.length > 1 ? row(buttons, 12) : stack(buttons);
}

// src/templateLibrary/a11y.ts
function walk(tree, path, issues) {
  if (tree.type === "heading") {
    return;
  }
  if (tree.type === "input") {
    if (!tree.props.label?.trim()) issues.push({ path, message: "Input missing label" });
    return;
  }
  if ("props" in tree && tree.type === "button") {
    if (!tree.props.label?.trim()) issues.push({ path, message: "Button missing label" });
    return;
  }
  if ("children" in tree) {
    tree.children.forEach((c, i) => walk(c, `${path}.children[${i}]`, issues));
  }
}
function checkDesignTreeA11y(tree) {
  const issues = [];
  walk(tree, "root", issues);
  let hasH1 = false;
  const scan = (n) => {
    if (n.type === "heading" && n.level === 1) hasH1 = true;
    if ("children" in n) n.children.forEach(scan);
  };
  scan(tree);
  if (!hasH1) issues.push({ path: "root", message: "Missing level-1 heading" });
  return issues;
}

// src/templateLibrary/screenBuilder.ts
function variant(id, title, summary, hotspots, build) {
  return { id, title, summary, hotspots, build };
}
function defineScreen(meta) {
  if (meta.variants.length < 2) {
    throw new Error(`${meta.id}: screen templates need at least 2 variants`);
  }
  return meta;
}

// src/templateLibrary/screens/about.ts
var about_default = defineScreen({
  id: "about",
  category: "utility",
  title: "About",
  description: "Company story",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("About"),
        copy("Company story"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for About.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("about") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("about") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("About"),
        copy("Company story"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for About.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("about") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("about") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/api-keys.ts
var api_keys_default = defineScreen({
  id: "api-keys",
  category: "app",
  title: "API keys",
  description: "Tokens for integrations",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("API keys"),
        copy("Tokens for integrations"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for API keys.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("api-keys") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("api-keys") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("API keys"),
        copy("Tokens for integrations"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for API keys.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("api-keys") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("api-keys") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/blog-list.ts
var blog_list_default = defineScreen({
  id: "blog-list",
  category: "utility",
  title: "Blog",
  description: "Article index",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Blog"),
        copy("Article index"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Blog.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("blog-list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("blog-list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Blog"),
        copy("Article index"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Blog.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("blog-list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("blog-list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/blog-post.ts
var blog_post_default = defineScreen({
  id: "blog-post",
  category: "utility",
  title: "Blog post",
  description: "One article",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Blog post"),
        copy("One article"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Blog post.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("blog-post") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("blog-post") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Blog post"),
        copy("One article"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Blog post.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("blog-post") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("blog-post") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/booking-confirm.ts
var booking_confirm_default = defineScreen({
  id: "booking-confirm",
  category: "commerce",
  title: "Confirm booking",
  description: "Review and pay",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Confirm booking"),
        copy("Review and pay"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Confirm booking.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-confirm") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-confirm") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Confirm booking"),
        copy("Review and pay"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Confirm booking.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-confirm") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-confirm") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/booking-details.ts
var booking_details_default = defineScreen({
  id: "booking-details",
  category: "commerce",
  title: "Your details",
  description: "Contact for booking",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Your details"),
        copy("Contact for booking"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Your details.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-details") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-details") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Your details"),
        copy("Contact for booking"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Your details.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-details") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-details") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/booking-reschedule.ts
var booking_reschedule_default = defineScreen({
  id: "booking-reschedule",
  category: "commerce",
  title: "Reschedule",
  description: "Change appointment",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Reschedule"),
        copy("Change appointment"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Reschedule.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-reschedule") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-reschedule") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Reschedule"),
        copy("Change appointment"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Reschedule.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-reschedule") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-reschedule") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/booking-search.ts
var booking_search_default = defineScreen({
  id: "booking-search",
  category: "commerce",
  title: "Find availability",
  description: "Pick service and date",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Find availability"),
        copy("Pick service and date"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Find availability.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-search") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-search") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Find availability"),
        copy("Pick service and date"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Find availability.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-search") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-search") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/booking-slot.ts
var booking_slot_default = defineScreen({
  id: "booking-slot",
  category: "commerce",
  title: "Pick a slot",
  description: "Choose time",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Pick a slot"),
        copy("Choose time"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Pick a slot.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-slot") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-slot") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Pick a slot"),
        copy("Choose time"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Pick a slot.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("booking-slot") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("booking-slot") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/bottom-sheet.ts
var bottom_sheet_default = defineScreen({
  id: "bottom-sheet",
  category: "utility",
  title: "Bottom sheet",
  description: "Sheet over content",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Bottom sheet"),
        copy("Sheet over content"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Bottom sheet.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("bottom-sheet") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("bottom-sheet") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Bottom sheet"),
        copy("Sheet over content"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Bottom sheet.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("bottom-sheet") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("bottom-sheet") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/bulk-actions.ts
var bulk_actions_default = defineScreen({
  id: "bulk-actions",
  category: "app",
  title: "Bulk actions",
  description: "Select many rows",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Bulk actions"),
        copy("Select many rows"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Bulk actions.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("bulk-actions") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("bulk-actions") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Bulk actions"),
        copy("Select many rows"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Bulk actions.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("bulk-actions") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("bulk-actions") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/cart.ts
var cart_default = defineScreen({
  id: "cart",
  category: "commerce",
  title: "Cart",
  description: "Review basket before checkout",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Checkout", "Keep shopping"],
      (device) => stack([
        h1("Cart"),
        copy("Review basket before checkout"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Cart.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("cart") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("cart") ? [field("Search")] : [],
        btn("Checkout", "primary"),
        btn("Keep shopping", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Checkout", "Keep shopping"],
      (device) => stack([
        h1("Cart"),
        copy("Review basket before checkout"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Cart.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("cart") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("cart") ? [field("Search")] : [],
        btn("Checkout", "primary"),
        btn("Keep shopping", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Checkout", "Keep shopping"],
      (device) => stack([
        h1("Cart"),
        copy("Review basket before checkout"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Cart.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("cart") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("cart") ? [field("Search")] : [],
        btn("Checkout", "primary"),
        btn("Keep shopping", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/category-browse.ts
var category_browse_default = defineScreen({
  id: "category-browse",
  category: "commerce",
  title: "Category",
  description: "Products in one category",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Category"),
        copy("Products in one category"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Category.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("category-browse") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("category-browse") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Category"),
        copy("Products in one category"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Category.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("category-browse") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("category-browse") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/change-credentials.ts
var change_credentials_default = defineScreen({
  id: "change-credentials",
  category: "auth",
  title: "Change credentials",
  description: "Update email or password",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Change credentials"),
        copy("Update email or password"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Change credentials.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("change-credentials") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("change-credentials") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Change credentials"),
        copy("Update email or password"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Change credentials.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("change-credentials") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("change-credentials") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/checkout.ts
var checkout_default = defineScreen({
  id: "checkout",
  category: "commerce",
  title: "Checkout",
  description: "Shipping and payment",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Place order", "Pay now"],
      (device) => stack([
        h1("Checkout"),
        copy("Shipping and payment"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Checkout.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("checkout") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("checkout") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Place order", "secondary"),
        btn("Pay now", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Place order"],
      (device) => stack([
        h1("Checkout"),
        copy("Shipping and payment"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Checkout.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("checkout") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("checkout") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Place order", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Place order"],
      (device) => stack([
        h1("Checkout"),
        copy("Shipping and payment"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Checkout.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("checkout") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("checkout") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Place order", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/comments.ts
var comments_default = defineScreen({
  id: "comments",
  category: "content",
  title: "Comments",
  description: "Thread under a post",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Comments"),
        copy("Thread under a post"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Comments.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("comments") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("comments") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Comments"),
        copy("Thread under a post"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Comments.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("comments") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("comments") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/compose-post.ts
var compose_post_default = defineScreen({
  id: "compose-post",
  category: "content",
  title: "Compose",
  description: "Write a new post",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Compose"),
        copy("Write a new post"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Compose.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("compose-post") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("compose-post") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Compose"),
        copy("Write a new post"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Compose.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("compose-post") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("compose-post") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/contact.ts
var contact_default = defineScreen({
  id: "contact",
  category: "utility",
  title: "Contact",
  description: "Get in touch",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Contact"),
        copy("Get in touch"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Contact.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("contact") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("contact") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Contact"),
        copy("Get in touch"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Contact.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("contact") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("contact") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/contact-support.ts
var contact_support_default = defineScreen({
  id: "contact-support",
  category: "utility",
  title: "Contact support",
  description: "Send a message",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Contact support"),
        copy("Send a message"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Contact support.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("contact-support") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("contact-support") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Contact support"),
        copy("Send a message"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Contact support.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("contact-support") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("contact-support") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/cookies-banner.ts
var cookies_banner_default = defineScreen({
  id: "cookies-banner",
  category: "utility",
  title: "Cookies",
  description: "Consent banner",
  variants: [
    variant(
      "default",
      "Default",
      "Standard",
      ["Accept", "Manage preferences"],
      () => stack([h1("Cookies"), copy("Consent banner."), btn("Accept", "primary")])
    ),
    variant(
      "detailed",
      "Detailed",
      "More copy",
      ["Accept all", "Reject non-essential"],
      () => stack([
        h1("Cookies"),
        card("Summary", "Plain language summary of how we use data."),
        btn("Accept all", "primary"),
        btn("Reject non-essential", "ghost")
      ])
    )
  ]
});

// src/templateLibrary/screens/dashboard.ts
var dashboard_default = defineScreen({
  id: "dashboard",
  category: "app",
  title: "Dashboard",
  description: "Summary and shortcuts",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Dashboard"),
        copy("Summary and shortcuts"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Dashboard.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("dashboard") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("dashboard") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Dashboard"),
        copy("Summary and shortcuts"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Dashboard.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("dashboard") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("dashboard") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Dashboard"),
        copy("Summary and shortcuts"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Dashboard.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("dashboard") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("dashboard") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/delete-account.ts
var delete_account_default = defineScreen({
  id: "delete-account",
  category: "auth",
  title: "Delete account",
  description: "Confirm account deletion",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Delete account"),
        copy("Confirm account deletion"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Delete account.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("delete-account") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("delete-account") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Delete account"),
        copy("Confirm account deletion"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Delete account.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("delete-account") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("delete-account") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/empty-state.ts
var empty_state_default = defineScreen({
  id: "empty-state",
  category: "utility",
  title: "Empty state",
  description: "No data yet",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Empty state"),
        copy("No data yet"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Empty state.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("empty-state") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("empty-state") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Empty state"),
        copy("No data yet"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Empty state.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("empty-state") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("empty-state") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Empty state"),
        copy("No data yet"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Empty state.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("empty-state") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("empty-state") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "social-first",
      "Social first",
      "SSO buttons prominent",
      ["Continue", "Back"],
      (device) => stack([
        h1("Empty state"),
        copy("No data yet"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Empty state.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("empty-state") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("empty-state") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/error-404.ts
var error_404_default = defineScreen({
  id: "error-404",
  category: "utility",
  title: "Not found",
  description: "404 page",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Not found"),
        copy("404 page"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Not found.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("error-404") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("error-404") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Not found"),
        copy("404 page"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Not found.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("error-404") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("error-404") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/error-500.ts
var error_500_default = defineScreen({
  id: "error-500",
  category: "utility",
  title: "Server error",
  description: "500 page",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Server error"),
        copy("500 page"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Server error.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("error-500") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("error-500") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Server error"),
        copy("500 page"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Server error.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("error-500") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("error-500") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/features.ts
var features_default = defineScreen({
  id: "features",
  category: "utility",
  title: "Features",
  description: "Product capabilities",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Features"),
        copy("Product capabilities"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Features.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("features") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("features") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Features"),
        copy("Product capabilities"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Features.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("features") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("features") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/feed.ts
var feed_default = defineScreen({
  id: "feed",
  category: "content",
  title: "Feed",
  description: "Timeline of posts",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Feed"),
        copy("Timeline of posts"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Feed.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("feed") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("feed") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Feed"),
        copy("Timeline of posts"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Feed.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("feed") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("feed") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/follow-suggestions.ts
var follow_suggestions_default = defineScreen({
  id: "follow-suggestions",
  category: "content",
  title: "Discover people",
  description: "Who to follow",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Discover people"),
        copy("Who to follow"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Discover people.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("follow-suggestions") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("follow-suggestions") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Discover people"),
        copy("Who to follow"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Discover people.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("follow-suggestions") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("follow-suggestions") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/forgot-password.ts
var forgot_password_default = defineScreen({
  id: "forgot-password",
  category: "auth",
  title: "Forgot password",
  description: "Request a password reset",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Send reset link", "Back to sign in"],
      (device) => stack([
        h1("Forgot password"),
        copy("Request a password reset"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Forgot password.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("forgot-password") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("forgot-password") ? [field("Search")] : [],
        btn("Send reset link", "primary"),
        btn("Back to sign in", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Send reset link", "Back to sign in"],
      (device) => stack([
        h1("Forgot password"),
        copy("Request a password reset"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Forgot password.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("forgot-password") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("forgot-password") ? [field("Search")] : [],
        btn("Send reset link", "primary"),
        btn("Back to sign in", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Send reset link", "Back to sign in"],
      (device) => stack([
        h1("Forgot password"),
        copy("Request a password reset"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Forgot password.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("forgot-password") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("forgot-password") ? [field("Search")] : [],
        btn("Send reset link", "primary"),
        btn("Back to sign in", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/form-create.ts
var form_create_default = defineScreen({
  id: "form-create",
  category: "app",
  title: "Create form",
  description: "Add or edit a record",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Create form"),
        copy("Add or edit a record"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Create form.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("form-create") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("form-create") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Create form"),
        copy("Add or edit a record"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Create form.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("form-create") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("form-create") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Create form"),
        copy("Add or edit a record"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Create form.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("form-create") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("form-create") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/generic-form.ts
var generic_form_default = defineScreen({
  id: "generic-form",
  category: "utility",
  title: "Generic form",
  description: "Fallback form layout",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Generic form"),
        copy("Fallback form layout"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Generic form.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("generic-form") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("generic-form") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Generic form"),
        copy("Fallback form layout"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Generic form.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("generic-form") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("generic-form") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/help-article.ts
var help_article_default = defineScreen({
  id: "help-article",
  category: "utility",
  title: "Help article",
  description: "Read an answer",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Help article"),
        copy("Read an answer"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Help article.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("help-article") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("help-article") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Help article"),
        copy("Read an answer"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Help article.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("help-article") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("help-article") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/help-center.ts
var help_center_default = defineScreen({
  id: "help-center",
  category: "utility",
  title: "Help center",
  description: "Search help articles",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Search", "Contact us"],
      (device) => stack([
        h1("Help center"),
        copy("Search help articles"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Help center.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("help-center") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("help-center") ? [field("Search")] : [],
        btn("Search", "primary"),
        btn("Contact us", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Search", "Contact us"],
      (device) => stack([
        h1("Help center"),
        copy("Search help articles"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Help center.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("help-center") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("help-center") ? [field("Search")] : [],
        btn("Search", "primary"),
        btn("Contact us", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/invite-teammates.ts
var invite_teammates_default = defineScreen({
  id: "invite-teammates",
  category: "onboarding",
  title: "Invite teammates",
  description: "Send invites by email",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Invite teammates"),
        copy("Send invites by email"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Invite teammates.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("invite-teammates") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("invite-teammates") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Invite teammates"),
        copy("Send invites by email"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Invite teammates.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("invite-teammates") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("invite-teammates") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/legal-privacy.ts
var legal_privacy_default = defineScreen({
  id: "legal-privacy",
  category: "utility",
  title: "Privacy policy",
  description: "Data use",
  variants: [
    variant(
      "default",
      "Default",
      "Standard",
      ["Accept", "Manage preferences"],
      () => stack([h1("Privacy policy"), copy("Data use."), btn("Accept", "primary")])
    ),
    variant(
      "detailed",
      "Detailed",
      "More copy",
      ["Accept all", "Reject non-essential"],
      () => stack([
        h1("Privacy policy"),
        card("Summary", "Plain language summary of how we use data."),
        btn("Accept all", "primary"),
        btn("Reject non-essential", "ghost")
      ])
    )
  ]
});

// src/templateLibrary/screens/legal-terms.ts
var legal_terms_default = defineScreen({
  id: "legal-terms",
  category: "utility",
  title: "Terms of service",
  description: "Legal terms",
  variants: [
    variant(
      "default",
      "Default",
      "Standard",
      ["Accept", "Manage preferences"],
      () => stack([h1("Terms of service"), copy("Legal terms."), btn("Accept", "primary")])
    ),
    variant(
      "detailed",
      "Detailed",
      "More copy",
      ["Accept all", "Reject non-essential"],
      () => stack([
        h1("Terms of service"),
        card("Summary", "Plain language summary of how we use data."),
        btn("Accept all", "primary"),
        btn("Reject non-essential", "ghost")
      ])
    )
  ]
});

// src/templateLibrary/screens/list.ts
var list_default = defineScreen({
  id: "list",
  category: "app",
  title: "List",
  description: "Rows of items",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("List"),
        copy("Rows of items"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for List.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("List"),
        copy("Rows of items"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for List.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("List"),
        copy("Rows of items"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for List.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/login.ts
function passwordFields() {
  return [field("Email", "you@example.com"), field("Password", "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022")];
}
var login_default = defineScreen({
  id: "login",
  category: "auth",
  title: "Log in",
  description: "Sign in to an existing account",
  variants: [
    variant(
      "classic",
      "Email and password",
      "Centered form with primary sign-in and account links",
      ["Sign in", "Forgot password?", "Create account"],
      (device) => stack([
        h1("Welcome back"),
        copy("Sign in to continue to your workspace."),
        ...passwordFields(),
        btn("Sign in", "primary"),
        row([btn("Forgot password?", "ghost"), btn("Create account", "ghost")], 8),
        ...device !== "phone" ? [card("Tip", "Use your work email if your team invited you.", "ghost")] : []
      ], 20, 28)
    ),
    variant(
      "social-first",
      "Social first",
      "SSO buttons above the email form",
      ["Continue with Google", "Continue with Apple", "Sign in", "Create account"],
      () => stack([
        h1("Log in"),
        btn("Continue with Google", "primary"),
        btn("Continue with Apple", "secondary"),
        alert("We never post on your behalf.", "info"),
        copy("Or use your email"),
        ...passwordFields(),
        btn("Sign in", "primary"),
        btn("Create account", "ghost")
      ], 16, 28)
    ),
    variant(
      "magic-link",
      "Magic link",
      "Passwordless email sign-in",
      ["Send magic link", "Use password instead", "Create account"],
      (device) => stack([
        h1("Sign in with email"),
        copy("We will email you a secure link. No password needed."),
        field("Email", "you@example.com"),
        btn("Send magic link", "primary"),
        btn("Use password instead", "ghost"),
        btn("Create account", "ghost"),
        ...device === "desktop" ? [card("Secure login", "Links expire in 15 minutes.", "outlined")] : []
      ], 18, 28)
    ),
    variant(
      "split-hero",
      "Split hero",
      "Marketing panel beside the form on large screens",
      ["Sign in", "Forgot password?", "Create account"],
      (device) => {
        const hero = [
          card("Ship faster", "Bareframe turns flows into clickable prototypes in minutes.", "elevated"),
          badge("Trusted by product teams", "success")
        ];
        const form = [
          h1("Log in"),
          ...passwordFields(),
          btn("Sign in", "primary"),
          btn("Forgot password?", "ghost"),
          btn("Create account", "secondary")
        ];
        return columnOrSplit(device, [...hero, ...form], [hero, form]);
      }
    ),
    variant(
      "minimal",
      "Minimal",
      "Compact sign-in for embedded or modal use",
      ["Sign in", "Create account"],
      () => stack(
        [
          h1("Sign in"),
          field("Email", "Email"),
          field("Password", "Password"),
          btn("Sign in", "primary"),
          btn("Create account", "ghost")
        ],
        12,
        20
      )
    )
  ]
});

// src/templateLibrary/screens/logout.ts
var logout_default = defineScreen({
  id: "logout",
  category: "auth",
  title: "Log out",
  description: "Sign out confirmation",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Log out"),
        copy("Sign out confirmation"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Log out.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("logout") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("logout") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Log out"),
        copy("Sign out confirmation"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Log out.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("logout") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("logout") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/maintenance.ts
var maintenance_default = defineScreen({
  id: "maintenance",
  category: "utility",
  title: "Maintenance",
  description: "Downtime notice",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Maintenance"),
        copy("Downtime notice"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Maintenance.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("maintenance") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("maintenance") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Maintenance"),
        copy("Downtime notice"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Maintenance.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("maintenance") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("maintenance") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/marketing-home.ts
var marketing_home_default = defineScreen({
  id: "marketing-home",
  category: "utility",
  title: "Marketing home",
  description: "Landing hero and CTA",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Get started", "Sign in", "See pricing"],
      (device) => stack([
        h1("Marketing home"),
        copy("Landing hero and CTA"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Marketing home.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("marketing-home") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("marketing-home") ? [field("Search")] : [],
        btn("Get started", "primary"),
        btn("Sign in", "secondary"),
        btn("See pricing", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Get started", "Sign in"],
      (device) => stack([
        h1("Marketing home"),
        copy("Landing hero and CTA"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Marketing home.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("marketing-home") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("marketing-home") ? [field("Search")] : [],
        btn("Get started", "primary"),
        btn("Sign in", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Get started", "Sign in"],
      (device) => stack([
        h1("Marketing home"),
        copy("Landing hero and CTA"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Marketing home.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("marketing-home") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("marketing-home") ? [field("Search")] : [],
        btn("Get started", "primary"),
        btn("Sign in", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/messages.ts
var messages_default = defineScreen({
  id: "messages",
  category: "content",
  title: "Messages",
  description: "Chat inbox",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Messages"),
        copy("Chat inbox"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Messages.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("messages") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("messages") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Messages"),
        copy("Chat inbox"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Messages.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("messages") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("messages") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/my-tickets.ts
var my_tickets_default = defineScreen({
  id: "my-tickets",
  category: "utility",
  title: "My tickets",
  description: "Open requests",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("My tickets"),
        copy("Open requests"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for My tickets.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("my-tickets") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("my-tickets") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("My tickets"),
        copy("Open requests"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for My tickets.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("my-tickets") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("my-tickets") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/notifications.ts
var notifications_default = defineScreen({
  id: "notifications",
  category: "content",
  title: "Notifications",
  description: "Activity alerts",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Notifications"),
        copy("Activity alerts"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Notifications.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("notifications") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("notifications") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Notifications"),
        copy("Activity alerts"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Notifications.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("notifications") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("notifications") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/offline-state.ts
var offline_state_default = defineScreen({
  id: "offline-state",
  category: "utility",
  title: "Offline",
  description: "No network",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Offline"),
        copy("No network"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Offline.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("offline-state") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("offline-state") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Offline"),
        copy("No network"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Offline.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("offline-state") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("offline-state") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/onboarding.ts
var onboarding_default = defineScreen({
  id: "onboarding",
  category: "onboarding",
  title: "Onboarding",
  description: "Welcome and first steps",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Onboarding"),
        copy("Welcome and first steps"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Onboarding.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("onboarding") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("onboarding") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Onboarding"),
        copy("Welcome and first steps"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Onboarding.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("onboarding") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("onboarding") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Onboarding"),
        copy("Welcome and first steps"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Onboarding.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("onboarding") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("onboarding") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/order-confirmation.ts
var order_confirmation_default = defineScreen({
  id: "order-confirmation",
  category: "commerce",
  title: "Order confirmed",
  description: "Receipt and next steps",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Order confirmed"),
        copy("Receipt and next steps"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Order confirmed.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("order-confirmation") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("order-confirmation") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Order confirmed"),
        copy("Receipt and next steps"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Order confirmed.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("order-confirmation") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("order-confirmation") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/order-history.ts
var order_history_default = defineScreen({
  id: "order-history",
  category: "commerce",
  title: "Order history",
  description: "Past purchases",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Order history"),
        copy("Past purchases"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Order history.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("order-history") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("order-history") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Order history"),
        copy("Past purchases"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Order history.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("order-history") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("order-history") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/payment.ts
var payment_default = defineScreen({
  id: "payment",
  category: "commerce",
  title: "Payment",
  description: "Pay with card or wallet",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Payment"),
        copy("Pay with card or wallet"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Payment.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("payment") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("payment") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Payment"),
        copy("Pay with card or wallet"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Payment.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("payment") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("payment") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/payment-failure.ts
var payment_failure_default = defineScreen({
  id: "payment-failure",
  category: "commerce",
  title: "Payment failed",
  description: "Retry or change method",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Payment failed"),
        copy("Retry or change method"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Payment failed.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("payment-failure") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("payment-failure") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Payment failed"),
        copy("Retry or change method"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Payment failed.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("payment-failure") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("payment-failure") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/permissions-prompt.ts
var permissions_prompt_default = defineScreen({
  id: "permissions-prompt",
  category: "onboarding",
  title: "Permissions",
  description: "Notifications or location access",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Permissions"),
        copy("Notifications or location access"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Permissions.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("permissions-prompt") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("permissions-prompt") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Permissions"),
        copy("Notifications or location access"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Permissions.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("permissions-prompt") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("permissions-prompt") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/plan-select.ts
var plan_select_default = defineScreen({
  id: "plan-select",
  category: "onboarding",
  title: "Choose plan",
  description: "Pick a subscription tier",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Choose plan"),
        copy("Pick a subscription tier"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Choose plan.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("plan-select") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("plan-select") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Choose plan"),
        copy("Pick a subscription tier"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Choose plan.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("plan-select") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("plan-select") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Choose plan"),
        copy("Pick a subscription tier"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Choose plan.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("plan-select") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("plan-select") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/post-detail.ts
var post_detail_default = defineScreen({
  id: "post-detail",
  category: "content",
  title: "Post",
  description: "Single post thread",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Post"),
        copy("Single post thread"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Post.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("post-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("post-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Post"),
        copy("Single post thread"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Post.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("post-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("post-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/pricing.ts
var pricing_default = defineScreen({
  id: "pricing",
  category: "utility",
  title: "Pricing",
  description: "Plans and tiers",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Choose plan", "Contact sales"],
      (device) => stack([
        h1("Pricing"),
        copy("Plans and tiers"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Pricing.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("pricing") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("pricing") ? [field("Search")] : [],
        btn("Choose plan", "primary"),
        btn("Contact sales", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Choose plan", "Contact sales"],
      (device) => stack([
        h1("Pricing"),
        copy("Plans and tiers"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Pricing.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("pricing") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("pricing") ? [field("Search")] : [],
        btn("Choose plan", "primary"),
        btn("Contact sales", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Choose plan", "Contact sales"],
      (device) => stack([
        h1("Pricing"),
        copy("Plans and tiers"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Pricing.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("pricing") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("pricing") ? [field("Search")] : [],
        btn("Choose plan", "primary"),
        btn("Contact sales", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/product-catalog.ts
var product_catalog_default = defineScreen({
  id: "product-catalog",
  category: "commerce",
  title: "Product catalog",
  description: "Browse all products",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Product catalog"),
        copy("Browse all products"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Product catalog.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("product-catalog") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("product-catalog") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Product catalog"),
        copy("Browse all products"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Product catalog.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("product-catalog") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("product-catalog") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Product catalog"),
        copy("Browse all products"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Product catalog.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("product-catalog") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("product-catalog") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/product-detail.ts
var product_detail_default = defineScreen({
  id: "product-detail",
  category: "commerce",
  title: "Product detail",
  description: "One item to buy",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Product detail"),
        copy("One item to buy"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Product detail.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("product-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("product-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Product detail"),
        copy("One item to buy"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Product detail.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("product-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("product-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Product detail"),
        copy("One item to buy"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Product detail.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("product-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("product-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/profile-setup.ts
var profile_setup_default = defineScreen({
  id: "profile-setup",
  category: "onboarding",
  title: "Profile setup",
  description: "Collect name and role",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Profile setup"),
        copy("Collect name and role"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Profile setup.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("profile-setup") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("profile-setup") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Profile setup"),
        copy("Collect name and role"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Profile setup.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("profile-setup") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("profile-setup") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Profile setup"),
        copy("Collect name and role"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Profile setup.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("profile-setup") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("profile-setup") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/pull-refresh-list.ts
var pull_refresh_list_default = defineScreen({
  id: "pull-refresh-list",
  category: "utility",
  title: "Refresh list",
  description: "Pull to refresh pattern",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Refresh list"),
        copy("Pull to refresh pattern"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Refresh list.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("pull-refresh-list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("pull-refresh-list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Refresh list"),
        copy("Pull to refresh pattern"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Refresh list.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("pull-refresh-list") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("pull-refresh-list") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/record-detail.ts
var record_detail_default = defineScreen({
  id: "record-detail",
  category: "app",
  title: "Detail",
  description: "View one record",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Detail"),
        copy("View one record"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Detail.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("record-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("record-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Detail"),
        copy("View one record"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Detail.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("record-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("record-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Detail"),
        copy("View one record"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Detail.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("record-detail") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("record-detail") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/register.ts
var register_default = defineScreen({
  id: "register",
  category: "auth",
  title: "Register",
  description: "Create a new account",
  variants: [
    variant(
      "classic",
      "Single step",
      "Full registration on one screen",
      ["Create account", "Sign in"],
      (device) => stack([
        h1("Create your account"),
        copy("Start with a free workspace. Upgrade any time."),
        field("Full name", "Your name"),
        field("Work email", "you@company.com"),
        field("Password", "At least 8 characters"),
        btn("Create account", "primary"),
        btn("Sign in", "ghost"),
        ...device !== "phone" ? [alert("By continuing you agree to our terms and privacy policy.", "info")] : []
      ], 18, 28)
    ),
    variant(
      "multi-step",
      "Multi-step",
      "Step one of a short wizard",
      ["Continue", "Sign in"],
      () => stack([
        badge("Step 1 of 3", "outline"),
        h1("Your details"),
        copy("Tell us who you are. You can invite teammates next."),
        field("Full name", "Your name"),
        field("Work email", "you@company.com"),
        field("Password", "Create a password"),
        btn("Continue", "primary"),
        btn("Sign in", "ghost")
      ], 16, 28)
    ),
    variant(
      "social-plus-email",
      "Social plus email",
      "SSO options with email signup below",
      ["Continue with Google", "Create account", "Sign in"],
      (device) => {
        const body = [
          h1("Get started free"),
          btn("Continue with Google", "primary"),
          btn("Continue with Apple", "secondary"),
          copy("Or register with email"),
          field("Work email", "you@company.com"),
          field("Password", "Create a password"),
          btn("Create account", "primary"),
          btn("Sign in", "ghost")
        ];
        if (device === "tablet" || device === "desktop") {
          body.splice(1, 0, card("Teams", "Unlimited viewers on every plan.", "outlined"));
        }
        return stack(body, 16, 28);
      }
    ),
    variant(
      "invite",
      "Invite acceptance",
      "Join a team from an email invite",
      ["Join workspace", "Sign in"],
      () => stack([
        h1("You are invited"),
        card("Acme product team", "Sam invited you as a designer.", "elevated"),
        field("Full name", "Your name"),
        field("Password", "Choose a password"),
        btn("Join workspace", "primary"),
        btn("Sign in", "ghost")
      ], 16, 28)
    )
  ]
});

// src/templateLibrary/screens/reset-password.ts
var reset_password_default = defineScreen({
  id: "reset-password",
  category: "auth",
  title: "Reset password",
  description: "Choose a new password",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Save password", "Back to sign in"],
      (device) => stack([
        h1("Reset password"),
        copy("Choose a new password"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Reset password.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("reset-password") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("reset-password") ? [field("Search")] : [],
        btn("Save password", "primary"),
        btn("Back to sign in", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Save password", "Back to sign in"],
      (device) => stack([
        h1("Reset password"),
        copy("Choose a new password"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Reset password.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("reset-password") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("reset-password") ? [field("Search")] : [],
        btn("Save password", "primary"),
        btn("Back to sign in", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Save password", "Back to sign in"],
      (device) => stack([
        h1("Reset password"),
        copy("Choose a new password"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Reset password.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("reset-password") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("reset-password") ? [field("Search")] : [],
        btn("Save password", "primary"),
        btn("Back to sign in", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/returns.ts
var returns_default = defineScreen({
  id: "returns",
  category: "commerce",
  title: "Returns",
  description: "Start a return request",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Returns"),
        copy("Start a return request"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Returns.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("returns") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("returns") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Returns"),
        copy("Start a return request"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Returns.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("returns") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("returns") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/search.ts
var search_default = defineScreen({
  id: "search",
  category: "commerce",
  title: "Search",
  description: "Find products or content",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Search"),
        copy("Find products or content"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Search.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("search") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("search") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Search"),
        copy("Find products or content"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Search.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("search") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("search") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Search"),
        copy("Find products or content"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Search.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("search") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("search") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/search-results.ts
var search_results_default = defineScreen({
  id: "search-results",
  category: "content",
  title: "Search results",
  description: "Query matches",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Search results"),
        copy("Query matches"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Search results.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("search-results") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("search-results") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Search results"),
        copy("Query matches"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Search results.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("search-results") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("search-results") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/settings.ts
var settings_default = defineScreen({
  id: "settings",
  category: "app",
  title: "Settings",
  description: "Account preferences",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Settings"),
        copy("Account preferences"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Settings.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Settings"),
        copy("Account preferences"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Settings.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Settings"),
        copy("Account preferences"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Settings.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/settings-billing.ts
var settings_billing_default = defineScreen({
  id: "settings-billing",
  category: "app",
  title: "Billing",
  description: "Plan and invoices",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Billing"),
        copy("Plan and invoices"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Billing.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings-billing") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings-billing") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Billing"),
        copy("Plan and invoices"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Billing.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings-billing") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings-billing") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/settings-security.ts
var settings_security_default = defineScreen({
  id: "settings-security",
  category: "app",
  title: "Security",
  description: "Password and 2FA",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Security"),
        copy("Password and 2FA"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Security.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings-security") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings-security") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Security"),
        copy("Password and 2FA"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Security.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings-security") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings-security") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/settings-team.ts
var settings_team_default = defineScreen({
  id: "settings-team",
  category: "app",
  title: "Team",
  description: "Members and roles",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Team"),
        copy("Members and roles"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Team.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings-team") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings-team") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Team"),
        copy("Members and roles"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Team.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("settings-team") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("settings-team") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/splash.ts
var splash_default = defineScreen({
  id: "splash",
  category: "utility",
  title: "Splash",
  description: "App launch screen",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Splash"),
        copy("App launch screen"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Splash.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("splash") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("splash") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Splash"),
        copy("App launch screen"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Splash.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("splash") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("splash") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/subscription-cancel.ts
var subscription_cancel_default = defineScreen({
  id: "subscription-cancel",
  category: "app",
  title: "Cancel subscription",
  description: "Offboarding from paid plan",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Cancel subscription"),
        copy("Offboarding from paid plan"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Cancel subscription.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("subscription-cancel") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("subscription-cancel") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Cancel subscription"),
        copy("Offboarding from paid plan"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Cancel subscription.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("subscription-cancel") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("subscription-cancel") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/tab-shell.ts
var tab_shell_default = defineScreen({
  id: "tab-shell",
  category: "utility",
  title: "App shell",
  description: "Tab bar navigation",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("App shell"),
        copy("Tab bar navigation"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for App shell.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("tab-shell") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("tab-shell") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("App shell"),
        copy("Tab bar navigation"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for App shell.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("tab-shell") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("tab-shell") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/ticket-submitted.ts
var ticket_submitted_default = defineScreen({
  id: "ticket-submitted",
  category: "utility",
  title: "Ticket sent",
  description: "Confirmation",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Ticket sent"),
        copy("Confirmation"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Ticket sent.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("ticket-submitted") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("ticket-submitted") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Ticket sent"),
        copy("Confirmation"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Ticket sent.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("ticket-submitted") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("ticket-submitted") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/two-factor.ts
var two_factor_default = defineScreen({
  id: "two-factor",
  category: "auth",
  title: "Two-factor auth",
  description: "Enter a second factor code",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Two-factor auth"),
        copy("Enter a second factor code"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Two-factor auth.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("two-factor") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("two-factor") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Two-factor auth"),
        copy("Enter a second factor code"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Two-factor auth.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("two-factor") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("two-factor") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Two-factor auth"),
        copy("Enter a second factor code"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Two-factor auth.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("two-factor") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("two-factor") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/upgrade-paywall.ts
var upgrade_paywall_default = defineScreen({
  id: "upgrade-paywall",
  category: "app",
  title: "Upgrade",
  description: "Pro feature gate",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Upgrade"),
        copy("Pro feature gate"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Upgrade.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("upgrade-paywall") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("upgrade-paywall") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Upgrade"),
        copy("Pro feature gate"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Upgrade.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("upgrade-paywall") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("upgrade-paywall") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/user-profile.ts
var user_profile_default = defineScreen({
  id: "user-profile",
  category: "content",
  title: "Profile",
  description: "Public user page",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Profile"),
        copy("Public user page"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Profile.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("user-profile") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("user-profile") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Profile"),
        copy("Public user page"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Profile.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("user-profile") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("user-profile") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/verify-email.ts
var verify_email_default = defineScreen({
  id: "verify-email",
  category: "auth",
  title: "Verify email",
  description: "Confirm email or phone",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Verify email"),
        copy("Confirm email or phone"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Verify email.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("verify-email") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("verify-email") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Verify email"),
        copy("Confirm email or phone"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Verify email.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("verify-email") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("verify-email") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    ),
    variant(
      "split",
      "Split view",
      "Hero beside form on large screens",
      ["Continue", "Back"],
      (device) => stack([
        h1("Verify email"),
        copy("Confirm email or phone"),
        ...device !== "phone" && true ? [card("Highlight", "Visual or summary for Verify email.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("verify-email") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("verify-email") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/wishlist.ts
var wishlist_default = defineScreen({
  id: "wishlist",
  category: "commerce",
  title: "Wishlist",
  description: "Saved items",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Wishlist"),
        copy("Saved items"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Wishlist.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("wishlist") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("wishlist") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Wishlist"),
        copy("Saved items"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Wishlist.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("wishlist") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("wishlist") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/screens/workspace-create.ts
var workspace_create_default = defineScreen({
  id: "workspace-create",
  category: "onboarding",
  title: "Create workspace",
  description: "Name a team workspace",
  variants: [
    variant(
      "classic",
      "Classic",
      "Standard layout",
      ["Continue", "Back", "Save"],
      (device) => stack([
        h1("Create workspace"),
        copy("Name a team workspace"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Create workspace.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("workspace-create") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("workspace-create") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary"),
        btn("Save", "secondary")
      ])
    ),
    variant(
      "compact",
      "Compact",
      "Tighter spacing",
      ["Continue", "Back"],
      (device) => stack([
        h1("Create workspace"),
        copy("Name a team workspace"),
        ...device !== "phone" && false ? [card("Highlight", "Visual or summary for Create workspace.", "elevated")] : [],
        ...["login", "register", "forgot-password", "reset-password", "verify-email", "change-credentials", "profile-setup", "booking-details", "contact-support", "form-create", "checkout", "payment", "generic-form"].includes("workspace-create") ? [field("Email"), field("Password")] : [],
        ...["search", "product-catalog", "help-center", "feed", "list"].includes("workspace-create") ? [field("Search")] : [],
        btn("Continue", "primary"),
        btn("Back", "secondary")
      ])
    )
  ]
});

// src/templateLibrary/flows/blog.ts
var FLOW = {
  id: "blog",
  category: "utility",
  title: "Blog",
  description: "List and read articles",
  spec: {
    "screens": [
      {
        "id": "blog-list",
        "name": "Blog",
        "purpose": "Template: blog-list",
        "keyContent": [
          "Blog content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "blog-post",
        "name": "Article",
        "purpose": "Template: blog-post",
        "keyContent": [
          "Article content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "blog-list",
        "to": "blog-post",
        "trigger": "Read more"
      }
    ]
  },
  defaultScreenVariants: {
    "blog-list": "classic",
    "blog-post": "classic"
  }
};
var blog_default = FLOW;

// src/templateLibrary/flows/booking.ts
var FLOW2 = {
  id: "booking",
  category: "commerce",
  title: "Book appointment",
  description: "Search, slot, details, confirm",
  spec: {
    "screens": [
      {
        "id": "booking-search",
        "name": "Services",
        "purpose": "Template: booking-search",
        "keyContent": [
          "Services content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "booking-slot",
        "name": "Pick time",
        "purpose": "Template: booking-slot",
        "keyContent": [
          "Pick time content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "booking-details",
        "name": "Details",
        "purpose": "Template: booking-details",
        "keyContent": [
          "Details content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "booking-confirm",
        "name": "Confirm",
        "purpose": "Template: booking-confirm",
        "keyContent": [
          "Confirm content"
        ],
        "states": [
          "default",
          "success"
        ]
      }
    ],
    "connections": [
      {
        "from": "booking-search",
        "to": "booking-slot",
        "trigger": "Continue"
      },
      {
        "from": "booking-slot",
        "to": "booking-details",
        "trigger": "Select time"
      },
      {
        "from": "booking-details",
        "to": "booking-confirm",
        "trigger": "Continue"
      }
    ]
  },
  defaultScreenVariants: {
    "booking-search": "classic",
    "booking-slot": "classic",
    "booking-details": "classic",
    "booking-confirm": "classic"
  }
};
var booking_default = FLOW2;

// src/templateLibrary/flows/booking-reschedule.ts
var FLOW3 = {
  id: "booking-reschedule",
  category: "commerce",
  title: "Reschedule booking",
  description: "Change an appointment",
  spec: {
    "screens": [
      {
        "id": "booking-confirm",
        "name": "Booking",
        "purpose": "Template: booking-confirm",
        "keyContent": [
          "Booking content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "booking-reschedule",
        "name": "Reschedule",
        "purpose": "Template: booking-reschedule",
        "keyContent": [
          "Reschedule content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "booking-slot",
        "name": "New time",
        "purpose": "Template: booking-slot",
        "keyContent": [
          "New time content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "booking-confirm",
        "to": "booking-reschedule",
        "trigger": "Reschedule"
      },
      {
        "from": "booking-reschedule",
        "to": "booking-slot",
        "trigger": "Choose new time"
      },
      {
        "from": "booking-slot",
        "to": "booking-confirm",
        "trigger": "Confirm"
      }
    ]
  },
  defaultScreenVariants: {
    "booking-confirm": "classic",
    "booking-reschedule": "classic",
    "booking-slot": "classic"
  }
};
var booking_reschedule_default2 = FLOW3;

// src/templateLibrary/flows/cancel-subscription.ts
var FLOW4 = {
  id: "cancel-subscription",
  category: "app",
  title: "Cancel subscription",
  description: "Leave paid plan",
  spec: {
    "screens": [
      {
        "id": "settings-billing",
        "name": "Billing",
        "purpose": "Template: settings-billing",
        "keyContent": [
          "Billing content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "subscription-cancel",
        "name": "Cancel",
        "purpose": "Template: subscription-cancel",
        "keyContent": [
          "Cancel content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "settings-billing",
        "to": "subscription-cancel",
        "trigger": "Cancel plan"
      },
      {
        "from": "subscription-cancel",
        "to": "dashboard",
        "trigger": "Confirm cancellation"
      }
    ]
  },
  defaultScreenVariants: {
    "settings-billing": "classic",
    "subscription-cancel": "classic",
    "dashboard": "classic"
  }
};
var cancel_subscription_default = FLOW4;

// src/templateLibrary/flows/checkout.ts
var FLOW5 = {
  id: "checkout",
  category: "commerce",
  title: "Shop checkout",
  description: "Browse, cart, checkout, and confirmation",
  spec: {
    "screens": [
      {
        "id": "product-catalog",
        "name": "Catalog",
        "purpose": "Template: product-catalog",
        "keyContent": [
          "Catalog content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "product-detail",
        "name": "Product",
        "purpose": "Template: product-detail",
        "keyContent": [
          "Product content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "cart",
        "name": "Cart",
        "purpose": "Template: cart",
        "keyContent": [
          "Cart content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "checkout",
        "name": "Checkout",
        "purpose": "Template: checkout",
        "keyContent": [
          "Checkout content"
        ],
        "states": [
          "default",
          "error"
        ]
      },
      {
        "id": "order-confirmation",
        "name": "Confirmed",
        "purpose": "Template: order-confirmation",
        "keyContent": [
          "Confirmed content"
        ],
        "states": [
          "success"
        ]
      }
    ],
    "connections": [
      {
        "from": "product-catalog",
        "to": "product-detail",
        "trigger": "Open product"
      },
      {
        "from": "product-detail",
        "to": "cart",
        "trigger": "Add to basket"
      },
      {
        "from": "cart",
        "to": "checkout",
        "trigger": "Checkout"
      },
      {
        "from": "checkout",
        "to": "order-confirmation",
        "trigger": "Place order"
      },
      {
        "from": "cart",
        "to": "product-catalog",
        "trigger": "Keep shopping"
      }
    ]
  },
  defaultScreenVariants: {
    "product-catalog": "classic",
    "product-detail": "classic",
    "cart": "classic",
    "checkout": "classic",
    "order-confirmation": "classic"
  }
};
var checkout_default2 = FLOW5;

// src/templateLibrary/flows/guest-checkout.ts
var FLOW6 = {
  id: "guest-checkout",
  category: "commerce",
  title: "Guest checkout",
  description: "Checkout without an account",
  spec: {
    "screens": [
      {
        "id": "cart",
        "name": "Cart",
        "purpose": "Template: cart",
        "keyContent": [
          "Cart content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "checkout",
        "name": "Checkout",
        "purpose": "Template: checkout",
        "keyContent": [
          "Checkout content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "payment-failure",
        "name": "Payment failed",
        "purpose": "Template: payment-failure",
        "keyContent": [
          "Payment failed content"
        ],
        "states": [
          "error"
        ]
      },
      {
        "id": "order-confirmation",
        "name": "Confirmed",
        "purpose": "Template: order-confirmation",
        "keyContent": [
          "Confirmed content"
        ],
        "states": [
          "success"
        ]
      }
    ],
    "connections": [
      {
        "from": "cart",
        "to": "checkout",
        "trigger": "Checkout"
      },
      {
        "from": "checkout",
        "to": "order-confirmation",
        "trigger": "Place order"
      },
      {
        "from": "checkout",
        "to": "payment-failure",
        "trigger": "Pay now"
      },
      {
        "from": "payment-failure",
        "to": "checkout",
        "trigger": "Try again"
      }
    ]
  },
  defaultScreenVariants: {
    "cart": "classic",
    "checkout": "classic",
    "payment-failure": "classic",
    "order-confirmation": "classic"
  }
};
var guest_checkout_default = FLOW6;

// src/templateLibrary/flows/invite-sign-up.ts
var FLOW7 = {
  id: "invite-sign-up",
  category: "onboarding",
  title: "Invite acceptance",
  description: "Accept invite and join workspace",
  spec: {
    "screens": [
      {
        "id": "register",
        "name": "Join team",
        "purpose": "Template: register",
        "keyContent": [
          "Join team content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "workspace-create",
        "name": "Workspace",
        "purpose": "Template: workspace-create",
        "keyContent": [
          "Workspace content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "invite-teammates",
        "name": "Invite",
        "purpose": "Template: invite-teammates",
        "keyContent": [
          "Invite content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "register",
        "to": "workspace-create",
        "trigger": "Create account"
      },
      {
        "from": "workspace-create",
        "to": "invite-teammates",
        "trigger": "Continue"
      },
      {
        "from": "invite-teammates",
        "to": "dashboard",
        "trigger": "Skip for now"
      }
    ]
  },
  defaultScreenVariants: {
    "register": "classic",
    "workspace-create": "classic",
    "invite-teammates": "classic",
    "dashboard": "classic"
  }
};
var invite_sign_up_default = FLOW7;

// src/templateLibrary/flows/magic-link-sign-in.ts
var FLOW8 = {
  id: "magic-link-sign-in",
  category: "auth",
  title: "Magic link sign in",
  description: "Email link login and dashboard",
  spec: {
    "screens": [
      {
        "id": "login",
        "name": "Log in",
        "purpose": "Template: login",
        "keyContent": [
          "Log in content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "verify-email",
        "name": "Check email",
        "purpose": "Template: verify-email",
        "keyContent": [
          "Check email content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "login",
        "to": "verify-email",
        "trigger": "Send magic link"
      },
      {
        "from": "verify-email",
        "to": "dashboard",
        "trigger": "Continue"
      }
    ]
  },
  defaultScreenVariants: {
    "login": "classic",
    "verify-email": "classic",
    "dashboard": "classic"
  }
};
var magic_link_sign_in_default = FLOW8;

// src/templateLibrary/flows/marketing-site.ts
var FLOW9 = {
  id: "marketing-site",
  category: "utility",
  title: "Marketing site",
  description: "Home, features, pricing, contact",
  spec: {
    "screens": [
      {
        "id": "marketing-home",
        "name": "Home",
        "purpose": "Template: marketing-home",
        "keyContent": [
          "Home content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "features",
        "name": "Features",
        "purpose": "Template: features",
        "keyContent": [
          "Features content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "pricing",
        "name": "Pricing",
        "purpose": "Template: pricing",
        "keyContent": [
          "Pricing content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "contact",
        "name": "Contact",
        "purpose": "Template: contact",
        "keyContent": [
          "Contact content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "legal-terms",
        "name": "Terms",
        "purpose": "Template: legal-terms",
        "keyContent": [
          "Terms content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "marketing-home",
        "to": "features",
        "trigger": "See features"
      },
      {
        "from": "marketing-home",
        "to": "pricing",
        "trigger": "See pricing"
      },
      {
        "from": "features",
        "to": "contact",
        "trigger": "Contact"
      },
      {
        "from": "pricing",
        "to": "marketing-home",
        "trigger": "Get started"
      }
    ]
  },
  defaultScreenVariants: {
    "marketing-home": "classic",
    "features": "classic",
    "pricing": "classic",
    "contact": "classic",
    "legal-terms": "classic"
  }
};
var marketing_site_default = FLOW9;

// src/templateLibrary/flows/messages-chat.ts
var FLOW10 = {
  id: "messages-chat",
  category: "content",
  title: "Messages",
  description: "Inbox and thread",
  spec: {
    "screens": [
      {
        "id": "messages",
        "name": "Inbox",
        "purpose": "Template: messages",
        "keyContent": [
          "Inbox content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "user-profile",
        "name": "Contact",
        "purpose": "Template: user-profile",
        "keyContent": [
          "Contact content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "messages",
        "to": "user-profile",
        "trigger": "Open contact"
      }
    ]
  },
  defaultScreenVariants: {
    "messages": "classic",
    "user-profile": "classic"
  }
};
var messages_chat_default = FLOW10;

// src/templateLibrary/flows/mobile-shell.ts
var FLOW11 = {
  id: "mobile-shell",
  category: "utility",
  title: "Mobile app shell",
  description: "Splash and tab shell",
  spec: {
    "screens": [
      {
        "id": "splash",
        "name": "Splash",
        "purpose": "Template: splash",
        "keyContent": [
          "Splash content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "tab-shell",
        "name": "Home",
        "purpose": "Template: tab-shell",
        "keyContent": [
          "Home content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "pull-refresh-list",
        "name": "List",
        "purpose": "Template: pull-refresh-list",
        "keyContent": [
          "List content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "splash",
        "to": "tab-shell",
        "trigger": "Continue"
      },
      {
        "from": "tab-shell",
        "to": "pull-refresh-list",
        "trigger": "Open list"
      }
    ]
  },
  defaultScreenVariants: {
    "splash": "classic",
    "tab-shell": "classic",
    "pull-refresh-list": "classic"
  }
};
var mobile_shell_default = FLOW11;

// src/templateLibrary/flows/order-returns.ts
var FLOW12 = {
  id: "order-returns",
  category: "commerce",
  title: "Orders and returns",
  description: "History and return flow",
  spec: {
    "screens": [
      {
        "id": "order-history",
        "name": "Orders",
        "purpose": "Template: order-history",
        "keyContent": [
          "Orders content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "order-confirmation",
        "name": "Order detail",
        "purpose": "Template: order-confirmation",
        "keyContent": [
          "Order detail content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "returns",
        "name": "Return",
        "purpose": "Template: returns",
        "keyContent": [
          "Return content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "order-history",
        "to": "order-confirmation",
        "trigger": "View order"
      },
      {
        "from": "order-confirmation",
        "to": "returns",
        "trigger": "Start return"
      }
    ]
  },
  defaultScreenVariants: {
    "order-history": "classic",
    "order-confirmation": "classic",
    "returns": "classic"
  }
};
var order_returns_default = FLOW12;

// src/templateLibrary/flows/plan-onboarding.ts
var FLOW13 = {
  id: "plan-onboarding",
  category: "onboarding",
  title: "Plan selection onboarding",
  description: "Pick a plan after signup",
  spec: {
    "screens": [
      {
        "id": "plan-select",
        "name": "Choose plan",
        "purpose": "Template: plan-select",
        "keyContent": [
          "Choose plan content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "pricing",
        "name": "Pricing",
        "purpose": "Template: pricing",
        "keyContent": [
          "Pricing content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "checkout",
        "name": "Checkout",
        "purpose": "Template: checkout",
        "keyContent": [
          "Checkout content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "success"
        ]
      }
    ],
    "connections": [
      {
        "from": "plan-select",
        "to": "pricing",
        "trigger": "See all plans"
      },
      {
        "from": "pricing",
        "to": "checkout",
        "trigger": "Choose plan"
      },
      {
        "from": "checkout",
        "to": "dashboard",
        "trigger": "Place order"
      }
    ]
  },
  defaultScreenVariants: {
    "plan-select": "classic",
    "pricing": "classic",
    "checkout": "classic",
    "dashboard": "classic"
  }
};
var plan_onboarding_default = FLOW13;

// src/templateLibrary/flows/saas-crud.ts
var FLOW14 = {
  id: "saas-crud",
  category: "app",
  title: "List, detail, edit",
  description: "Core SaaS CRUD journey",
  spec: {
    "screens": [
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "list",
        "name": "List",
        "purpose": "Template: list",
        "keyContent": [
          "List content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "record-detail",
        "name": "Detail",
        "purpose": "Template: record-detail",
        "keyContent": [
          "Detail content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "form-create",
        "name": "Edit",
        "purpose": "Template: form-create",
        "keyContent": [
          "Edit content"
        ],
        "states": [
          "default",
          "error"
        ]
      }
    ],
    "connections": [
      {
        "from": "dashboard",
        "to": "list",
        "trigger": "View all"
      },
      {
        "from": "list",
        "to": "record-detail",
        "trigger": "Open"
      },
      {
        "from": "record-detail",
        "to": "form-create",
        "trigger": "Edit"
      },
      {
        "from": "form-create",
        "to": "list",
        "trigger": "Save"
      }
    ]
  },
  defaultScreenVariants: {
    "dashboard": "classic",
    "list": "classic",
    "record-detail": "classic",
    "form-create": "classic"
  }
};
var saas_crud_default = FLOW14;

// src/templateLibrary/flows/search-detail.ts
var FLOW15 = {
  id: "search-detail",
  category: "content",
  title: "Search to detail",
  description: "Search, open a result, and view detail",
  spec: {
    "screens": [
      {
        "id": "search",
        "name": "Search",
        "purpose": "Template: search",
        "keyContent": [
          "Search content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "search-results",
        "name": "Results",
        "purpose": "Template: search-results",
        "keyContent": [
          "Results content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "record-detail",
        "name": "Detail",
        "purpose": "Template: record-detail",
        "keyContent": [
          "Detail content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "search",
        "to": "search-results",
        "trigger": "Search"
      },
      {
        "from": "search-results",
        "to": "record-detail",
        "trigger": "Open"
      },
      {
        "from": "record-detail",
        "to": "search-results",
        "trigger": "Back"
      }
    ]
  },
  defaultScreenVariants: {
    "search": "classic",
    "search-results": "classic",
    "record-detail": "classic"
  }
};
var search_detail_default = FLOW15;

// src/templateLibrary/flows/settings-account.ts
var FLOW16 = {
  id: "settings-account",
  category: "app",
  title: "Settings and account",
  description: "Dashboard to settings, billing, security, and logout",
  spec: {
    "screens": [
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "settings",
        "name": "Settings",
        "purpose": "Template: settings",
        "keyContent": [
          "Settings content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "settings-billing",
        "name": "Billing",
        "purpose": "Template: settings-billing",
        "keyContent": [
          "Billing content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "settings-security",
        "name": "Security",
        "purpose": "Template: settings-security",
        "keyContent": [
          "Security content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "logout",
        "name": "Log out",
        "purpose": "Template: logout",
        "keyContent": [
          "Log out content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "dashboard",
        "to": "settings",
        "trigger": "Settings"
      },
      {
        "from": "settings",
        "to": "settings-billing",
        "trigger": "Billing"
      },
      {
        "from": "settings",
        "to": "settings-security",
        "trigger": "Security"
      },
      {
        "from": "settings",
        "to": "logout",
        "trigger": "Log out"
      }
    ]
  },
  defaultScreenVariants: {
    "dashboard": "classic",
    "settings": "classic",
    "settings-billing": "classic",
    "settings-security": "classic",
    "logout": "classic"
  }
};
var settings_account_default = FLOW16;

// src/templateLibrary/flows/sign-in.ts
var FLOW17 = {
  id: "sign-in",
  category: "auth",
  title: "Sign in",
  description: "Log in, reset password, and reach the dashboard",
  spec: {
    "screens": [
      {
        "id": "login",
        "name": "Log in",
        "purpose": "Template: login",
        "keyContent": [
          "Log in content"
        ],
        "states": [
          "default",
          "error"
        ]
      },
      {
        "id": "forgot-password",
        "name": "Forgot password",
        "purpose": "Template: forgot-password",
        "keyContent": [
          "Forgot password content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "reset-password",
        "name": "Reset password",
        "purpose": "Template: reset-password",
        "keyContent": [
          "Reset password content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "login",
        "to": "dashboard",
        "trigger": "Sign in"
      },
      {
        "from": "login",
        "to": "forgot-password",
        "trigger": "Forgot password?"
      },
      {
        "from": "forgot-password",
        "to": "reset-password",
        "trigger": "Send reset link"
      },
      {
        "from": "reset-password",
        "to": "login",
        "trigger": "Save password"
      }
    ]
  },
  defaultScreenVariants: {
    "login": "classic",
    "forgot-password": "classic",
    "reset-password": "classic",
    "dashboard": "classic"
  }
};
var sign_in_default = FLOW17;

// src/templateLibrary/flows/sign-up.ts
var FLOW18 = {
  id: "sign-up",
  category: "auth",
  title: "Sign up and onboarding",
  description: "Register, verify, set up profile, and land on dashboard",
  spec: {
    "screens": [
      {
        "id": "register",
        "name": "Register",
        "purpose": "Template: register",
        "keyContent": [
          "Register content"
        ],
        "states": [
          "default",
          "error"
        ]
      },
      {
        "id": "verify-email",
        "name": "Verify email",
        "purpose": "Template: verify-email",
        "keyContent": [
          "Verify email content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "onboarding",
        "name": "Onboarding",
        "purpose": "Template: onboarding",
        "keyContent": [
          "Onboarding content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "profile-setup",
        "name": "Profile",
        "purpose": "Template: profile-setup",
        "keyContent": [
          "Profile content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "register",
        "to": "verify-email",
        "trigger": "Create account"
      },
      {
        "from": "verify-email",
        "to": "onboarding",
        "trigger": "Verify"
      },
      {
        "from": "onboarding",
        "to": "profile-setup",
        "trigger": "Continue"
      },
      {
        "from": "profile-setup",
        "to": "dashboard",
        "trigger": "Continue"
      }
    ]
  },
  defaultScreenVariants: {
    "register": "classic",
    "verify-email": "classic",
    "onboarding": "classic",
    "profile-setup": "classic",
    "dashboard": "classic"
  }
};
var sign_up_default = FLOW18;

// src/templateLibrary/flows/social-feed.ts
var FLOW19 = {
  id: "social-feed",
  category: "content",
  title: "Social feed",
  description: "Feed, post, comments, profile",
  spec: {
    "screens": [
      {
        "id": "feed",
        "name": "Feed",
        "purpose": "Template: feed",
        "keyContent": [
          "Feed content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "compose-post",
        "name": "Compose",
        "purpose": "Template: compose-post",
        "keyContent": [
          "Compose content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "post-detail",
        "name": "Post",
        "purpose": "Template: post-detail",
        "keyContent": [
          "Post content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "comments",
        "name": "Comments",
        "purpose": "Template: comments",
        "keyContent": [
          "Comments content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "user-profile",
        "name": "Profile",
        "purpose": "Template: user-profile",
        "keyContent": [
          "Profile content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "feed",
        "to": "compose-post",
        "trigger": "New post"
      },
      {
        "from": "feed",
        "to": "post-detail",
        "trigger": "Open post"
      },
      {
        "from": "post-detail",
        "to": "comments",
        "trigger": "View comments"
      },
      {
        "from": "post-detail",
        "to": "user-profile",
        "trigger": "View profile"
      }
    ]
  },
  defaultScreenVariants: {
    "feed": "classic",
    "compose-post": "classic",
    "post-detail": "classic",
    "comments": "classic",
    "user-profile": "classic"
  }
};
var social_feed_default = FLOW19;

// src/templateLibrary/flows/sso-sign-in.ts
var FLOW20 = {
  id: "sso-sign-in",
  category: "auth",
  title: "SSO sign in",
  description: "Social login path",
  spec: {
    "screens": [
      {
        "id": "login",
        "name": "Log in",
        "purpose": "Template: login",
        "keyContent": [
          "Log in content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "two-factor",
        "name": "2FA",
        "purpose": "Template: two-factor",
        "keyContent": [
          "2FA content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "login",
        "to": "two-factor",
        "trigger": "Continue with Google"
      },
      {
        "from": "two-factor",
        "to": "dashboard",
        "trigger": "Verify"
      }
    ]
  },
  defaultScreenVariants: {
    "login": "classic",
    "two-factor": "classic",
    "dashboard": "classic"
  }
};
var sso_sign_in_default = FLOW20;

// src/templateLibrary/flows/support-ticket.ts
var FLOW21 = {
  id: "support-ticket",
  category: "utility",
  title: "Support request",
  description: "Help centre to ticket",
  spec: {
    "screens": [
      {
        "id": "help-center",
        "name": "Help",
        "purpose": "Template: help-center",
        "keyContent": [
          "Help content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "help-article",
        "name": "Article",
        "purpose": "Template: help-article",
        "keyContent": [
          "Article content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "contact-support",
        "name": "Contact",
        "purpose": "Template: contact-support",
        "keyContent": [
          "Contact content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "ticket-submitted",
        "name": "Sent",
        "purpose": "Template: ticket-submitted",
        "keyContent": [
          "Sent content"
        ],
        "states": [
          "success"
        ]
      },
      {
        "id": "my-tickets",
        "name": "My tickets",
        "purpose": "Template: my-tickets",
        "keyContent": [
          "My tickets content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "help-center",
        "to": "help-article",
        "trigger": "Open article"
      },
      {
        "from": "help-article",
        "to": "contact-support",
        "trigger": "Still need help"
      },
      {
        "from": "contact-support",
        "to": "ticket-submitted",
        "trigger": "Send"
      },
      {
        "from": "ticket-submitted",
        "to": "my-tickets",
        "trigger": "View my requests"
      }
    ]
  },
  defaultScreenVariants: {
    "help-center": "classic",
    "help-article": "classic",
    "contact-support": "classic",
    "ticket-submitted": "classic",
    "my-tickets": "classic"
  }
};
var support_ticket_default = FLOW21;

// src/templateLibrary/flows/upgrade-paywall.ts
var FLOW22 = {
  id: "upgrade-paywall",
  category: "app",
  title: "Upgrade flow",
  description: "Hit paywall and upgrade",
  spec: {
    "screens": [
      {
        "id": "dashboard",
        "name": "Dashboard",
        "purpose": "Template: dashboard",
        "keyContent": [
          "Dashboard content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "upgrade-paywall",
        "name": "Upgrade",
        "purpose": "Template: upgrade-paywall",
        "keyContent": [
          "Upgrade content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "pricing",
        "name": "Pricing",
        "purpose": "Template: pricing",
        "keyContent": [
          "Pricing content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "checkout",
        "name": "Checkout",
        "purpose": "Template: checkout",
        "keyContent": [
          "Checkout content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "dashboard",
        "to": "upgrade-paywall",
        "trigger": "Upgrade"
      },
      {
        "from": "upgrade-paywall",
        "to": "pricing",
        "trigger": "See plans"
      },
      {
        "from": "pricing",
        "to": "checkout",
        "trigger": "Choose plan"
      }
    ]
  },
  defaultScreenVariants: {
    "dashboard": "classic",
    "upgrade-paywall": "classic",
    "pricing": "classic",
    "checkout": "classic"
  }
};
var upgrade_paywall_default2 = FLOW22;

// src/templateLibrary/flows/wishlist-shop.ts
var FLOW23 = {
  id: "wishlist-shop",
  category: "commerce",
  title: "Wishlist",
  description: "Save items and buy",
  spec: {
    "screens": [
      {
        "id": "wishlist",
        "name": "Wishlist",
        "purpose": "Template: wishlist",
        "keyContent": [
          "Wishlist content"
        ],
        "states": [
          "default",
          "empty"
        ]
      },
      {
        "id": "product-detail",
        "name": "Product",
        "purpose": "Template: product-detail",
        "keyContent": [
          "Product content"
        ],
        "states": [
          "default"
        ]
      },
      {
        "id": "cart",
        "name": "Cart",
        "purpose": "Template: cart",
        "keyContent": [
          "Cart content"
        ],
        "states": [
          "default"
        ]
      }
    ],
    "connections": [
      {
        "from": "wishlist",
        "to": "product-detail",
        "trigger": "Open product"
      },
      {
        "from": "product-detail",
        "to": "cart",
        "trigger": "Add to basket"
      }
    ]
  },
  defaultScreenVariants: {
    "wishlist": "classic",
    "product-detail": "classic",
    "cart": "classic"
  }
};
var wishlist_shop_default = FLOW23;

// src/templateLibrary/registry.ts
var SCREEN_TEMPLATES = [about_default, api_keys_default, blog_list_default, blog_post_default, booking_confirm_default, booking_details_default, booking_reschedule_default, booking_search_default, booking_slot_default, bottom_sheet_default, bulk_actions_default, cart_default, category_browse_default, change_credentials_default, checkout_default, comments_default, compose_post_default, contact_default, contact_support_default, cookies_banner_default, dashboard_default, delete_account_default, empty_state_default, error_404_default, error_500_default, features_default, feed_default, follow_suggestions_default, forgot_password_default, form_create_default, generic_form_default, help_article_default, help_center_default, invite_teammates_default, legal_privacy_default, legal_terms_default, list_default, login_default, logout_default, maintenance_default, marketing_home_default, messages_default, my_tickets_default, notifications_default, offline_state_default, onboarding_default, order_confirmation_default, order_history_default, payment_default, payment_failure_default, permissions_prompt_default, plan_select_default, post_detail_default, pricing_default, product_catalog_default, product_detail_default, profile_setup_default, pull_refresh_list_default, record_detail_default, register_default, reset_password_default, returns_default, search_default, search_results_default, settings_default, settings_billing_default, settings_security_default, settings_team_default, splash_default, subscription_cancel_default, tab_shell_default, ticket_submitted_default, two_factor_default, upgrade_paywall_default, user_profile_default, verify_email_default, wishlist_default, workspace_create_default];
var FLOW_TEMPLATES = [blog_default, booking_default, booking_reschedule_default2, cancel_subscription_default, checkout_default2, guest_checkout_default, invite_sign_up_default, magic_link_sign_in_default, marketing_site_default, messages_chat_default, mobile_shell_default, order_returns_default, plan_onboarding_default, saas_crud_default, search_detail_default, settings_account_default, sign_in_default, sign_up_default, social_feed_default, sso_sign_in_default, support_ticket_default, upgrade_paywall_default2, wishlist_shop_default];
var screenById = new Map(
  SCREEN_TEMPLATES.map((s) => [s.id, s])
);
var flowById = new Map(FLOW_TEMPLATES.map((f) => [f.id, f]));
function listScreenTemplates() {
  return [...SCREEN_TEMPLATES];
}
function getScreenTemplate(id) {
  const tpl = screenById.get(id);
  if (!tpl) throw new Error(`Unknown screen template "${id}"`);
  return tpl;
}
function listFlowTemplates() {
  return [...FLOW_TEMPLATES];
}
function getFlowTemplate(id) {
  const tpl = flowById.get(id);
  if (!tpl) throw new Error(`Unknown flow template "${id}"`);
  return tpl;
}
var SCREEN_TEMPLATE_IDS = ["about", "api-keys", "blog-list", "blog-post", "booking-confirm", "booking-details", "booking-reschedule", "booking-search", "booking-slot", "bottom-sheet", "bulk-actions", "cart", "category-browse", "change-credentials", "checkout", "comments", "compose-post", "contact", "contact-support", "cookies-banner", "dashboard", "delete-account", "empty-state", "error-404", "error-500", "features", "feed", "follow-suggestions", "forgot-password", "form-create", "generic-form", "help-article", "help-center", "invite-teammates", "legal-privacy", "legal-terms", "list", "login", "logout", "maintenance", "marketing-home", "messages", "my-tickets", "notifications", "offline-state", "onboarding", "order-confirmation", "order-history", "payment", "payment-failure", "permissions-prompt", "plan-select", "post-detail", "pricing", "product-catalog", "product-detail", "profile-setup", "pull-refresh-list", "record-detail", "register", "reset-password", "returns", "search", "search-results", "settings", "settings-billing", "settings-security", "settings-team", "splash", "subscription-cancel", "tab-shell", "ticket-submitted", "two-factor", "upgrade-paywall", "user-profile", "verify-email", "wishlist", "workspace-create"];
var FLOW_TEMPLATE_IDS = ["blog", "booking", "booking-reschedule", "cancel-subscription", "checkout", "guest-checkout", "invite-sign-up", "magic-link-sign-in", "marketing-site", "messages-chat", "mobile-shell", "order-returns", "plan-onboarding", "saas-crud", "search-detail", "settings-account", "sign-in", "sign-up", "social-feed", "sso-sign-in", "support-ticket", "upgrade-paywall", "wishlist-shop"];

// src/templateLibrary/render.ts
var NAME_TO_SCREEN = [
  { pattern: /\b(log\s*in|sign\s*in)\b/i, id: "login" },
  { pattern: /\b(sign\s*up|register|create account)\b/i, id: "register" },
  { pattern: /\b(forgot|reset)\s*password\b/i, id: "forgot-password" },
  { pattern: /\breset\b.*\bpassword\b/i, id: "reset-password" },
  { pattern: /\b(verify|confirm)\s*(email|phone|otp)\b/i, id: "verify-email" },
  { pattern: /\bonboarding|welcome tour|get started\b/i, id: "onboarding" },
  { pattern: /\bdashboard|overview\b/i, id: "dashboard" },
  { pattern: /\bsettings|preferences\b/i, id: "settings" },
  { pattern: /\bprofile\b/i, id: "user-profile" },
  { pattern: /\b(cart|basket)\b/i, id: "cart" },
  { pattern: /\bcheckout\b/i, id: "checkout" },
  { pattern: /\b(order|confirmation|receipt)\b/i, id: "order-confirmation" },
  { pattern: /\bpricing|plans\b/i, id: "pricing" },
  { pattern: /\b(search results|results for)\b/i, id: "search-results" },
  { pattern: /\b(search|find)\b/i, id: "search" },
  { pattern: /\b(product)\s*detail\b/i, id: "product-detail" },
  { pattern: /\b(item|record)\s*detail\b/i, id: "record-detail" },
  { pattern: /\b(list|catalog|browse|feed|inbox)\b/i, id: "list" },
  { pattern: /\bempty\b/i, id: "empty-state" },
  { pattern: /\b404|not found\b/i, id: "error-404" },
  { pattern: /\bnotification/i, id: "notifications" },
  { pattern: /\bhelp|support|ticket/i, id: "help-center" },
  { pattern: /\bmessage|chat\b/i, id: "messages" },
  { pattern: /\bpayment\b/i, id: "payment" },
  { pattern: /\bsplash\b/i, id: "splash" }
];
function inferScreenTemplateId(screenName, purpose) {
  const hay = `${screenName} ${purpose}`;
  for (const row2 of NAME_TO_SCREEN) {
    if (row2.pattern.test(hay)) return row2.id;
  }
  return null;
}
function pickVariantId(templateId, brief, outgoingActions, variantId) {
  const tpl = getScreenTemplate(templateId);
  if (variantId && tpl.variants.some((v) => v.id === variantId)) return variantId;
  const labels = new Set(outgoingActions.map((l) => l.toLowerCase()));
  for (const v of tpl.variants) {
    if (v.hotspots.some((h) => labels.has(h.toLowerCase()))) return v.id;
  }
  if (brief.keyContent.some((k) => /magic|sso|social|google|apple/i.test(k))) {
    const social = tpl.variants.find((v) => /social|sso|magic/i.test(v.id));
    if (social) return social.id;
  }
  return tpl.variants[0].id;
}
function buildScreenVariantTree(templateId, variantId, device) {
  const tpl = getScreenTemplate(templateId);
  const variant2 = tpl.variants.find((v) => v.id === variantId) ?? tpl.variants[0];
  return variant2.build(device);
}
function templateDesignStatesForBrief(screenName, brief, outgoingActions, device, variantId) {
  const id = inferScreenTemplateId(screenName, brief.purpose) ?? inferScreenTemplateId(screenName, screenName);
  const templateId = id ?? "generic-form";
  const vid = pickVariantId(templateId, brief, outgoingActions, variantId);
  const defaultTree = buildScreenVariantTree(templateId, vid, device);
  const states = { default: defaultTree };
  if (brief.states.includes("empty")) {
    states.empty = buildScreenVariantTree("empty-state", "classic", device);
  }
  if (brief.states.includes("loading")) {
    states.loading = buildScreenVariantTree("empty-state", "compact", device);
  }
  if (brief.states.includes("error")) {
    states.error = buildScreenVariantTree("error-500", "classic", device);
  }
  if (brief.states.includes("success")) {
    states.success = buildScreenVariantTree("order-confirmation", "classic", device);
  }
  return states;
}
function listTemplateScreensForApi() {
  return listScreenTemplates();
}

// src/templateLibrary/insert.ts
function applyScreenTemplateToPage(document, options) {
  const doc = structuredClone(document);
  const page = doc.project.pages.find((p) => p.id === options.pageId);
  if (!page) throw new Error("page not found");
  const tpl = getScreenTemplate(options.screenTemplateId);
  const brief = {
    key: page.brief?.key ?? page.id,
    purpose: options.brief?.purpose ?? tpl.description,
    keyContent: options.brief?.keyContent ?? tpl.variants[0].hotspots.map(String),
    states: page.brief?.states ?? ["default"]
  };
  const variantId = pickVariantId(options.screenTemplateId, brief, brief.keyContent, options.variantId);
  const tree = buildScreenVariantTree(options.screenTemplateId, variantId, options.device);
  const idx = doc.project.pages.findIndex((p) => p.id === page.id);
  doc.project.pages[idx] = {
    ...designToNodes({ ...page, name: options.screenName ?? page.name }, tree, options.newId),
    brief: {
      ...brief,
      templateId: options.screenTemplateId,
      templateVariant: variantId
    }
  };
  return doc;
}
function designDeviceFromOptions(options) {
  if (options.platforms?.includes("desktop")) return "desktop";
  if (options.platforms?.includes("tablet")) return "tablet";
  return "phone";
}
function paintFlowScreens(doc, flow, screens, screenId, newId, device) {
  for (const screen of screens) {
    const templateId = screen.purpose.replace(/^Template:\s*/, "");
    const key = screenId(screen.id);
    const page = doc.project.pages.find((p) => (p.brief?.key ?? p.id) === key);
    if (!page) continue;
    try {
      const variantId = flow.defaultScreenVariants[templateId] ?? getScreenTemplate(templateId).variants[0].id;
      const tree = buildScreenVariantTree(templateId, variantId, device);
      const idx = doc.project.pages.findIndex((p) => p.id === page.id);
      doc.project.pages[idx] = {
        ...designToNodes(page, tree, newId),
        brief: {
          ...page.brief ?? { key, purpose: screen.purpose, keyContent: screen.keyContent, states: screen.states },
          templateId,
          templateVariant: variantId
        }
      };
    } catch {
    }
  }
}
function flowBounds(frames) {
  if (!frames.length) return { maxRight: 0 };
  return { maxRight: Math.max(...frames.map((f) => f.x + (f.width ?? FLOW_CARD_WIDTH))) };
}
function insertFlowTemplate(document, options) {
  const flow = getFlowTemplate(options.flowTemplateId);
  const { spec } = repairFlowSpec(flow.spec);
  const device = designDeviceFromOptions(options);
  if (!options.merge) {
    const applied = applyFlowSpec(document, spec, options);
    paintFlowScreens(applied.document, flow, spec.screens, (id) => id, options.newId, device);
    return applied;
  }
  const prefix = `${options.flowTemplateId}-`;
  const merged = {
    screens: spec.screens.map((s) => ({ ...s, id: `${prefix}${s.id}` })),
    connections: spec.connections.map((c) => ({
      from: `${prefix}${c.from}`,
      to: `${prefix}${c.to}`,
      trigger: c.trigger
    }))
  };
  const existing = structuredClone(document);
  const ghost = existing.project.frames.filter((f) => f.ghost);
  const real = existing.project.frames.filter((f) => !f.ghost);
  const offset = flowBounds(real).maxRight + FLOW_CARD_GAP_X;
  const { document: fresh, screenFrameIds } = applyFlowSpec(
    { ...existing, project: { ...existing.project, pages: [], frames: ghost, connectors: [] } },
    merged,
    options
  );
  paintFlowScreens(fresh, flow, spec.screens, (id) => `${prefix}${id}`, options.newId, device);
  for (const frame of fresh.project.frames) {
    if (!frame.ghost) {
      frame.x += offset;
    }
  }
  const mergedDoc = {
    ...existing,
    project: {
      ...existing.project,
      pages: [...existing.project.pages, ...fresh.project.pages],
      frames: [...existing.project.frames, ...fresh.project.frames],
      connectors: [...existing.project.connectors, ...fresh.project.connectors],
      annotations: [...existing.project.annotations, ...fresh.project.annotations],
      productBrief: fresh.project.productBrief ?? existing.project.productBrief
    }
  };
  return { document: mergedDoc, screenFrameIds };
}

// src/templateLibrary/swapVariant.ts
function resolvePageTemplateId(page) {
  const explicit = page.brief?.templateId;
  if (explicit) {
    try {
      getScreenTemplate(explicit);
      return explicit;
    } catch {
    }
  }
  const purpose = page.brief?.purpose?.replace(/^Template:\s*/, "") ?? "";
  if (purpose) {
    try {
      getScreenTemplate(purpose);
      return purpose;
    } catch {
    }
  }
  return inferScreenTemplateId(page.name, page.brief?.purpose ?? "");
}
function variantsForPage(page) {
  const id = resolvePageTemplateId(page);
  if (!id) return null;
  const tpl = getScreenTemplate(id);
  const current = page.brief?.templateVariant;
  return { templateId: id, title: tpl.title, variants: tpl.variants, currentVariantId: current };
}
function swapScreenVariant(document, pageId, frameId, variantId, device, newId) {
  const doc = structuredClone(document);
  const pageIndex = doc.project.pages.findIndex((p) => p.id === pageId);
  const page = doc.project.pages[pageIndex];
  if (!page) throw new Error("page not found");
  const templateId = resolvePageTemplateId(page);
  if (!templateId) throw new Error("no template for screen");
  const tpl = getScreenTemplate(templateId);
  if (!tpl.variants.some((v) => v.id === variantId)) throw new Error("unknown variant");
  const tree = buildScreenVariantTree(templateId, variantId, device);
  const brief = {
    ...page.brief ?? { key: page.id, purpose: "", keyContent: [], states: ["default"] },
    templateId,
    templateVariant: variantId,
    purpose: page.brief?.purpose || tpl.description
  };
  doc.project.pages[pageIndex] = {
    ...designToNodes(page, tree, newId),
    brief
  };
  attachConnectorButtonNodes(doc, pageId, frameId);
  return doc;
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
  DESIGN_COMPONENTS,
  DESIGN_DEVICES,
  DESIGN_LAYOUTS,
  DESIGN_LIMITS,
  DESIGN_SPEC_SCHEMA_HINT,
  DesignSpecError,
  FLOW_CARD_GAP_X,
  FLOW_CARD_GAP_Y,
  FLOW_CARD_HEIGHT,
  FLOW_CARD_WIDTH,
  FLOW_DEVICES,
  FLOW_LABEL_HEIGHT,
  FLOW_LIMITS,
  FLOW_ORIGIN_X,
  FLOW_ORIGIN_Y,
  FLOW_PLATFORMS,
  FLOW_PLATFORM_PRESET,
  FLOW_SPEC_SCHEMA_HINT,
  FLOW_TEMPLATE_IDS,
  FLOW_THUMB_HEIGHT,
  FlowSpecError,
  SCREEN_STATES,
  SCREEN_TEMPLATE_IDS,
  TEMPLATE_CATEGORIES,
  TEMPLATE_LIBRARY_VERSION,
  alert,
  applyFlowSpec,
  applyImportScreenshots,
  applyProjectCommand,
  applyScreenTemplateToPage,
  attachConnectorButtonNodes,
  autoPlaceFrame,
  badge,
  btn,
  buildScreenVariantTree,
  card,
  checkDesignTreeA11y,
  columnOrSplit,
  copy,
  countDesignNodes,
  createDefaultCommandContext,
  createEmptyProjectDocument,
  defaultNewId,
  designToNodes,
  deviceDimensions,
  devicesForPlatform,
  field,
  flowSpecFromDocument,
  getDevicePreset,
  getFlowTemplate,
  getScreenTemplate,
  h1,
  h2,
  inferScreenTemplateId,
  insertFlowTemplate,
  isEmptyFlow,
  layeredFlowLayout,
  layoutFramesInFlowRow,
  listFlowTemplates,
  listPageButtons,
  listScreenTemplates,
  listTemplateScreensForApi,
  parseProjectCommand,
  pickVariantId,
  platformForDevices,
  primaryActions,
  projectCommandSchema,
  repairDesignSpec,
  repairFlowSpec,
  resolvePageTemplateId,
  row,
  screenKeyForPage,
  section,
  slugifyScreenId,
  stack,
  swapScreenVariant,
  templateDesignStatesForBrief,
  variantsForPage
};
