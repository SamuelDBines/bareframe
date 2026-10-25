# Bareframe Designer — Product & Interaction Spec (v0.1)

> Status: draft written 25 Oct 2026, from a read-only study of `SamuelDBines/designer.io` (default branch) and `SamuelDBines/bareframe` (main plus PR #1, branch `cursor/bareframe-prototype-e0f4`, `prototype/`).
> Audience: whoever builds the real Designer (a React app on top of the `@bareframe/*` React library).
> Source excerpts are in `./excerpts/`. Paths shown as `dio:` are files in designer.io; `bf:` are files in bareframe.

---

## 0. TL;DR

designer.io already gets a lot right, and the Bareframe Designer should **port its interaction model almost wholesale**:
- an infinite canvas of screens;
- a layered library (pages, partials, components);
- an inspector with Layout/Responsive sections;
- a themes workspace with a live preview;
- a zod-validated AI action contract.

Four things in designer.io are weak or missing, and they are exactly what Sam asked for. The Bareframe Designer must fix them:

| Sam's ask | designer.io today | Bareframe Designer must |
|---|---|---|
| **Mobile / device sizes** | One device per **project** (`Project.screenPresetId/screenWidth/screenHeight`). Every screen has the same size. | Make the device a property of each **Frame**. Show any mix of iPhone, iPad and desktop frames on one canvas. |
| **Designs that scale when switching** | `setScreenPreset` multiplies every x/y/w/h by `newW/oldW`, `newH/oldH`. This is destructive, causes rounding drift, and distorts aspect ratios (`dio:src/store.tsx` L1281–1319). | Make the **layout reflow** (flex/grid, with fill/hug/percent sizing) the default. Store per-breakpoint **overrides**. Never rewrite the source geometry when the device changes. |
| **Trying different styles** | A project has several themes but only one `activeThemeId`. You flip it globally and can't compare. `variantKey` is metadata only. | Give each frame a **theme override**, offer **Compare mode** (a frame × theme or frame × device matrix), and add **Style trials** (branch a frame, change tokens or variants, then promote). |
| **Frames** | A "screen" is just a `CanvasItem` with `componentType: "screen"`, parenting is by `parentId`, children are absolutely positioned, and `duplicateCanvasPage` **does not copy children**. | Make **Frame** a first-class object that contains a design tree. Duplicate deep-copies the tree or links to it. Frames can be named, labelled, moved, resized, and rendered at true viewport width. |

---

## 1. Product principles

1. **Real components.** Everything on the canvas is a real `@bareframe/react` component instance (with props and a variant), or a layout primitive that maps 1:1 to code (Stack, Row, Grid…). There are no "rect pretending to be a button" items (designer.io's `kind: "rect"` + `componentType`).
2. **One tree, many frames.** A page has a single design tree. Frames are *views* of that tree at a device size and theme. Edits propagate to every frame unless they are scoped to a breakpoint or trial.
3. **Tokens, not hex.** Fills, text, spacing and radius bind to `--bf-theme-*` tokens. Raw values are allowed, but they are flagged in the inspector (designer.io's `fillMode: "theme" | "custom"` pattern).
4. **Local-first, agent-friendly.** Projects are saved as JSON (localStorage/IndexedDB first, cloud later). Every user action is also a typed **Action** that MCP agents can call (designer.io `assistantActionSchema` lineage).
5. **Nothing destructive on resize or switch.** Switching a device or theme is a view change, never a data migration.

---

## 2. Core concepts & data model

### 2.1 Glossary

| Term | Meaning | designer.io equivalent |
|---|---|---|
| **Project** | A workspace: pages, themes, component registry, settings. | `Project` (`dio:src/types.ts` L234) |
| **Page** | A route in the product (`/`, `/settings`). It owns one **design tree** and has many frames. | `CanvasPageMeta {id,name,routePath,screenId,codeBinding?}` (L18) |
| **Frame** | A rectangle on the infinite canvas that renders a page (or component/block) at a device size, theme and breakpoint. | the `componentType: "screen"` item |
| **Frame set** | The frames for one page at different devices (for example SE / iPad / 1440). Created by "Duplicate to devices". | none |
| **Device preset** | A named width × height (plus a breakpoint tag). | `SCREEN_PRESETS` (store.tsx L59) |
| **Breakpoint** | A named min-width range (`sm`, `md`, `lg`, `xl`) that overrides are keyed by. | none (`TREE_FIRST_CANVAS_PLAN` lists the "responsive breakpoints matrix" as a non-goal) |
| **Node** | An element in the design tree: a layout primitive, a component instance, text, image, icon, or a slot. | `CanvasItem`, and later `DesignNode` (`dio:docs/TREE_FIRST_CANVAS_PLAN.md`) |
| **Theme** | A named set of `--bf-theme-*` values: one of the 16 shipped `bf:themes/*.css` themes, or a custom theme. | `ThemeTokenSet` (L27) with `--designer-*` vars |
| **Style trial** | A sandboxed variation of a frame (theme, token tweaks, variant swaps, prop changes) that can be compared and promoted. | none |
| **Component definition** | A reusable component (a library component or user-made) with variants. | `ComponentDefinition` (`dio:docs/DESIGN_TO_CODE_PLAN.md` §ComponentDefinition) |
| **Block** | A saved composed section (Hero, Login form). | `BlockDefinition` |
| **Instance** | A node that references a definition and variant, plus prop overrides. | `componentDefId` + `variantKey` (+ `syncId` sync) |
| **Connector** | A flow arrow between two frames or nodes (a prototype flow). | `componentType: "connector"` + `connectorFromId/ToId/Label/Style` |

### 2.2 Types (proposed, TypeScript)

```ts
// ---------- Project ----------
type Project = {
  id: string; name: string; slug: string;
  schemaVersion: 1;
  pages: Page[];
  frames: Frame[];                 // all frames on the canvas (pages, components, blocks)
  themes: ThemeRef[];              // built-in bf themes + custom
  defaultThemeId: string;          // was designer.io activeThemeId
  devicePresets: DevicePreset[];   // seeded from DEFAULT_DEVICE_PRESETS, user-extensible
  breakpoints: Breakpoint[];       // seeded sm/md/lg/xl
  componentDefinitions: ComponentDefinition[];
  blockDefinitions: BlockDefinition[];
  trials: StyleTrial[];
  connectors: Connector[];
  grid: GridSettings;              // designer.io default {show:true, columns:4, gutter:16, margin:16}
  canvas: { viewport: { x: number; y: number; zoom: number } }; // persisted camera
  createdAt: string; updatedAt: string; revision: number;
};

// ---------- Devices & breakpoints ----------
type DevicePreset = {
  id: string; label: string; width: number; height: number;
  category: "phone" | "tablet" | "desktop" | "custom";
  breakpointId: string;            // which override bucket it reads
  dpr?: number; safeArea?: { top: number; bottom: number }; // for notch/home-indicator overlays
};
type Breakpoint = { id: "base" | "sm" | "md" | "lg" | "xl" | string; label: string; minWidth: number };
// default breakpoints: base 0, sm 480, md 768, lg 1024, xl 1440 (mobile-first cascade)

// ---------- Pages & design tree ----------
type Page = { id: string; name: string; routePath: string; rootNodeId: string; nodes: Record<string, DesignNode>; codeBinding?: CodeBinding };

type DesignNode = {
  id: string; name: string;
  type: "frame-root" | "stack" | "row" | "column" | "grid" | "section" | "container"
      | "spacer" | "divider" | "text" | "image" | "icon" | "instance" | "slot";
  parentId: string | null; children: string[];        // order = array order
  instance?: { definitionId: string; variantKey: string; props: Record<string, unknown> };
  content?: { text?: string; textTag?: "h1"|"h2"|"h3"|"h4"|"h5"|"h6"|"p"|"small"; imageId?: string; icon?: string };
  layout: LayoutModel;              // base values
  style: StyleModel;                // token-bound
  overrides?: Partial<Record<string /*breakpointId*/, NodeOverride>>;
  visibility?: Partial<Record<string /*breakpointId*/, boolean>>; // hide on mobile, etc.
  locked?: boolean; hidden?: boolean;
  manualPosition?: { x: number; y: number };          // only when parent layout.mode === "free"
  syncId?: string;                  // designer.io "Keep synced" semantics, retained
};

type LayoutModel = {                 // = designer.io TREE_FIRST LayoutModel, unchanged names
  mode: "free" | "stack" | "row" | "column" | "grid";
  gap: number; padding: [number, number, number, number]; margin?: [number, number, number, number];
  align: "start" | "center" | "end" | "stretch";
  justify: "start" | "center" | "end" | "space-between";
  widthMode: "fixed" | "fill" | "hug" | "percent"; heightMode: "fixed" | "fill" | "hug" | "percent";
  width?: number; height?: number; minWidth?: number; maxWidth?: number; minHeight?: number; maxHeight?: number;
  gridColumns?: number; gridRowGap?: number; gridColumnGap?: number;
  overflow?: "visible" | "hidden" | "scroll"; wrap?: boolean;
};
type StyleModel = {
  fill?: TokenOr<string>; textColor?: TokenOr<string>; radius?: TokenOr<number>;
  shadow?: TokenOr<string>; border?: TokenOr<string>; fontSize?: TokenOr<number>; fontWeight?: 400|500|600|700;
  inline?: { mode: "pairs" | "css"; pairs: [string, string][]; css: string }; // designer.io styleMode/stylePairs/inlineCss
};
type TokenOr<T> = { token: string } | { value: T };   // token = "--bf-theme-surface-1"
type NodeOverride = { layout?: Partial<LayoutModel>; style?: Partial<StyleModel>; props?: Record<string, unknown>; content?: Partial<DesignNode["content"]> };

// ---------- Frames ----------
type Frame = {
  id: string; name: string;                         // label shown above the frame: "Home — iPhone 15 · 393×852"
  target: { kind: "page"; pageId: string } | { kind: "component"; definitionId: string; variantKey?: string } | { kind: "block"; blockId: string };
  x: number; y: number;                             // canvas coordinates (world space)
  width: number; height: number;                    // viewport size of the frame
  devicePresetId: string | "custom";
  breakpointId?: string;                            // default: derived from width via breakpoints
  heightMode: "fixed" | "hug";                      // hug = grows with content (long scroll pages)
  themeId?: string;                                 // undefined = project.defaultThemeId
  trialId?: string;                                 // renders the page through a StyleTrial
  frameSetId?: string;                              // siblings created by "Duplicate to devices"
  showDeviceChrome?: boolean; showGrid?: boolean; clipContent: boolean;
  locked?: boolean;
};

// ---------- Styles & trials ----------
type ThemeRef = { id: string; label: string; source: "builtin" | "custom"; cssHref?: string; tokens?: Record<string, string>; basedOn?: string };
type StyleTrial = {
  id: string; name: string; pageId: string; baseThemeId: string;
  tokenOverrides: Record<string, string>;                              // "--bf-theme-button-primary-bg": "#0ea5e9"
  variantSwaps: { nodeId: string; variantKey: string }[];
  propOverrides: { nodeId: string; props: Record<string, unknown> }[];
  status: "draft" | "promoted" | "discarded"; createdAt: string; note?: string;
};

type ComponentDefinition = { id: string; name: string; source: "library" | "custom"; importPath?: string; // "@bareframe/react/button"
  props: PropSchema[]; variants: { key: string; label: string; props: Record<string, unknown>; tokens?: string[] }[];
  designTree?: Page["nodes"]; codeBinding?: CodeBinding };
```

**Rules:**
- A frame's effective breakpoint is the largest `Breakpoint` whose `minWidth <= frame.width` (CSS-like, mobile-first).
- Overrides cascade `base → sm → md → lg → xl`.
- When a frame is selected, edits write to the **frame's breakpoint bucket** if "Edit scope: This breakpoint" is on, and to **base** if not (see §5.6).
- Theme resolution order: `trial.tokenOverrides` → `frame.themeId` → `project.defaultThemeId`.

### 2.3 Default device presets

These merge designer.io's two lists (`dio:src/store.tsx` L59–67 and `dio:src/domain/preview/preview-event.ts`). Excerpts: `excerpts/screen-presets-and-rescale.ts`, `excerpts/preview-device-presets.ts`.

| id | label | w × h | category | breakpoint |
|---|---|---|---|---|
| iphone-se | iPhone SE | 375 × 667 | phone | base |
| iphone-15 | iPhone 15 *(default, = designer.io `DEFAULT_PRESET`)* | 393 × 852 | phone | base |
| mobile | Mobile (generic) | 390 × 844 | phone | base |
| pixel-8 | Pixel 8 | 412 × 915 | phone | base |
| ipad-mini | iPad Mini | 768 × 1024 | tablet | md |
| tablet | Tablet (generic) | 768 × 1024 | tablet | md |
| ipad-pro | iPad Pro 11 | 834 × 1194 | tablet | md |
| desktop | Desktop (generic) | 1280 × 800 | desktop | lg |
| desktop-1440 | Desktop 1440 | 1440 × 900 | desktop | xl |
| desktop-1920 | Desktop 1920 | 1920 × 1080 | desktop | xl |
| custom | Custom… | any | custom | derived |

- Keep designer.io's label format "iPhone 15 393x852" in dropdowns.
- Add **landscape** toggling (swap w/h) as a per-frame button.
- The preview tool's `responsive` (0×0 = fill the available width) becomes a **Responsive frame**: width is draggable and the breakpoint updates live.

**Default frame set for "Duplicate to devices":** `iphone-15`, `ipad-mini`, `desktop-1440`.

---

## 3. Layout & responsive scaling

### 3.1 What designer.io does (keep as a fallback only)

From `dio:src/store.tsx` `setScreenPreset`:
- `sx = preset.width / project.screenWidth`, `sy = preset.height / project.screenHeight`.
- Screens are always scaled. Partials and components are scaled only if `shouldResize !== false`.
- x, y, w and h are multiplied and rounded, with a minimum size of 24.
- Afterwards the camera runs `fitZoomForWidth`.
- Inspector › Responsive has one checkbox: **"Should resize on preset change"**.

Problems:
- it is lossy: SE → 1920 → SE does not round-trip;
- it distorts layouts (a button 44 px tall on SE becomes about 72 px on 1080p);
- it is global, so there is only one device at a time.

### 3.2 Bareframe behaviour

1. **Flow layout is the default.** New pages start as a `frame-root` with `mode: "stack"`, gap 16, padding 16. This matches designer.io's "screens act as vertical stacks with 16px padding/gap" (`dio:docs/WORKSPACE_UX_PLAN.md`) and its `layoutDefaultsForKind` base `layoutGap: 16` (`dio:src/features/canvas/layout-primitive-defaults.ts`).
2. **Sizing modes:**
   - `fill` stretches to the parent;
   - `hug` shrinks to the content;
   - `percent` is a share of the parent;
   - `fixed` is a set px value.
   Min and max clamp all of them. When the frame width changes, the layout engine recomputes; nothing is rewritten.
3. **Per-breakpoint overrides.** Any layout, style, prop or content field can be overridden for a breakpoint, for example:
   - Row → Column on `base`;
   - grid columns 4 → 2 → 1;
   - hiding a sidebar on `base`;
   - a smaller heading.
   Overridden fields show a coloured dot in the inspector, with "Reset to base".
4. **Free nodes** (inside `mode: "free"`) keep absolute x/y and can choose a **constraint**: left/right/centre/scale × top/bottom/centre/scale. `scale` reproduces designer.io's proportional behaviour, but only for that node and without rewriting the stored base geometry. This is the replacement for `shouldResize`.
5. **Rendering fidelity.** Each frame renders its subtree in an isolated viewport, so:
   - CSS media queries, `100vw`/`vh` and `prefers-color-scheme` behave as on a real device of that width;
   - multiple themes can coexist.

   **Recommended:** a same-origin `<iframe>` per frame, rendered through a React portal (as Storybook/Framer do), with the frame's theme CSS injected and `data-bf-theme="<id>"` on its `<html>`. For cheaper thumbnails at low zoom, fall back to a scaled `div` with `container-type: inline-size`. The `@bareframe/react` components should prefer **container queries** so both modes agree.

   *Note:* the bareframe theme files are already scoped as `[data-bf-theme='<id>'] { … }` (`system.css` is also `:root`), so per-frame scoping works as long as every theme stylesheet a frame uses is loaded into it.
6. **Long pages:** `frame.heightMode = "hug"` grows the frame to the content height. `fixed` clips to the device height and shows a dashed **fold line**.

### 3.3 Acceptance criteria

- Switching a frame from iPhone 15 to desktop-1440 and back leaves the node data byte-identical, as long as there were no edits in between.
- Three frames of one page at three devices update in the same frame (<16 ms for ≤300 nodes) when a base property changes.
- A breakpoint override edited on the iPad frame appears on every frame whose width is in `md` and on no others.

---

## 4. Infinite canvas

### 4.1 Camera

| Setting | designer.io value (`dio:src/views/canvas.tsx`) | Bareframe |
|---|---|---|
| Zoom range | 0.25 – 2.5 | **0.1 – 4.0** |
| Zoom step (buttons) | 0.1 | keep 0.1 below 100%, 0.25 above |
| Reset | 100% | keep (`Shift+0` / `Cmd+0`) |
| Fit | `clamp(0.25, 1, (innerWidth − 596) / (screenWidth + 140))`, auto on preset change | **Fit all** (`Shift+1`), **Fit selection** (`Shift+2`), **Fit frame** (double-click frame label). Padding 70 px per side (= the 140 in designer.io's formula). |
| Controls | top right: `-`, `NN%`, `+`, `Fit` | same, plus a zoom-percentage dropdown (25/50/100/200, Fit all, Fit selection) |
| Implementation | `transform: scale(zoom)` inside a scrolling div | **true infinite plane**: a world transform `translate(x,y) scale(z)` on one layer. The camera is `{x,y,zoom}` and is persisted in `project.canvas.viewport`. No scrollbars, and no world bounds unless "Clip to content" is on. |
| Zoom input | buttons only | `Ctrl/Cmd + wheel` and trackpad pinch zoom **around the cursor**; plain wheel/trackpad pans |

### 4.2 Navigation & selection (keep designer.io's exact behaviour, `dio:src/editor/canvas.tsx`)

| Input | Action |
|---|---|
| Hold `Space` + drag, middle-mouse drag, or "grab" mode (`H`) | Pan |
| Arrow keys (nothing selected) | Pan by 120 × `navSpeed` (smooth) |
| Arrow keys (selection) | **New:** nudge 1 px; `Shift` nudges 8 px (the snap grid) |
| Drag on empty canvas | Marquee select |
| Click | Select. A click on a grouped item selects the group. |
| `Cmd/Ctrl` + click | Toggle in the selection; selects a single member of a group |
| Double-click | Enter the group or frame and select the child under the cursor (**new**: designer.io uses Shift-drag for members) |
| `Shift` + drag group member | Move only that member (keep) |
| `Alt` + drag | Duplicate while dragging (keep) |
| Drag near viewport edge | Auto-pan (keep) |
| `Backspace` / `Delete` | Delete the selection. Keep the confirmation only for frames and pages; for nodes, use undo instead. |
| `Cmd/Ctrl` + `C` / `V` | Copy / paste. A "Keep synced on paste" toggle (keep) creates a shared `syncId`. |
| `Cmd/Ctrl` + `D` | **New:** duplicate in place, offset +48/+48 (designer.io's duplicate offset) |
| `Cmd/Ctrl` + `G` / `Shift+Cmd+G` | Group / ungroup (designer.io toggles with one key; split it) |
| `Cmd/Ctrl` + `Z`; `Shift+Cmd+Z` / `Cmd+Y` | Undo / redo. History of 100 snapshots, with gesture begin/commit (keep). |
| `F` | **New:** tool — draw a frame (shows the device picker on mouse-up) |
| `R` `T` `S` | **New:** insert Row / Text / Stack at the cursor |
| `Cmd/Ctrl` + `K` | Command palette (designer.io top bar has ⌘K) |
| `Shift+1` / `Shift+2` / `Shift+0` | Fit all / fit selection / 100% |
| `[` / `]` | Previous / next frame in the frame set |
| `Cmd/Ctrl` + `\` | Toggle inspector |

Keyboard shortcuts are ignored while focus is in an input, textarea or contenteditable element (keep).

### 4.3 Snapping & guides (keep values from `dio:src/editor/canvas/snap.ts`, `move-guides.ts`)

- `DEFAULT_SNAP_GRID = 8`, `SNAP_THRESHOLD = 6`, `ALIGN_THRESHOLD = 6` (screen px, so divide by zoom in world space), minimum node size 32 (editor) / 24 (rescale).
- Precedence: parent/layout bounds → alignment to sibling edges and centres → grid. `Alt` held disables snapping.
- Red distance guides with px labels, relative to the parent.
- A parent auto-grows when a child would clip past its bottom padding (designer.io heuristic). In flow layout this becomes `hug`.
- Group resize scales members proportionally (keep, free layout only).
- **Frames snap to each other** at 56 px horizontally and 80 px vertically. These are designer.io's auto-placement gaps (`x = 40 + (n%3)*(w+56)`, `y = 40 + floor(n/3)*(h+80)`), so frame sets line up neatly.
- Layout grid overlay per frame: **columns / gutter / margin**, default 4 / 16 / 16. Bareframe makes it **per breakpoint**: base 4/16/16, md 8/24/24, lg 12/24/32.

### 4.4 Frame chrome on canvas

- **Label above the frame:** `Name · Device · W×H · Theme`, e.g. `Home · iPhone 15 · 393×852 · aurora`.
  - Click selects the frame. Drag moves it. Double-click renames it.
  - The label stays legible at any zoom (inverse-scaled).
- **Hover toolbar on the selected frame:**
  - device dropdown;
  - rotate;
  - theme dropdown;
  - "+ device" (duplicate to another device);
  - "Compare themes";
  - Preview ▶;
  - ⋯ menu: Duplicate, Duplicate to devices…, Create trial, Lock, Delete.
- **Resize handles:**
  - the right and bottom edges change the frame **viewport** width/height. The device becomes `custom`, and the breakpoint badge updates live while dragging;
  - the **content** is never scaled.
- **Badges:**
  - breakpoint (e.g. `md`);
  - "Trial: Ocean CTA" chip;
  - an orange dot if the frame shows overrides.
- Optional device chrome (status bar and home indicator safe areas for phones).

### 4.5 Minimap & canvas views

- **Minimap** (bottom-left, toggle `M`): every frame as a rectangle, with a viewport box you can drag. Click jumps there.
- **View filter**, from designer.io's toolbar "View": `All designs` / `Current page` / `Ungrouped`. Bareframe adds `Frame set` (only frames of the selected page) and `Trials`.
- **Layers filter:** designer.io's three layers (`screens`, `partials`, `components`) become **frame target kinds** (page / block / component). A segmented control filters them. "All" is the default.

---

## 5. Workspace layout & panels

### 5.1 Shell (from `dio:docs/WORKSPACE_UX_PLAN.md`)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Top bar 48px: ◼ Bareframe · Project ▾ · + · ⌘K search · Share · Preview ▶ · ? │
├──┬───────────────┬───────────────────────────────────────────┬───────────────┤
│R │ Left sidebar  │  Sub-tab bar: Canvas | Assets   Device ▾  │  Inspector    │
│a │ 260px         │  Theme ▾  Compare ▾  Edit scope ▾  ⟷ Insp │  300px        │
│i │ (resizable,   ├───────────────────────────────────────────┤  (resizable,  │
│l │  collapsible) │                                           │   ⌘\ toggle)  │
│  │               │        Infinite canvas (frames)           │               │
│48│               │                                 [-]100%[+]│               │
│px│               │ [minimap]                          [Fit]  │               │
│  │               │                                   (✦ AI)  │               │
└──┴───────────────┴───────────────────────────────────────────┴───────────────┘
```

**Activity rail:** Canvas, Themes, Components, Preview, Code, Agents (MCP), Settings. designer.io has Canvas, Themes, Code, Preview, Search, Git, Settings. For Bareframe:
- Search moves to ⌘K;
- Git becomes Code › Export;
- Components (the registry and variants editor, which is a TODO in designer.io's `DESIGN_TO_CODE_PLAN` "Future Components workspace") and Agents are added.

**Assistant:** a floating action button (bottom right) that opens a drawer, as in designer.io. It is not a permanent fourth column (see §9 critique).

### 5.2 Left sidebar (Canvas)

These are accordions; keep designer.io's order and names (`dio:src/views/canvas/library-sidebar.tsx`, `src/features/canvas/PageStructurePanel.tsx`).

1. **Pages.** A list of name + route.
   - The ⋯ menu offers Page settings, Duplicate, Duplicate to devices…, Delete.
   - At least one page must exist (designer.io `deleteCanvasPage` guard).
   - "+ Page" opens the **Create page** modal (`dio:src/features/canvas/PageCreateModal.tsx`): Name and Route (Home normalises to `/`).
   - **New:** a device checklist with default `iPhone 15` ✔, `iPad Mini` ☐, `Desktop 1440` ☐, and a starter template (Blank, Header + content, Dashboard, Auth).
2. **Frames** *(new)*: the frames of the selected page, grouped by frame set, each showing its device/theme badges. Click zooms to the frame.
3. **Layers / Page structure:**
   - Tree view with type badges (designer.io: `ROW`, `COL`, `BTN`, `TEXT`, …), drag to reorder/reparent, eye (hide) and lock icons.
   - Context menu: Rename, Detach, Bring to front / Send to back (free layout only), Delete, plus **Hide on this breakpoint** *(new)*.
   - The "Unlinked" bucket (designer.io) lists free items not inside a frame.
4. **Components:**
   - Layout: Section, Container, Row, Column, Grid, Stack, Spacer, Divider (designer.io set and defaults, see `excerpts/layout-primitive-defaults.ts`).
   - **Bareframe library:** generated from the `@bareframe/react` registry and grouped by category (Actions, Forms, Date & time [Calendar, DatePicker…], Feedback, Navigation, Overlay, Data display). Each entry has a search field, a thumbnail rendered with the active theme, and drag-to-insert or click-to-insert. Insertion target order (keep, from `dio:docs/WORKSPACE_UX_PLAN.md`): drop parent → selected layout parent → selected page/frame → viewport centre.
   - Custom components (user-made).
5. **Blocks:** Saved blocks and Templates (designer.io).
6. **Icons, Emoji** (designer.io ships 50 emoji), **Assets** (images in IndexedDB, as in designer.io).
7. **Grid:** Show grid, Columns, Gutter, Margin. **New:** per-breakpoint tabs.

### 5.3 Sub-tab bar (above the canvas)

designer.io shows `Device:` ▾ and `Active theme:` ▾ next to the Inspector toggle (`dio:src/views/canvas/canvas-toolbar.tsx`). In Bareframe:

- **Device ▾**:
  - acts on the *selected frame(s)*;
  - with nothing selected, it sets the default device for new frames;
  - the menu ends with "Duplicate selection to…" and "Manage presets…".
- **Theme ▾**:
  - applies to the selected frame(s) (sets `frame.themeId`);
  - with nothing selected, it sets `project.defaultThemeId`;
  - frames with an explicit override show a dot.
- **Compare ▾**: "Devices for this page", "Themes for this frame…", "Trials for this page", "Exit compare" (see §6.4).
- **Edit scope ▾**: `All breakpoints (base)` / `This breakpoint only (md)`. This is also shown as a coloured strip on the inspector header.
- **Actions** (designer.io toolbar):
  - Group selected (needs ≥2), Ungroup;
  - Connect selected (exactly 2);
  - Create component, Create block. These open the grouping modal: name plus intent `Group only` / `Block/Section` / `Component`.

### 5.4 Inspector (right)

Keep designer.io's accordion order (`dio:src/views/canvas/inspector-panel.tsx`) and add Bareframe sections.

| Section | Fields |
|---|---|
| **Selection** | Name, type badge, Group Name, Page Group, breadcrumb (Frame › Section › Row › Button), **Metrics view** `all`/`px`/`rem`/`em` + **Copy metrics** (keep) |
| **Frame** *(new, frame selected)* | Device ▾, W, H, rotate, Height mode (fixed/hug), Theme ▾, Trial ▾, Show device chrome, Clip content, Grid override, Frame set (list of siblings + "Add device") |
| **Component** *(new, instance selected)* | Definition (link to the Components workspace), **Variant** ▾ (e.g. primary/secondary/ghost), auto-generated prop controls from the component's prop schema (enum → select, boolean → switch, string → input, date → date picker), "Reset overrides", "Detach instance" |
| **Content** | Text, Tag (`h1–h6, p, small`), Weight (`400–700`), Icon, Icon Side, Image: Fit / Scale / Position X/Y, Connector Label, Connector Style |
| **Style** | Fill (token picker ↔ custom colour, as designer.io `fillMode`), Text colour, Radius, Shadow (sm/md/…), Border; each field shows the bound token name, e.g. `surface-1` |
| **Layout** | Layout mode `free/stack/row/column/grid`, Direction, Gap, Padding T/R/B/L (linked toggle), Margin T/R/B/L, Align, Justify, Width mode `fixed/fill/hug/percent` + value, Height mode, Min/Max W/H, Grid columns/row gap/column gap, Overflow, Wrap, Parent ▾ |
| **Responsive** | Replaces "Should resize on preset change": a breakpoint strip `base sm md lg xl` showing which have overrides; the current edit scope; "Hide on: [base] [sm] [md] [lg] [xl]"; for free nodes, constraint H/V (left/right/center/scale); "Reset to base" per field or all |
| **Code** | Definition id, Variant key, export name/path (`CodeBinding`), live TSX snippet for the selection (`<Button variant="primary">Save</Button>`), Copy |
| **Clipboard** | Keep synced (`syncId`), Keep synced on paste, "Select all synced" |
| **Inline styles** | key/value pairs or a CSS textarea (designer.io `styleMode: pairs|css`). Flagged as "escape hatch". |

**Override indicators:**
- a field set on the current breakpoint shows a filled dot;
- a field inherited from a smaller breakpoint shows a hollow dot;
- `Alt`-click on the dot resets the field.

### 5.5 Themes workspace

Port of `dio:src/features/themes/*`.

- **Sidebar:**
  - theme list: the 16 built-in Bareframe themes (light, dark, system, aurora, desert, future, matrix, modern, nature, nebula, noir, oceanic, retro, simple, sprint, sunrise) plus custom themes, with an "Active/default" marker;
  - ⋯ menu: Set as default, Rename, **Duplicate** (the way to start a custom theme from a built-in one), Delete, Copy CSS path;
  - "+ New theme" (based on ▾).
- **Sub-tabs:**
  - **Theme & Tokens**: grouped editors for Colours / Typography / Spacing / Radius / Shadow / Component tokens, mapped to `--bf-theme-*`. The `validate-theme` REQUIRED set (`surface-1/2`, `text-1/2`, `border-1`, `font-family`, `button-primary-bg/color`, `button-secondary-bg/color`) is shown first, with a ✔/✖ completeness meter.
  - **Code**: read-only Monaco view of the generated CSS, plus the selector strategy `:root` vs `[data-bf-theme="…"]` and "safe to overwrite" (designer.io `cssSelectorStrategy`).
- **Live preview panel** (right, 360–420 px, Hide/Show):
  - keep designer.io's specimen: hero/card, Typography, Buttons (primary / secondary / ghost), badge, Forms (input, alert), Surfaces;
  - Bareframe adds a **"Preview on: [current page ▾] [device ▾]"** mode that renders a real page frame with the theme being edited.
- **Import/Export JSON** (keep).
- **Tokens mapping table:** designer.io's default tokens map onto Bareframe tokens as follows:

  | designer.io | Bareframe |
  |---|---|
  | `primary` | `--bf-theme-button-primary-bg` |
  | `surface` | `--bf-theme-surface-1` |
  | `canvas` | `--bf-theme-surface-2` |
  | `text` | `--bf-theme-text-1` |
  | `muted` | `--bf-theme-text-2` |
  | `border` | `--bf-theme-border-1` |
  | `success` / `warning` / `danger` | status tokens (add if missing) |
  | `radius` 8/12/20 | `--bf-theme-radius-sm/md/lg` |
  | `fontFamily` | `--bf-theme-font-family` |

### 5.6 Preview workspace

From `dio:src/features/preview/PreviewToolbar.tsx`:
- URL bar, Back/Forward/Refresh;
- device select `Responsive / Desktop 1280×800 / Tablet 768×1024 / Mobile 390×844`;
- Inspect toggle;
- DevTools tabs `console / network / elements / terminal`.

Bareframe:
- **Preview ▶** on a frame opens that page at that device and theme as a clickable prototype. Connectors act as navigation.
- The "Responsive" device has a draggable width and shows the live breakpoint.
- The share link is read-only.

### 5.7 Components workspace *(new; designer.io TODO)*

- Pick a definition to see a **variant grid**: rows are variants and columns are states (default / hover / focus / disabled), each rendered in the chosen theme.
- Toggle "Themes as columns" to check one variant across all 16 themes. This is a Bareframe twist on the bf Component Studio "compare themes" tab (`bf:showcase/src/main.ts`).
- Users can create a custom component from a canvas selection (designer.io "Create component"). The default variant is named **Default** (designer.io).

---

## 6. Key flows (step by step)

### 6.1 Create a frame at a device size

1. Do one of the following:
   - press `F`, or choose "Frame" in the toolbar, then drag on the canvas;
   - or click "+ Page" and choose devices in the Create page modal.
2. On mouse-up, a popover shows the device grid (Phone / Tablet / Desktop / Custom) with the defaults from §2.3. Choosing one snaps the frame to that w×h. A plain click with no drag places an `iPhone 15` frame at the cursor.
3. The frame gets:
   - a new page, if none is selected: name `Page N`, route `/page-n`, root `stack` with gap 16 and padding 16;
   - `themeId` undefined, which inherits the project default;
   - a label like `Page 2 · iPhone 15 · 393×852`.
4. Auto-placement when created from the sidebar uses designer.io's grid: `x = 40 + (n % 3)·(w + 56)`, `y = 40 + ⌊n / 3⌋·(h + 80)`. Bareframe improves this by placing the frame to the right of the last frame in the same frame set and finding free space.
5. The camera animates to fit the new frame (designer.io auto-fits on preset change).

**Acceptance:** the frame exists in `project.frames`, the page exists in `project.pages`, undo removes both in one step, and an MCP `create_frame` produces identical JSON.

### 6.2 Duplicate a frame across iPhone, tablet and desktop

1. Select a frame, then choose ⋯ › **Duplicate to devices…** (or the frame toolbar "+ device").
2. A modal lists device checkboxes (defaults iPhone 15 ✔, iPad Mini ✔, Desktop 1440 ✔; the current device is greyed out) and **Mode**:
   - **Linked (same page), default.** New frames are new *views* of the same page tree. Edits sync, and per-breakpoint overrides diverge.
   - **Copy (new page).** Deep-copies the tree into a new page `<name> Copy`, route `<route>-copy` (designer.io naming). This fixes designer.io's bug where `duplicateCanvasPage` copies only the screen and not its children.
3. Frames are laid out in a row, left to right by width, 56 px apart, top-aligned, and share one `frameSetId`.
4. Each frame immediately reflows to its width (§3.2).
5. Mismatches are highlighted. For example, if content overflows horizontally on a phone frame, a red overflow badge appears with "Fix: switch Row → Column on base?". The same check can be exposed as an MCP lint.

**Acceptance:**
- editing text on the desktop frame changes all three;
- switching a Row to a Column with scope `This breakpoint (base)` on the iPhone frame changes only the iPhone frame;
- deleting one frame of the set leaves the page and other frames intact.

### 6.3 Switch theme or style

- **Whole project:** Theme ▾ with nothing selected, or Themes › Set as default. Every frame without an override restyles instantly. No data changes except `defaultThemeId`.
- **One frame:** select the frame, then Theme ▾. Only that frame changes and shows the "aurora" badge. "Reset to project theme" clears it.
- **Variant swap:** select an instance, then Inspector › Component › Variant ▾. With edit scope *This breakpoint*, the swap is stored as an override (for example a `ghost` button on mobile).

### 6.4 Compare side by side (Compare mode)

Entry points: **Compare ▾** in the sub-tab bar, or the frame toolbar.

| Compare | Result |
|---|---|
| **Devices for this page** | Shows the page's frame set in a row. Creates the missing default devices *temporarily* (dashed outline) without saving them unless you click "Keep". |
| **Themes for this frame…** | Pick 2–6 themes (checkboxes with swatches). The canvas places **ghost frames** (same page, same device, different `themeId`) in a row to the right, each labelled with the theme name. They are read-only previews; selecting a node in one highlights it in all of them. |
| **Device × Theme matrix** | Rows are themes and columns are devices (up to 4×4), for one page. Good for checking a design system across brands. |
| **Trials for this page** | The base frame plus each `StyleTrial` side by side. |

Compare-mode controls (floating bar):
- Sync scroll ✔;
- Sync selection ✔;
- "Make real frames" (persist the ghosts);
- **"Use this theme"** on a column (sets the frame or project theme);
- Exit (`Esc`).

### 6.5 Style trials (trying different styles)

1. Select a frame and choose ⋯ › **Create trial** (or Compare › Trials › "+ Trial"). Name it (default `Trial 1`).
2. A trial frame appears beside the base with a "Trial: …" chip. While the trial frame is focused, **every style, token, variant or prop edit is captured in the trial** (`tokenOverrides`, `variantSwaps`, `propOverrides`), not the page. Structural edits (add/move nodes) are disabled in trials, with the hint "Duplicate as copy to change structure".
3. A token tweak panel in the inspector "Trial" section lets you pick a token, choose a new value, and see the frame update live.
4. Outcomes:
   - **Promote** › "Apply to page" writes the variant/prop swaps into the base tree;
   - **Promote** › "Save as new theme" creates a custom theme `<base> + <trial>` from the token overrides;
   - **Discard**.
   Promotion is one undo step.
5. Trials are listed in the sidebar under the page (status draft/promoted/discarded), so history is preserved.

### 6.6 Responsive scaling check

1. Select any frame and drag its right edge. Width updates live, the breakpoint badge changes at 480/768/1024/1440, and overrides switch accordingly.
2. Alternatively, Preview ▶ with the `Responsive` device drags the viewport width in a real page.
3. **Keyboard:** with a frame selected, `Alt + ←/→` steps the width through the presets.

---

## 7. AI / MCP action contract

Keep designer.io's approach: zod schemas, proposals with `{id, action, args, summary, risk: low|medium|high, requiresConfirmation}` (`dio:src/domain/ai/canvas-action-schema.ts`), and everything validated before it is applied. Keep and extend designer.io's verbs (`dio:packages/shared/src/assistant-action.ts`: `create_object`, `update_object`, `delete_objects`, `move_objects`, `resize_object`, `group_objects`, `ungroup_objects`, `set_theme`, `update_theme_tokens`, `create_screen`, …; tree-first: `create_page`, `add_node`, `set_layout`, `set_content`, `set_parent`, `reorder`, `create_component`, `create_block`).

**Bareframe MCP tools** (also used internally by the UI so humans and agents share one path):

| Tool | Args |
|---|---|
| `list_devices` / `list_themes` / `list_components` | – (components include prop schema + variants) |
| `create_page` | `{name, route, devices?: string[], template?}` |
| `create_frame` | `{pageId, devicePresetId \| {width,height}, x?, y?, themeId?}` |
| `duplicate_frame_to_devices` | `{frameId, devicePresetIds[], mode: "linked"\|"copy"}` |
| `set_frame_device` | `{frameId, devicePresetId \| {width,height}, landscape?}` |
| `set_frame_theme` | `{frameId, themeId \| null}` |
| `add_node` | `{pageId, parentId?, index?, type, instance?: {definitionId, variantKey, props}, content?, layout?, style?}` |
| `update_node` | `{nodeId, patch, breakpointId?}` (breakpoint ⇒ override) |
| `set_layout` | `{nodeId, layout: Partial<LayoutModel>, breakpointId?}` |
| `set_parent` / `reorder` / `delete_nodes` | as designer.io |
| `set_visibility` | `{nodeId, breakpointId, visible}` |
| `create_style_trial` | `{pageId, baseThemeId, tokenOverrides?, variantSwaps?, propOverrides?, name?}` |
| `promote_trial` | `{trialId, to: "page" \| "new-theme", themeName?}` |
| `compare` | `{pageId, themes?: string[], devices?: string[]}` → returns PNG snapshots + lint |
| `render_frame` | `{frameId, format: "png" \| "html" \| "tsx"}` (designer.io `ExportRecord` formats json/png/html + tsx) |
| `lint_frame_set` | `{pageId}` → overflow, clipped text, tap-target < 44 px on phones, raw (non-token) colours |
| `update_theme_tokens` / `create_theme` | as designer.io, mapped to `--bf-theme-*` |
| `export_code` | `{pageId \| definitionId}` → TSX importing `@bareframe/react` |

Risk defaults:
- `delete_*` and `promote_trial` are `high` and need confirmation;
- `create_*` is `low`.

---

## 8. Keep vs improve (with designer.io paths)

| Area | designer.io file(s) | Verdict |
|---|---|---|
| Device presets list & labels | `src/store.tsx` L59–69, `src/domain/preview/preview-event.ts` | **Keep** values; **improve**: per-frame, plus breakpoint tag and landscape |
| Rescale on preset change | `src/store.tsx` `setScreenPreset` L1281–1319 | **Replace** with reflow + overrides; keep proportional `scale` only as a per-node constraint |
| Project-level `screenWidth/Height` | `src/types.ts` `Project` | **Remove**: it moves to `Frame` |
| Canvas item model (`kind:"rect"` + `componentType`) | `src/types.ts` `CanvasItem` L81 | **Improve**: tree-first `DesignNode` with real component instances (already planned in `docs/TREE_FIRST_CANVAS_PLAN.md`) |
| LayoutModel names (`free/stack/row/column/grid`, `fixed/fill/hug/percent`, align/justify) | `docs/TREE_FIRST_CANVAS_PLAN.md` | **Keep exactly** |
| Layout primitive defaults (gap 16, Section 85% width, padding 16) | `src/features/canvas/layout-primitive-defaults.ts` | **Keep** |
| Snap/guides constants & precedence | `src/editor/canvas/snap.ts`, `move-guides.ts` | **Keep** |
| Shortcuts (Space pan, Alt-dup, marquee, undo 100) | `src/editor/canvas.tsx` | **Keep**, add zoom/fit/nudge/frame tool |
| Zoom (0.25–2.5, scale-in-scroll) | `src/views/canvas.tsx`, `src/views/canvas/constants.ts` | **Improve**: camera transform, cursor zoom, fit-all/selection, minimap |
| Auto-placement 3-per-row, gaps 56/80 | `src/store.tsx` (screen creation) | **Keep** gaps as frame snap spacing; place frame sets in rows |
| Page duplicate (screen only, no children) | `src/store.tsx` `duplicateCanvasPage` | **Fix**: deep copy or linked frame |
| Sync (`syncId`, Keep synced on paste) | `src/store.tsx` `updateCanvasItem`/`pasteCanvasItems`, inspector Clipboard | **Keep**; instances supersede most uses |
| Inspector sections & labels | `src/views/canvas/inspector-panel.tsx` | **Keep** order; add Frame, Component, revamped Responsive |
| Library sidebar sections | `src/views/canvas/library-sidebar.tsx`, `src/features/canvas/PageStructurePanel.tsx` | **Keep**; swap UI primitives for the `@bareframe/react` registry; add Frames |
| Create page modal (name + route, Home → `/`) | `src/features/canvas/PageCreateModal.tsx`, `src/domain/canvas/page-meta.ts` | **Keep** and add devices + template |
| Canvas toolbar (View filter, Actions, Device, Active theme) | `src/views/canvas/canvas-toolbar.tsx`, `src/features/canvas/CanvasPreviewControls.tsx` | **Keep**; add Compare + Edit scope |
| Themes workspace (sidebar, Theme & Tokens, Code, Live preview) | `src/features/themes/ThemesSidebar.tsx`, `ThemeTokensEditor.tsx`, `ThemeLivePreview.tsx` | **Keep**; tokens become `--bf-theme-*`; seed with the 16 bf themes |
| Mobile workspace (tabbed small-screen editor) | `src/views/canvas/mobile-workspace.tsx` | **Keep idea** (a tablet/phone editing layout), low priority |
| Preview workspace (devices, Inspect, DevTools) | `src/features/preview/PreviewToolbar.tsx`, `src/app/state/preview-session.ts` | **Keep**; the preview is driven from frames |
| AI action schema + proposals with risk | `src/domain/ai/canvas-action-schema.ts`, `packages/shared/src/assistant-action.ts` | **Keep** pattern; extend per §7; expose as MCP |
| Design-to-code bindings & generated folder layout | `docs/DESIGN_TO_CODE_PLAN.md`, `docs/DESIGNER_CONFIG_PLAN.md` | **Keep**; target `@bareframe/react` imports instead of generated primitives |
| Persistence keys | `designer.io.projects.v1`, `designer.io.templates.v1`, images in IndexedDB | **Keep** pattern → `bareframe.designer.projects.v1` |
| Framework | SolidJS + Tauri | **Port** to React (UI code can't be reused directly; the logic in snap/move-guides/schema ports nearly line-for-line) |
| Committed `.env` files | repo root | Not opened. **Rotate any keys** and remove them from git history |

---

## 9. Critique of the current prototype Designer (`bareframe` PR #1, `prototype/src/pages/designer/*`)

The prototype is a good **click-through of the product surface**: routes for Projects, Editor, Theme editor, Token editor, Export and Agent MCP, a global theme switcher over the 16 bf themes, and screenshots. As a Designer, though, it does not yet show any of the four things Sam cares about.

| Screen | File | Gap vs this spec |
|---|---|---|
| **Editor** | `Editor.tsx` | There is a single static `.canvas-frame` with a hard-coded mock "Acme Analytics" layout. It has no infinite canvas, zoom or pan, no frames, no device picker, no frame labels and no multiple frames. The palette is 8 inert buttons (`Button, Card, Input, Tabs, Modal, Toast, Badge, Select`) and does not come from the library registry. The inspector has 2 read-only fields (Selected, Padding) with no Layout/Responsive/Component/variant sections. Theme is "global from header switcher" only, so there's no per-frame theme. The AI chat is a permanent 4th column; designer.io's FAB + drawer saves canvas space. There is no layers tree, no pages list and no undo. |
| **Theme editor** | `ThemeEditor.tsx` | A base theme select plus two read-only fields (`Primary`, `Surface`) showing var names, not values. The live preview is 2 buttons and a card. It lacks designer.io's token groups, Code tab, specimen, duplicate-to-custom theme and REQUIRED-token completeness, and offers **no side-by-side comparison**. |
| **Token editor** | `TokenEditor.tsx` | An editable table of 17 tokens whose "values" are just `var(--…)` strings, so editing changes nothing. It is a separate route from the Theme editor; in designer.io these are one "Theme & Tokens" view. They should be merged. |
| **Dashboard** | `Dashboard.tsx` | Fine as a stub. Add device badges and frame-set thumbnails per project, and route "New screen" to the Create page modal with a device checklist. |
| **Export** | `Export.tsx` | Fine as a stub. Tie it to selected frames and pages, and add PNG/HTML/TSX per designer.io's `ExportRecord` formats. |
| **Agent MCP** | `AgentSettings.tsx` | Good direction (scoped tokens such as `components:read`, `themes:read`, `designer:write`). Add a list of the §7 tools and per-scope mapping (e.g. `designer:write` gates `create_frame`, `promote_trial`). |
| **Theming plumbing** | `theme/ThemeContext.tsx` | It swaps **one** `<link>` and sets `data-bf-theme` on `<html>`, which makes multiple themes on screen at once impossible. For Compare mode, load each needed theme CSS once (the files are already scoped by `[data-bf-theme='x']`) and set `data-bf-theme` on each **frame root/iframe**, not on the document. |
| **Rendering** | `Editor.tsx`, `App.css` | Components are prototype CSS classes (`.btn`, `.card`), not `@bareframe/react` (or `bf-*`) components, so the canvas isn't proving "design with real components" yet. |

**Suggested next prototype iteration** (still click-through, about 1–2 days):
1. Canvas with camera (pan, zoom, fit) and three frames for "Home" (iPhone 15 / iPad Mini / Desktop 1440) with labels.
2. Real flex layout in the frames, so each reflows by width.
3. A frame toolbar with device and theme dropdowns, and Compare › Themes showing 3 ghost frames (aurora / noir / light).
4. An inspector with Frame, Component (variant select) and Layout (mode/gap/padding/width mode) sections that actually mutate state.
5. A layers tree and pages list.
6. The AI chat moved to a FAB drawer.

---

## 10. Build order (real app)

| Milestone | Scope | Exit criteria |
|---|---|---|
| **M1 Canvas core** | Camera, frames (create/move/resize/label), device presets, minimap, shortcuts §4.2, snapping §4.3, undo/redo | Create 3 device frames, zoom/fit, undo everything |
| **M2 Tree + layout** | `DesignNode` tree, layout engine (CSS flex/grid in iframes), layers panel, insert from `@bareframe/react` registry, inspector Layout/Content/Style | Build a login page that reflows across 3 frames |
| **M3 Responsive** | Breakpoints, edit scope, overrides + indicators, hide-on-breakpoint, constraints for free nodes, overflow lint | §3.3 acceptance passes |
| **M4 Styles** | Per-frame theme, Themes workspace port, Compare mode (devices, themes, matrix) | Compare 4 themes × 3 devices live |
| **M5 Trials & variants** | StyleTrial capture, promote/save-as-theme, Components workspace variant grid | Trial → promote round-trip in one undo step |
| **M6 Agents & export** | MCP server exposing §7, TSX export with `@bareframe/react` imports, PNG render | An agent can create page → duplicate to devices → compare themes → export TSX |

---

## Appendix A: designer.io reference values

- **Default theme tokens** (`dio:src/store.tsx`):
  - colours: primary `#7c3aed`, secondary `#2563eb`, accent `#06b6d4`, surface `#111827`, canvas `#0b0f19`, text `#f8fafc`, muted `#94a3b8`, border `rgba(255,255,255,0.12)`, success `#22c55e`, warning `#f59e0b`, danger `#ef4444`;
  - font `ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif`, sizes 12/14/18;
  - spacing 8/12/20; radius 8/12/20;
  - shadow sm `0 1px 4px rgba(15,23,42,0.14)`, md `0 8px 24px rgba(15,23,42,0.20)`;
  - component tokens: buttonBg `#7c3aed`, buttonText `#fff`, cardBg `#94a3b8`, inputBg `#fff`, inputText `#0f172a`, inputBorder `rgba(100,116,139,0.40)`, badgeBg `#2563eb`, alertBg `#f59e0b`;
  - scope `project`, cssSelectorStrategy `root`, CSS prefix `--designer-*`.
- **New item fills:** screens `#e2e8f0`, partials `#bfdbfe`, components `#f8fafc`.
- **Grid default:** `{show: true, columns: 4, gutter: 16, margin: 16}`.
- **designer.config.json v1:** `framework`, `sourceRoot`, `generatedRoot: "src/generated/designer"`, `routes.strategy: "file-based"`, `codegen.language: "typescript"`, `codegen.styling: "css-modules"`.
- **Workspace plan:** top bar 48–56 px; insertion order drop parent → selected layout parent → selected page → viewport centre; grouping modal intents Group only / Block-Section / Component.

## Appendix B: Excerpts in this folder

| File | Source |
|---|---|
| `excerpts/screen-presets-and-rescale.ts` | `dio:src/store.tsx` L59–69, L1281–1319 |
| `excerpts/preview-device-presets.ts` | `dio:src/domain/preview/preview-event.ts` |
| `excerpts/types.ts` | `dio:src/types.ts` (full) |
| `excerpts/snap.ts` | `dio:src/editor/canvas/snap.ts` |
| `excerpts/layout-primitive-defaults.ts` | `dio:src/features/canvas/layout-primitive-defaults.ts` |
| `excerpts/canvas-action-schema.ts` | `dio:src/domain/ai/canvas-action-schema.ts` |
| `excerpts/assistant-action.ts` | `dio:packages/shared/src/assistant-action.ts` |
