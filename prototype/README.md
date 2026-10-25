# Bareframe product prototype

Click-through prototype of the Bareframe marketing site, `@bareframe/react` docs gallery, and Bareframe Designer. Mock data only; themes load from the repo’s `themes/` CSS (synced into `public/themes` on build).

## Run locally

From the repo root (after `pnpm run build` is optional — themes are copied from `../themes`):

```bash
cd prototype
pnpm install
pnpm dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Use the header switcher to move between **Site**, **Components**, and **Designer**, and the theme dropdown to apply Bareframe `--bf-theme-*` styles.

## Build

```bash
cd prototype
pnpm run build
```

Output is written to `../public/prototype/` for GitHub Pages at `https://<user>.github.io/<repo>/prototype/`.

## Screens

| Area | Route (hash) | Screen |
|------|----------------|--------|
| Site | `#/` | Landing |
| Site | `#/pricing` | Pricing |
| Site | `#/sign-up` | Sign up |
| Site | `#/sign-in` | Sign in |
| Components | `#/components` | Gallery |
| Components | `#/components/:slug` | Component detail |
| Components | `#/components/tokens` | Tokens |
| Components | `#/components/mcp` | Connect agent (MCP) |
| Designer | `#/designer` | Project dashboard |
| Designer | `#/designer/editor` | Infinite canvas (frames, compare, trials) |
| Designer | `#/designer/themes` | Theme & tokens workspace |
| Designer | `#/designer/export` | Export / handoff |
| Designer | `#/designer/settings/agent` | Agent MCP settings |

Suggested click path: **Get started** → sign up → Designer dashboard → **Open in editor** → **Export** or **Theme editor**.
