# Prototype screens

Hash routing (`#/…`) for GitHub Pages.

| # | Screenshot | Route | Description |
|---|------------|-------|-------------|
| 1 | `01-site-landing.png` | `#/` | Marketing landing |
| 2 | `02-site-pricing.png` | `#/pricing` | Pricing |
| 3 | `03-site-sign-up.png` | `#/sign-up` | Sign up |
| 4 | `04-site-sign-in.png` | `#/sign-in` | Sign in |
| 5 | `05-components-gallery.png` | `#/components` | Component gallery |
| 6 | `06-components-button-detail.png` | `#/components/button` | Component detail |
| 7 | `07-components-tokens.png` | `#/components/tokens` | Tokens explorer |
| 8 | `08-components-mcp.png` | `#/components/mcp` | Connect agent |
| 9 | `09-designer-dashboard.png` | `#/designer` | Projects |
| 10 | `10-designer-canvas-frames.png` | `#/designer/editor` | Infinite canvas, multi-device frames, pan/zoom |
| 11 | `11-designer-themes-workspace.png` | `#/designer/themes` | Merged theme & token editor |
| 12 | `12-designer-export.png` | `#/designer/export` | Export |
| 13 | `13-designer-agent-mcp.png` | `#/designer/settings/agent` | Agent MCP |
| 14 | `14-designer-compare-matrix.png` | `#/designer/editor` + Compare matrix | Device × theme grid |
| 15 | `15-designer-style-trial.png` | `#/designer/editor` + Trial | Style trial branch |

Regenerate: `node prototype/scripts/capture-screenshots.mjs` (from repo root, after `pnpm --prefix prototype run build`).

See `DESIGNER_SPEC_COVERAGE.md` for spec vs prototype scope.
