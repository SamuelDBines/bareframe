# @bareframe/react

Accessible React components for [Bareframe](https://bareframe.org) design systems. Components use **CSS theme tokens** (`--bf-theme-*`) and ship legacy **`--rk-*` aliases** for Repkit compatibility.

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

1. Import the component stylesheet (required):

```tsx
import '@bareframe/react/styles.css';
```

2. Load a Bareframe **theme** CSS file (defines `--bf-theme-*` and optional `--rk-*` aliases). Themes live in the main repo under [`themes/`](https://github.com/SamuelDBines/bareframe/tree/main/themes) (for example `themes/light.css`, `themes/system.css`).

```tsx
import '@bareframe/react/styles.css';
import './themes/light.css'; // copy or link from the bareframe repo
```

Optionally scope a subtree:

```html
<div data-bf-theme="dark">...</div>
```

## Quick usage

```tsx
import '@bareframe/react/styles.css';
import './themes/light.css';
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

You still need `import '@bareframe/react/styles.css'` and a theme file in the app.

### Option C — monorepo `workspace:` (if both repos were one pnpm workspace)

Not applicable to separate repos; use A or B.

### Option D — path dependency

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
pnpm --filter @bareframe/react consumer-smoke  # external Vite tarball test
```

## Publishing

Maintainers: see [`RELEASING.md`](../../RELEASING.md) at the repo root.

## License

MIT © Bareframe
