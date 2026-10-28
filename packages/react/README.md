# @bareframe/react

Accessible React components for [Bareframe](https://bareframe.org) design systems. Components use **CSS theme tokens** (`--bf-theme-*`). **`@bareframe/react/styles.css`** also defines legacy **Repkit `--rk-*` aliases** that point at the same tokens.

Docs and live examples: [bareframe.org](https://bareframe.org)

## Install

After the package is published to npm:

```bash
npm install @bareframe/react react react-dom
# or
pnpm add @bareframe/react react react-dom
```

Peer dependencies: **React 18.3+ or 19**.

## Styles and themes

The package is **self-contained**: themes ship inside the npm tarball. You do not need a checkout of the bareframe repo.

### 1. Component styles (required)

```tsx
import '@bareframe/react/styles.css';
```

This file includes component rules, **button variant styles** (`.bf-btn--*`), and Repkit legacy variable aliases (`--rk-theme-*` → `--bf-theme-*`). The bareframe.org docs app imports component rules only from source and keeps site chrome in `prototype/src/index.css`.

### 2. Theme tokens (required)

Pick a built-in theme (tokens only — import **after** `styles.css`):

```tsx
import '@bareframe/react/styles.css';
import '@bareframe/react/themes/light.css';
```

Shortcut for the default light theme:

```tsx
import '@bareframe/react/styles.css';
import '@bareframe/react/theme.css'; // same as themes/light.css
```

**Shipped themes** (each under `@bareframe/react/themes/<name>.css`):

| Theme | Import |
|--------|--------|
| Light (default) | `@bareframe/react/themes/light.css` or `@bareframe/react/theme.css` |
| Dark | `@bareframe/react/themes/dark.css` |
| System (light/dark) | `@bareframe/react/themes/system.css` |
| Aurora, Desert, Future, Matrix, Modern, Nature, Nebula, Noir, Oceanic, Retro, Simple, Sprint, Sunrise | `@bareframe/react/themes/<name>.css` |

`layout.css` is included for `@import` resolution inside theme files; you normally import a named theme, not `layout.css` alone.

Optionally scope a subtree:

```html
<div data-bf-theme="dark">...</div>
```

Then import the matching theme file (e.g. `themes/dark.css`).

### Repkit legacy tokens

Repkit apps can keep using `--rk-theme-*` custom properties. They are defined in `styles.css` and resolve once a theme sets the underlying `--bf-theme-*` values:

```css
--rk-theme-button-primary-bg: var(--bf-theme-button-primary-bg);
```

## Quick usage

```tsx
import '@bareframe/react/styles.css';
import '@bareframe/react/themes/light.css';
import { Alert, Badge, Button, Input, Modal, Select } from '@bareframe/react';

export function Example() {
  return (
    <>
      <Alert variant="info">Hello</Alert>
      <Button variant="primary">Click me</Button>
      <Input aria-label="Email" placeholder="you@example.com" />
      <Select
        aria-label="Team"
        options={[
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ]}
      />
    </>
  );
}
```

See the [Bareframe prototype](https://github.com/SamuelDBines/bareframe/tree/main/prototype) for fuller patterns (DatePicker, Combobox, Modal, etc.).

## Use locally before npm publish

The package is not on the public registry until the `@bareframe` npm org is claimed and CI publishes with `NPM_TOKEN`. Until then, point your app at a built copy of this package.

### Option A — `file:` tarball (closest to npm)

From your **bareframe** checkout:

```bash
cd /path/to/bareframe/packages/react
pnpm install
pnpm build
pnpm pack --pack-destination /tmp
```

In **niproround** (or any Vite app), install the tarball (version in the filename matches `package.json`):

```bash
cd /path/to/niproround/frontend
npm install /tmp/bareframe-react-0.1.0.tgz
```

In the app:

```tsx
import '@bareframe/react/styles.css';
import '@bareframe/react/themes/light.css';
import { Button } from '@bareframe/react';
```

Re-run `pnpm pack` in bareframe after you pull library changes.

### Option B — `pnpm link`

```bash
# bareframe checkout
cd /path/to/bareframe/packages/react
pnpm install && pnpm build
pnpm link --global

# niproround frontend
cd /path/to/niproround/frontend
pnpm link --global @bareframe/react
```

### Option C — path dependency

In niproround `package.json`:

```json
"@bareframe/react": "file:/path/to/bareframe/packages/react"
```

Run `pnpm install`, then ensure `packages/react` is built (`pnpm --filter @bareframe/react build`) before starting the app.

## Development (this repo)

```bash
pnpm --filter @bareframe/react test:coverage
pnpm --filter @bareframe/react build
pnpm --filter @bareframe/react pack-quality    # publint + attw
pnpm --filter @bareframe/react consumer-smoke  # external Vite tarball + theme assert
```

Themes in `dist/themes/` are copied from the repo root `themes/` during `pnpm build`.

## Publishing

Maintainers: see [`RELEASING.md`](../../RELEASING.md) at the repo root.

## License

MIT © Bareframe
