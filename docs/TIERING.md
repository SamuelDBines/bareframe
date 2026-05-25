# Component tiers (quality & CI expectations)

Tiers prioritize **trust** without blocking all ~75 primitives on Day 1.

## Tier A — Flagship

**Expectation:** Stable API, demos with `data-demo-root`, Tier A CI coverage (presence + theme-matrix subset + axe on representative pages).

| Slug |
|------|
| `button`, `link`, `input`, `header`, `footer` |
| `modal`, `dialog` |
| `toast`, `message`, `error-summary` |
| `checkbox`, `radio`, `select`, `toggle` |

These align with MVP/Essentials in the Component Studio (see `ESSENTIAL_SLUGS` plus key form controls).

## Tier B — Rich interaction

**Expectation:** Documented APIs; expanding Playwright coverage for keyboard navigation and overlays.

Examples: `combobox`, `autocomplete`, `menu`, `dropdown`, `data-grid`, `date-picker`, `command-palette`, `navigation` family (`bf-nav`), `pagination`, …

Tier B inherits Tier A checklist but **interaction tests are required before declaring “production”** inside this tier.

## Tier C — Labs / experimental

**Expectation:** Shipped tags may change; demos may lag; axe/theme-matrix skipped in default CI gates until promoted.

Examples: heavyweight or placeholder visuals (`chart` placeholder stubs, `video-player`, `map`, niche widgets).

Promotion rule: Tier C → Tier B opens a tracking issue referencing [COMPONENT-CONTRACT.md](./COMPONENT-CONTRACT.md) completeness.
