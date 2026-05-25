# Testing bareframe

## What runs in CI

The **test** workflow (`.github/workflows/test.yml`) executes:

1. `pnpm install --frozen-lockfile`
2. `pnpm run typecheck`
3. Full static site assembly: `pnpm run build` → `generate-examples` + `generate-versions` → `pnpm run prep-pages` → Vite showcase build
4. **`pnpm exec playwright install --with-deps`** (browsers)
5. **`pnpm exec playwright test`**

## Playwright locally

After a full build (so `public/` has `dist`, `themes`, `showcase`, and demos):

```bash
pnpm run build
pnpm run generate:examples
pnpm run generate:versions
pnpm run prep-pages
pnpm --prefix showcase exec vite build
pnpm exec playwright install
pnpm run test:e2e
```

Playwright starts **`sirv-cli`** against `public/` unless `PW_NO_SERVER=1` is set (use when you already serve the same tree yourself).

Tests import a small fixture (`tests/e2e/fixtures.ts`) that **aborts PayPal CDN scripts** (demos embed a donate button) and **`gotoDemo()`** uses **`domcontentloaded`** so navigations mirror GitHub Pages without waiting on third-party `load` edges.

### Subpath / GitHub Pages shape

Set `PW_BASE_URL` if you serve the site under a prefix (rare for local). Default is `http://127.0.0.1:4173`.

### Flaky policy

- Prefer **structural assertions** (elements visible, `boundingBox` non-zero, stylesheet applied) over pixel diffs.
- **Axe** violations on demo pages are **errors** for Tier A shells in `tests/e2e/a11y.spec.ts`.
- Re-run failed jobs once; if persistent, quarantine the spec with an issue link in a `test.skip` comment (document here when you do).

## Smoke vs matrix

| Suite | Purpose |
|-------|---------|
| `smoke.spec.ts` | `manifest.json`, `tokens.json`, showcase shell, no 4xx/5xx on navigation. |
| `theme-matrix.spec.ts` | Tier A demo pages: flip `themeSelect` across a few themes, assert `data-demo-root` host still visible. |
| `a11y.spec.ts` | `@axe-core/playwright` on Tier A pages. |

Extend matrix by adding demo slugs parallel to `TIER_A_DEMO_SLUGS` in specs (keep aligned with [TIERING.md](./TIERING.md)).

## Theme validation (no browser)

```bash
pnpm run validate:theme -- examples/theme-mybrand.css
# Optional: compare vs full token union (from dist after build:lib)
pnpm run build:lib
pnpm run validate:theme -- themes/dark.css --check-union
```

`--check-union` exits with code `1` unless every token listed in `dist/tokens.json` appears in the flattened theme file — **very strict** (use for internal themes / CI gates selectively).
