# Themes and customizing appearance

## How themes ship

Themes live under **`themes/*.css`** in the repo. Published NPM paths mirror that: `import 'bareframe/themes/system.css'`.

Common setup:

```html
<link rel="stylesheet" href="/themes/layout.css" />
<link id="bareframe-theme" rel="stylesheet" href="/themes/system.css" />
```

Switching at runtime usually means swapping the stylesheet `href` and setting a marker on `<html>` for debugging or conditional CSS:

```js
themeLink.href = base + '/themes/dark.css';
document.documentElement.setAttribute('data-bf-theme', 'dark');
```

`system.css` mixes light/dark-aware defaults (`color-scheme`) and inherits much of **`layout.css`** structure via `@import`.

## Creating your own theme

1. **Start from an existing palette** (`system.css`, `dark.css`) or copy [examples/theme-mybrand.css](../examples/theme-mybrand.css).
2. **Keep the contract** — Every component’s shadow stylesheet maps design to `--bf-theme-*`. If your theme skips a token, fallbacks inside component CSS apply (but may drift between components).
3. **Shadow DOM caveat** — Custom properties **`inherit`** into shadow trees from the outer document. Themes must assign tokens on `:root`, `[data-bf-theme='…']`, or another ancestor host; component CSS should read tokens on **`:host { … var(--bf-theme-…) }`**—not assume global element selectors pierce Shadow DOM.
4. **Validate locally** — After `pnpm run build`, run `pnpm run validate:theme -- themes/foo.css` to check your file defines a minimum semantic set (see `scripts/validate-theme.mjs`).
5. **Ship as static CSS only** — No build step required for authors: one CSS file (plus optional `@import` of `layout.css`).

### Importing layout utilities

Typography and grid helpers (`[row]`, `[col]`, …) ship from **`bareframe/themes/layout.css`**. You can `@import './layout.css';` once at the top of a brand bundle or load it separately in HTML.

## Token discovery

Use `pnpm run studio` Component Studio token tab or read **`bareframe/tokens.json`** emitted from CI/build (union of `--bf-*` names across flattened theme CSS).
