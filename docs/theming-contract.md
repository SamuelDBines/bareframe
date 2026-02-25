# Bareframe Theming Contract

Every component in bareframe should be fully replaceable through CSS variables.

## Rule

1. Expose component tokens as `--bf-<component>-*` on `:host`.
2. Map defaults to global theme tokens `--bf-theme-*`.
3. Avoid hard-coded visual values in component selectors.
4. Keep state tokens explicit (`hover`, `active`, `focus`, `disabled`, etc.).

## Pattern

```css
:host {
	--bf-<component>-color: var(--bf-theme-<semantic-color>, <fallback>);
	--bf-<component>-radius: var(--bf-theme-radius-md, 8px);
}
```

## Global Theme Tokens

Use semantic globals in theme files (`themes/*.css`) such as:

- `--bf-theme-surface-1`
- `--bf-theme-surface-2`
- `--bf-theme-text-1`
- `--bf-theme-text-2`
- `--bf-theme-border-1`
- `--bf-theme-focus-ring-color`
- Component-level globals like `--bf-theme-button-*`, `--bf-theme-accordion-*`

## Override Levels

1. Global app theme: set values in `:root` or `[data-bf-theme='...']`.
2. Component instance: set vars directly on a tag (for one-off styling).
3. Variant-level: map variant classes/attributes to internal active tokens.

## Current Coverage

- `bf-button`: tokenized and mapped to `--bf-theme-button-*`
- `bf-accordion`: tokenized and mapped to `--bf-theme-accordion-*`

New components should follow the same token naming and mapping strategy.
