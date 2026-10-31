# Delivery roadmap & exit criteria

This file tracks phased progress; update checkboxes when a phase exits.

## Phase 1 — Narrative & contracts

- [x] `docs/VISION.md`
- [x] `docs/THEMES.md`
- [x] `docs/COMPONENT-CONTRACT.md`
- [x] `docs/TIERING.md`
- [x] README links into `docs/`
- [x] Remove non-production stubs (`bf-aatest` removed)

## Phase 2 — Test foundation

- [x] Playwright + web server harness
- [x] Smoke specs (manifest, tokens, showcase load, failing network guard)
- [x] `docs/TESTING.md`
- [x] GitHub Actions workflow `test.yml`

## Phase 3 — Tiered demos & specs

- [x] Tier list documented (`TIERING.md`)
- [x] Tier A demos: `data-demo-root` anchors
- [x] Essentials theme-matrix + axe Playwright specs

## Phase 4 — Theme authoring

- [x] Example author theme (`examples/theme-mybrand.css`)
- [x] `pnpm run validate:theme`

## Phase 5 — Showcase as QA cockpit

- [x] Deep link `?component=<slug>` in Component Studio
- [x] Optional: broaden visual snapshots (opt-in via `VISUAL=1`; see `tests/e2e/visual.spec.ts`)

## Phase 6 — Agent MCP (read path)

- [x] Hosted MCP server (`mcp/`) with `list_components`, `get_component`, `list_themes`, `export_tokens`
- [x] Kubernetes manifests + CI image build for `ghcr.io/samueldbines/bareframe/mcp`
- [x] [`docs/MIGRATING-TO-BAREFRAME-REACT.md`](./MIGRATING-TO-BAREFRAME-REACT.md) + public MCP at `https://bareframe.org/mcp`

