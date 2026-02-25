# bareframe

Lightweight, dependency-free Web Components for building reusable UI across applications.

## Install

```bash
npm install bareframe
```

Links:

- npm: https://www.npmjs.com/package/bareframe
- GitHub Pages examples: https://samueldbines.github.io/bareframe/
- Chart demo: https://samueldbines.github.io/bareframe/chart-test.html

## Package Usage

Register everything:

```js
import 'bareframe';
```

Single-file production bundle:

```js
import 'bareframe/min';
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

Optional layout utilities:

```js
import 'bareframe/themes/layout.css';
```

Grid-style column spans are supported with a 12-column model:

```html
<div row>
	<div col="3">Sidebar</div>
	<div col="9">Main</div>
</div>
```

If `col` has no value, it auto-shares available width with siblings.

Alignment utilities:

```html
<div row="left">...</div>
<div row="center">...</div>
<div row="right">...</div>

<div col="top">...</div>
<div col="center">...</div>
<div col="bottom">...</div>
```

Table/data-grid utilities:

```html
<div table dense>
  <div thead>
    <div tr><div th>ID</div><div th>Name</div></div>
  </div>
  <div tbody>
    <div tr><div td>1</div><div td>Alpha</div></div>
  </div>
</div>
```

Skeleton can be used as a utility on any target element:

```html
<bf-card skeleton="1500">...</bf-card>
<div skeleton="2s">...</div>
```

Typography utilities follow the same attribute pattern:

```html
<h1 typography="display">Dashboard</h1>
<p typography="body">Body copy text.</p>
<small typography="caption">Updated 2m ago</small>
```

Short boolean attributes are also supported:

```html
<small h1>Heading-sized small text</small> <span caption>Caption text</span>
```

Bareframe runtime defaults for all `bf-*` elements:

- auto id assignment (and duplicate id collision repair)
- `data-qa="test-<id>"` when missing
- `data-translate="<html lang>"` when missing (defaults to `en` if `<html lang>` is not set)

ID-driven controls for interactive components:

```html
<bf-button bf-open="account-modal">Open</bf-button>
<bf-button bf-close="account-modal">Close</bf-button>
<bf-button bf-toggle="account-modal">Toggle</bf-button>
<bf-modal id="account-modal">...</bf-modal>
```

Accordion section control by id:

```html
<bf-button bf-open="docs:intro">Open intro</bf-button>
<bf-accordion id="docs">
	<section id="intro" title="Intro">...</section>
</bf-accordion>
```

Group primitives (utility-first authoring):

```html
<bf-radio group="plan">Free</bf-radio>
<bf-radio group="plan">Pro</bf-radio>

<bf-button group="filters" multiple="2">A</bf-button>
<bf-button group="filters" multiple="2">B</bf-button>
<bf-button group="filters" multiple="2">C</bf-button>

<bf-checkbox group="features" multiple="3">Logs</bf-checkbox>
<bf-checkbox group="features" multiple="3">Alerts</bf-checkbox>
```

Menu/list item pattern:

```html
<bf-menu>
	<div item>Profile</div>
	<div item>Settings</div>
</bf-menu>
```

Header/footer edge positioning (same API on both):

```html
<bf-edge sticky header>...</bf-edge> <bf-edge fixed footer>...</bf-edge>
```

You can also force placement with `position="top"` or `position="bottom"`.

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
- `themes/retro.css`
- `themes/modern.css`
- `themes/simple.css`
- `themes/nature.css`
- `themes/future.css`
- `themes/aurora.css`
- `themes/nebula.css`
- `themes/desert.css`
- `themes/matrix.css`
- `themes/noir.css`
- `themes/sunrise.css`
- `themes/oceanic.css`
- `themes/system.css` (follows OS preference with `prefers-color-scheme`)
- `themes/layout.css` (`[row]` and `[col]` utility attributes)

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

Hosted examples:

`https://samueldbines.github.io/bareframe/`

## npm Publish Checklist

1. Update version:

```bash
npm version patch
```

2. Build and verify package contents:

```bash
npm run build
npm run pack:preview
```

3. Publish to npm:

```bash
npm publish
```

4. Push version tags:

```bash
git push origin main --follow-tags
```

## Build Package

```bash
npm run build
npm run watch
npm run pack:preview
```

Production bundle output:

- `dist/bareframe.min.js` (single minified JS file with inlined component CSS)

## Status

Early development. API and component patterns may evolve as the system grows.

## License

MIT
