# Component documentation contract

Each **production-ready** (`bf-*`) component should converge on this checklist in source and on its demo page.

## Checklist per component

| Area | Requirement |
|------|--------------|
| **Tag** | `bf-<slug>` (Stencil `tag`). |
| **Import** | `import 'bareframe/components/<slug>.js'` registering the element. |
| **Props vs attributes** | Document reflected attributes (`variant`, `label`, booleans…) and `@Method()` APIs where relevant (`bf-modal`: `open()` / `close()`). |
| **Events** | `CustomEvent`s with composed/bubbles contract (`bf-click`, `bf-close`, …). |
| **Slots / children** | What projects into light DOM (`<slot>`). |
| **A11y** | Role / `aria-*` / labeling strategy (native control vs delegated). |
| **Tokens** | Main `--bf-theme-*` (or component-scoped) variables consulted in **`*.css`**. Short list is enough—full scan can follow. |
| **Demo** | `public/<slug>/index.html` (or generator output) with `data-demo-root` wrapper for automation. |

## Tiers vs this contract

See [TIERING.md](./TIERING.md):

- **Tier A** components must satisfy the full checklist and automated smoke + axe + theme-matrix slices in CI where applicable.
- **Tier B** add keyboard/interaction specs.
- **Tier C (“labs”)** may omit tests until elevated.

## Naming

Prefer **purpose over implementation** (`bf-error-summary`, not `bf-validation-box`). Messaging families are documented in the root `README.md` (toast vs message vs error summary).
