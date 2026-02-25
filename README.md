# bareframe

Lightweight, dependency-free Web Components for building reusable UI across applications.

## Install

```bash
npm install bareframe
```

## Package Usage

Register everything:

```js
import 'bareframe';
```

Or import one component:

```js
import 'bareframe/components/button.js';
```

Load a theme:

```js
import 'bareframe/themes/system.css';
```

`system` is the default/recommended theme for bareframe.

## Why bareframe

`bareframe` is built for one purpose: create components once and reuse them everywhere.

- Lightweight by design
- Zero runtime dependencies
- Native Web Components approach
- Reusable across multiple internal and external apps
- Easy to extend without framework lock-in

## Philosophy

- Keep components small and focused
- Favor native browser APIs
- Prioritize portability and long-term maintainability
- Build reusable primitives first, then compose upward

## Package Goals

- Provide a clean foundation for shared UI components
- Reduce duplication between projects
- Keep implementation straightforward and easy to reason about

## Example

```js
import './src/button/button.js';
import './src/accordion/accordion.js';
```

```html
<bf-button label="Save" variant="primary"></bf-button>
<bf-button label="Cancel" variant="secondary"></bf-button>

<bf-accordion>
	<section title="Section One" open>
		<p>Accordion content one.</p>
	</section>
	<section title="Section Two">
		<p>Accordion content two.</p>
	</section>
</bf-accordion>
```

## Theming (CSS Variables)

`bf-button` is themeable through CSS custom properties on the host element.

```css
bf-button {
	--bf-button-border-radius: 999px;
	--bf-button-padding-y: 0.6rem;
	--bf-button-padding-x: 1.1rem;
	--bf-button-primary-bg: #0f766e;
	--bf-button-primary-color: #f0fdfa;
	--bf-button-focus-outline-color: #5eead4;
}

bf-button[variant='secondary'] {
	--bf-button-secondary-bg: #ecfeff;
	--bf-button-secondary-color: #115e59;
	--bf-button-secondary-border-color: #14b8a6;
}
```

## Built-in Themes

Theme files live in `themes/`:

- `themes/light.css`
- `themes/dark.css`
- `themes/sprint.css`
- `themes/system.css` (follows OS preference with `prefers-color-scheme`)

Use `system` as the default theme for apps:

```html
<link rel="stylesheet" href="./themes/system.css" />
```

Load one theme globally:

```html
<link rel="stylesheet" href="./themes/dark.css" />
```

Or use system theme:

```html
<link rel="stylesheet" href="./themes/system.css" />
```

Optional runtime switch:

```js
document.documentElement.setAttribute('data-bf-theme', 'sprint');
```

## Theme Standard For All Components

All components should be fully replaceable through CSS variables:

- Component tokens: `--bf-<component>-*`
- Global theme tokens: `--bf-theme-*`
- Component defaults should map to global tokens, then fall back

Reference:

- `docs/theming-contract.md`
- `src/_template/component.css`
- `src/_template/component.js`

## Button Test Example

An example test harness is included at `examples/button-test.html`.

From the project root, run:

```bash
python3 -m http.server 8080
```

Then open:

`http://localhost:8080/examples/button-test.html`

This page lets you:

- Click `bf-button` components and inspect emitted `bf-click` event payloads
- Run quick checks for element registration, label rendering, and variant classes

## Accordion Test Example

An example test harness is included at `examples/accordion-test.html`.

Open:

`http://localhost:8080/examples/accordion-test.html`

This page lets you:

- Test accordion open/close behavior
- Inspect `bf-accordion-toggle` event payloads
- Switch `light`, `dark`, `sprint`, and `system` themes

## Full Component Examples

All generated component demos are listed at:

`http://localhost:8080/examples/index.html`

## Build Package

```bash
npm run build
npm run watch
npm run pack:preview
```

## Status

Early development. API and component patterns may evolve as the system grows.

## License

MIT
