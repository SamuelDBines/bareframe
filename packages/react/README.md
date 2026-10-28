# @bareframe/react

Accessible React components for Bareframe design systems. Components use **CSS theme tokens** (`--bf-theme-*`) and ship legacy **`--rk-*` aliases** for Repkit compatibility.

## Install

```bash
npm install @bareframe/react react react-dom
```

## Usage

```tsx
import '@bareframe/react/styles.css';
import '/themes/light.css';
import { Alert, Button } from '@bareframe/react';
```

Load a theme file from this repo’s `themes/` directory (or your hosted copy), optionally scoped:

```html
<div data-bf-theme="dark">...</div>
```

## Publishing

The package is configured for npm (`publishConfig.access: public`) but **not published yet** — the `@bareframe` scope is not claimed.

## Development

```bash
pnpm --filter @bareframe/react test:coverage
pnpm --filter @bareframe/react build
```
