# Releasing `@bareframe/react`

This document covers one-time npm setup (Sam only) and the routine release flow after CI is configured.

## One-time setup (Sam)

1. **Claim the npm org** — Sign in at [npmjs.com](https://www.npmjs.com/) and create or claim the **`@bareframe`** organization (the scope must exist before the first publish).

2. **Create an automation token** — In npm → Access Tokens → **Generate New Token** → **Granular Access Token**:
   - Packages: **Read and write** for `@bareframe/*` (or the whole org).
   - Enable **Bypass 2FA** for automation if your account requires it for CI publishes.

3. **Add the GitHub secret** — In this repo: **Settings → Secrets and variables → Actions → New repository secret**:
   - Name: `NPM_TOKEN`
   - Value: the granular token from step 2.

Until `NPM_TOKEN` is set, the **Release** workflow can still open “Version Packages” pull requests, but **`pnpm release` fails with a clear error** when Changesets tries to publish.

## Routine releases

1. **Describe the change** — On your feature branch, run from the repo root:
   ```bash
   pnpm changeset
   ```
   Choose **`@bareframe/react`**, pick semver bump (patch/minor/major), and write a short summary. Commit the generated file under `.changeset/`.

2. **Merge to `main`** — After your PR lands, the **Release** workflow (`release.yml`) runs Changesets:
   - If there are pending changesets, it opens a **“chore: version @bareframe/react”** PR that bumps `packages/react/package.json` and updates the changelog.
   - When that version PR is merged, the same workflow runs **`pnpm release`**, which builds the package and runs **`changeset publish`** to npm with [provenance](https://docs.npmjs.com/generating-provenance-statements).

3. **Verify on npm** — Check [@bareframe/react on npm](https://www.npmjs.com/package/@bareframe/react) and install in a consumer app:
   ```bash
   npm install @bareframe/react
   ```

## Manual publish (emergency only)

Prefer the Changesets flow. If you must publish locally:

```bash
pnpm --filter @bareframe/react build
cd packages/react
npm publish --access public --provenance
```

Requires `npm login` or `NPM_TOKEN` in the environment and permission on `@bareframe`.

## Local consumption before the first publish

See **`packages/react/README.md`** — use `pnpm pack` + `file:` tarball, `pnpm link`, or a monorepo `workspace:` dependency until `@bareframe/react` is on the registry.
