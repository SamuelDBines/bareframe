# Migrating to `@bareframe/react`

Move React apps from **`@repkit/components`**, the **`repkit-components`** checkout, or vendored Repkit copies onto **`@bareframe/react`**. Bareframe ships the same React Aria–based primitives with **`--bf-theme-*`** tokens and optional **`--rk-theme-*`** aliases for legacy stylesheets.

Live docs: [bareframe.org](https://bareframe.org) · Component reference: `/components/*` · MCP: `https://bareframe.org/mcp`

---

## 1. Replace the package

| Before | After |
| --- | --- |
| `@repkit/components` | `@bareframe/react` |
| `repkit-components` (local path / monorepo) | `@bareframe/react` (npm, tarball, or `file:` — see [install steps](#2-install)) |

Remove Repkit from `package.json`, then install Bareframe (requires **React 18.3+ or 19**):

```bash
pnpm remove @repkit/components   # or npm uninstall
pnpm add @bareframe/react react react-dom
```

Until your app pins a registry version, use a **`file:`** dependency or **`pnpm pack`** tarball from this repo (`packages/react`). See **`get_install_steps`** on the MCP server for copy-paste commands.

---

## 2. Install

### From npm (after publish)

```bash
npm install @bareframe/react react react-dom
```

### From this repo (pre-publish / local)

```bash
cd /path/to/bareframe/packages/react
pnpm install && pnpm build && pnpm pack --pack-destination /tmp

cd /path/to/your-app
pnpm add /tmp/bareframe-react-0.1.0.tgz
```

Or in your app `package.json`:

```json
"@bareframe/react": "file:/path/to/bareframe/packages/react"
```

Run `pnpm --filter @bareframe/react build` in the bareframe checkout before starting your app.

---

## 3. Styles and themes

Repkit apps typically imported a global stylesheet and a theme. Bareframe splits the same concerns:

### Required — component rules + Repkit token aliases

```tsx
import '@bareframe/react/styles.css';
```

`styles.css` includes component classes (`.bf-btn--*`, `.bf-alert`, …) and **legacy Repkit aliases** (`--rk-theme-*` → `--bf-theme-*`). Defined in `packages/react/src/styles/bareframe-ui.css`:

| Legacy (`--rk-*`) | Maps to |
| --- | --- |
| `--rk-theme-surface-1` | `var(--bf-theme-surface-1)` |
| `--rk-theme-surface-2` | `var(--bf-theme-surface-2)` |
| `--rk-theme-text-1` | `var(--bf-theme-text-1)` |
| `--rk-theme-text-2` | `var(--bf-theme-text-2)` |
| `--rk-theme-border-1` | `var(--bf-theme-border-1)` |
| `--rk-theme-button-primary-bg` | `var(--bf-theme-button-primary-bg)` |
| `--rk-theme-button-primary-color` | `var(--bf-theme-button-primary-color)` |

You can **keep existing CSS that references `--rk-theme-*`** as long as you import `styles.css` and a theme (below).

### Required — theme tokens

Pick one built-in theme (import **after** `styles.css`):

```tsx
import '@bareframe/react/styles.css';
import '@bareframe/react/themes/light.css';
```

Shortcuts:

| Goal | Import |
| --- | --- |
| Default light | `@bareframe/react/theme.css` (same as `themes/light.css`) |
| Dark | `@bareframe/react/themes/dark.css` |
| System (prefers-color-scheme) | `@bareframe/react/themes/system.css` |
| Named palette (aurora, noir, …) | `@bareframe/react/themes/<name>.css` |

Optional subtree scoping:

```tsx
<div data-bf-theme="dark">{/* children */}</div>
```

Import the matching theme file (e.g. `themes/dark.css`).

### Repkit global CSS → Bareframe

| Repkit habit | Bareframe equivalent |
| --- | --- |
| Repkit bundle CSS | `@bareframe/react/styles.css` |
| Repkit theme / tokens CSS | `@bareframe/react/themes/<name>.css` |
| Custom `--rk-*` in app CSS | Keep names; aliases ship in `styles.css` |
| `.rk-*` / Repkit class prefixes | Use `.bf-*` from Bareframe (e.g. `.bf-btn--primary`) |

---

## 4. Component imports

Repkit and Bareframe share the **same export names** for the React layer shipped in this repo. Update the import path only:

```tsx
// Before
import { Button, Input, Modal } from '@repkit/components';

// After
import { Button, Input, Modal } from '@bareframe/react';
```

### Supported React exports (from `packages/react/src/index.ts`)

| Export | Typical doc slug | Notes |
| --- | --- | --- |
| `Alert` | `alert` | |
| `Badge` | `badge` | |
| `Button` | `button` | Variants: `primary`, `secondary`, `ghost`, `destructive` |
| `Calendar` | `calendar` | |
| `Card` | `card` | |
| `DatePicker` | `date-picker` / `datepicker` | |
| `Checkbox`, `RadioGroup`, `Slider`, `Switch`, `Textarea` | `checkbox`, `radio-group`, … | From `forms` barrel |
| `Progress`, `Skeleton`, `Spinner`, `Toast` | `progress`, `skeleton`, … | |
| `Avatar`, `EmptyState`, `StatCard`, `Table` | `avatar`, `empty-state`, … | |
| `Field`, `Input` | `field`, `input` | |
| `Drawer`, `Modal` | `drawer`, `modal` | |
| `Accordion`, `Breadcrumbs`, `Pagination`, `Tabs` | `accordion`, `breadcrumbs`, … | |
| `Combobox`, `MultiSelect`, `NativeSelect`, `Select` | `combobox`, `multiselect`, `select` | |
| `DropdownMenu`, `Popover`, `PopoverPanel`, `Tooltip` | `dropdown-menu`, `popover`, `tooltip` | |
| `cn` | — | Class name helper |

Web-only Bareframe primitives (`bf-chart`, `bf-map`, …) remain **`bareframe`** custom elements — they are not part of `@bareframe/react` yet. Use the [component gallery](https://bareframe.org/components) or MCP `list_components` for the full ~74 slugs.

---

## 5. Props and API

Props are documented from **`packages/react`** sources (see MCP **`get_component`** for JSON). Highlights when moving from Repkit:

| Area | Guidance |
| --- | --- |
| **Button** | `variant`, `size`, `loading`, `disabled` — same mental model; classes are `.bf-btn--*`. |
| **Input / Field** | Use `Field` + `Input` for labels and errors; `aria-label` when no visible label. |
| **Select / Combobox** | `options: { value, label }[]`; Combobox adds filtering — check doc examples. |
| **Modal / Drawer** | Contained overlays for docs/playgrounds vs portaled — see component pages. |
| **Toast** | Inline component; wire your own queue if you used Repkit’s global toaster. |

Run MCP **`get_component`** with a slug (e.g. `button`) for the prop table and **real `.example.tsx` sources** from the docs app.

---

## 6. Migration checklist

- [ ] Remove `@repkit/components` / `repkit-components` from dependencies.
- [ ] Add `@bareframe/react` (npm, tarball, or `file:`) and matching `react` / `react-dom` peers.
- [ ] Import `@bareframe/react/styles.css` once at app entry.
- [ ] Import one `@bareframe/react/themes/<name>.css` (or `theme.css`).
- [ ] Replace import paths: `@repkit/components` → `@bareframe/react`.
- [ ] Search for `--rk-theme-` — no change required if aliases cover your keys; add Bareframe theme import if tokens look unstyled.
- [ ] Search for Repkit-specific class names; map to `.bf-*` where needed.
- [ ] Run your test suite and visual QA on forms, modals, and selects.
- [ ] (Optional) Connect [MCP at `https://bareframe.org/mcp`](https://bareframe.org/mcp) so agents read props/examples from repo data instead of scraping HTML.

---

## 7. Need help?

- **Docs:** [Get started](https://bareframe.org/#/components/start) on bareframe.org  
- **MCP:** `get_migration_guide`, `get_install_steps`, `search_docs` tools  
- **Issues:** [github.com/SamuelDBines/bareframe/issues](https://github.com/SamuelDBines/bareframe/issues)
