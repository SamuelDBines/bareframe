# Component Studio fidelity checklist

Use this checklist to decide whether **[Component Studio](https://samueldbines.github.io/bareframe/showcase/)** (demos plus the **Customize** tab) does justice to each primitive. Tier definitions and CI expectations live in **[TIERING.md](./TIERING.md)**. Public API conventions (events, attributes, shadows) live in **[COMPONENT-CONTRACT.md](./COMPONENT-CONTRACT.md)**.

## How to use

1. Fill **Tier A** rows first; they correspond to Essentials in the Studio and set the baseline for trust.
2. For Tier B/C, stubs are acceptable until a component is promoted; record **stub vs rich** honestly.
3. **Customize metadata** refers to **`showcase/meta/customize.json`** (documented events, whitelisted demo actions, copy hints).
4. **CSS surface** is a judgment across **theme tokens**, **`::part()`** hints from **`dist/showcase-studio.json`** (build scans TSX `part="…"` names), and any component-scoped vars described in THEMES/COMPONENT-CONTRACT.

| Slug             | Tier  | Demo (stub vs rich) | `data-demo-root` on demo markup | Customize metadata (events/actions/hints) | CSS surface judgment |
|------------------|-------|---------------------|----------------------------------|--------------------------------------------|-----------------------|
| `button`         | A     |                     |                                  |                                            |                       |
| `link`           | A     |                     |                                  |                                            |                       |
| `input`          | A     |                     |                                  |                                            |                       |
| `header`         | A     |                     |                                  |                                            |                       |
| `footer`         | A     |                     |                                  |                                            |                       |
| `modal`          | A     |                     |                                  |                                            |                       |
| `dialog`         | A     |                     |                                  |                                            |                       |
| `toast`          | A     |                     |                                  |                                            |                       |
| `message`        | A     |                     |                                  |                                            |                       |
| `error-summary`  | A     |                     |                                  |                                            |                       |
| `checkbox`       | A     |                     |                                  |                                            |                       |
| `radio`          | A     |                     |                                  |                                            |                       |
| `select`         | A     |                     |                                  |                                            |                       |
| `toggle`         | A     |                     |                                  |                                            |                       |
| `chart`          | Labs* |                     |                                  |                                            |                       |

\* `chart` is listed in Essentials for Studio navigation but Tier C expectations apply (see **TIERING.md**).

## Promoting rows

When a Tier B/C slug graduates, update **TIERING.md**, tighten the demo, add or extend Customize metadata where automated actions clarify behavior, and ensure **`dist/showcase-studio.json`** is produced by **`pnpm run build`** so **`::part()`** hints stay truthful.
