# Bareframe vision

## What “best” looks like here

Bareframe is a **framework-agnostic, theme-first UI layer** built on native **custom elements (`bf-*`)** and optional **CSS utility attributes** (`[row]`, `[col]`, `[typography]`… from `themes/layout.css`). Consumers get:

1. **Token truth** — Design decisions flow from **`--bf-*` / `--bf-theme-*`** custom properties. Themes are plain CSS files: diffable, portable, vendor-neutral.
2. **Portable installs** — Use the full bundle, the min bundle, or **one component import** (`bareframe/components/button.js`) plus **`bareframe/themes/*.css`**.
3. **Utilities-first composition** — Prefer layout primitives for structure; promote `bf-*` where behavior, semantics, or complex interaction lives.
4. **Provable quality** — CI covers typecheck plus **browser checks** (smoke URLs, theme swap, selective accessibility audits). Monetization / theme marketplace is **explicitly deferred** until this bar holds.

## Non-goals (for now)

- Paid tiers, entitlement-gated bundles, or a built-in storefront for third-party themes.
- Pixel-perfect snapshots for **every component × every theme** (subset only later).
- Framework-specific wrappers (Vue/React) in this repo—we stay on standards so those can wrap us.

See [ROADMAP.md](./ROADMAP.md) for phased execution and exit criteria.
