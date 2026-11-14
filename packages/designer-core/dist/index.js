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
  issues;
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
  const presetId = FLOW_PLATFORM_PRESET[options.platform];
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
    updatedAt: (options.now?.() ?? /* @__PURE__ */ new Date()).toISOString()
  };
  return { document: doc, screenFrameIds };
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
  FLOW_CARD_GAP_X,
  FLOW_CARD_GAP_Y,
  FLOW_CARD_HEIGHT,
  FLOW_CARD_WIDTH,
  FLOW_LABEL_HEIGHT,
  FLOW_LIMITS,
  FLOW_ORIGIN_X,
  FLOW_ORIGIN_Y,
  FLOW_PLATFORMS,
  FLOW_PLATFORM_PRESET,
  FLOW_SPEC_SCHEMA_HINT,
  FLOW_THUMB_HEIGHT,
  FlowSpecError,
  SCREEN_STATES,
  applyFlowSpec,
  applyImportScreenshots,
  applyProjectCommand,
  autoPlaceFrame,
  createDefaultCommandContext,
  createEmptyProjectDocument,
  defaultNewId,
  deviceDimensions,
  flowSpecFromDocument,
  getDevicePreset,
  isEmptyFlow,
  layeredFlowLayout,
  layoutFramesInFlowRow,
  parseProjectCommand,
  projectCommandSchema,
  repairFlowSpec,
  screenKeyForPage,
  slugifyScreenId
};
