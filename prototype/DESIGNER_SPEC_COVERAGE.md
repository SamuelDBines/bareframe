# Designer spec coverage (prototype)

Reference: `DESIGNER_SPEC.md` (designer.io extraction). This prototype implements the **§9 suggested next iteration** plus partial §6 flows.

## Done (interactive, mock data)

| Spec area | Implementation |
|-----------|----------------|
| Infinite canvas pan/zoom | World transform; Space+drag / wheel pan; Ctrl/Cmd+wheel zoom ~cursor; 25–250% clamp; Fit all; Shift+1/2/0 shortcuts |
| Multiple frames per page | Initial Home frame set (iPhone 15, iPad Mini, Desktop 1440); add frame; drag to move |
| Device presets | designer.io preset list in `designer/devicePresets.ts`; per-frame device dropdown |
| One tree, many frames | `Page.nodes` shared; each frame iframe width = device width; flex reflow + breakpoint overrides (e.g. row→column on base) |
| Per-frame theme | `data-bf-theme` on iframe document; compare shows multiple themes at once |
| Duplicate to devices | Toolbar + frame toolbar + assistant action |
| Compare mode | Devices (temp ghosts), themes (ghost frames), device×theme matrix |
| Style trials | Create trial frame; token tweaks; promote to page / save as theme |
| Component palette | Add Button, Card, Input, Badge, Alert into selected parent |
| Layers tree | Page structure with selection |
| Inspector | Selection, Frame, Component (variant), Content, Layout, Responsive scope |
| Themes workspace | Merged `/designer/themes` — token edits + live iframe preview |
| AI assistant | FAB drawer with example agent actions |
| Designer sub-nav padding | `designer-subnav` margin/padding fix |

## Partial / simplified

| Spec | Prototype gap |
|------|----------------|
| Rendering | iframe `srcdoc` + hand-built HTML, not full `@bareframe/react` |
| Breakpoints | Override model exists; not all inspector fields show override dots |
| Snapping / minimap / marquee | Not implemented |
| Frame resize handles | Device change via dropdown, not edge drag |
| Undo/redo | Store has history slots; UI shortcuts not wired |
| Landscape toggle | Type supported; no UI button yet |
| Preview workspace / connectors | Not in prototype |
| Full token groups + REQUIRED meter | Themes workspace has 5 editable tokens + specimen page tree |
| MCP server | Mock actions in UI only |

## Deferred (real app / later milestones)

- M1 snapping, minimap, full shortcut set (F/R/T tools)
- M2 full layout engine (grid, free constraints, hug height)
- M3 hide-on-breakpoint, overflow lint, constraint handles
- M4 full Themes port (Monaco, import/export JSON, 16-theme column grid)
- M5 Components workspace variant grid
- M6 Live MCP server + TSX export pipeline
- Persistence (localStorage / project JSON)
- Activity rail (Canvas / Themes / Components / Preview / Code / Agents)
