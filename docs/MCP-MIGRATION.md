# Bareframe MCP — migration guide

This guide helps you move coding agents from **scraping** [bareframe.org](https://bareframe.org) HTML to the **hosted MCP server** at `https://mcp.bareframe.dev/v1`.

## Why migrate

| Scraping docs HTML | Bareframe MCP |
| --- | --- |
| Breaks when markup or URLs change | Stable JSON tool responses |
| Hard to get props, tiers, and token names reliably | `get_component`, `list_components`, `export_tokens` |
| Large page payloads in context | Request only the slug or theme you need |
| No auth or scope boundaries | Bearer tokens with `components:read` / `themes:read` |

The MCP server ships the same facts as the npm package (`manifest.json`, `tokens.json`, theme CSS variables) and `@bareframe/react` prop tables used in the Designer prototype.

## 1. Add the server (Cursor / Claude Desktop)

```json
{
  "mcpServers": {
    "bareframe": {
      "url": "https://mcp.bareframe.dev/v1",
      "headers": {
        "Authorization": "Bearer YOUR_TOKEN_HERE"
      }
    }
  }
}
```

Cursor also supports MCP servers in **Settings → MCP**. Use the URL above and paste the bearer token when prompted.

## 2. Authenticate

Hosted MCP requires a bearer token. Tokens are JSON records stored in the cluster secret `bareframe-mcp-env` (key `BAREFRAME_MCP_TOKENS`). Each entry looks like:

```json
[
  {
    "id": "cursor-readonly",
    "token": "bf_mcp_…",
    "scopes": ["components:read", "themes:read"]
  }
]
```

| Scope | Tools |
| --- | --- |
| `components:read` | `list_components`, `get_component` |
| `themes:read` | `list_themes`, `export_tokens` |
| `designer:write` | Reserved for future Designer mutations (not enabled on the hosted read-only server yet) |

Designer → **Settings → Agent connections** will mint these tokens in a later milestone; until then, create the Kubernetes secret after deploy (see [`deploy/README.md`](../deploy/README.md)).

## 3. Replace common scraping workflows

### “What components exist?”

**Before:** crawl `/` or parse the showcase HTML.

**After:** call `list_components` (optional filters: `category`, `stability`).

### “What props does `Button` accept?”

**Before:** open `/button/` and guess from tables or examples.

**After:** `get_component` with `{ "slug": "button" }` — returns props, stability, React export name, and a usage snippet.

### “What themes can I load?”

**Before:** download CSS from `/themes/*.css`.

**After:** `list_themes` — returns ids, `cssImport` paths (`bareframe/themes/system.css`), and variable counts. Pass `"includeVariables": true` when you need the full `--bf-theme-*` map (large).

### “Give me the design token list”

**Before:** run `pnpm run build` locally and read `dist/tokens.json`.

**After:** `export_tokens` with no args returns the same token **names** as `bareframe/tokens.json`. Pass `"themeId": "noir"` to resolve values for one theme.

## 4. Local development (stdio)

For offline work, run the MCP server on stdio after bundling catalog data from the repo:

```bash
pnpm run mcp:build
BAREFRAME_MCP_STDIO_SCOPES=components:read,themes:read node mcp/dist/stdio.js
```

Point your MCP client at that command instead of the hosted URL. Stdio mode skips bearer auth (scopes come from `BAREFRAME_MCP_STDIO_SCOPES`).

## 5. HTTP API surface

| Path | Method | Auth | Purpose |
| --- | --- | --- | --- |
| `/v1/healthz` | GET | No | Load balancer probe |
| `/v1` | POST | Bearer | Streamable HTTP MCP (JSON-RPC) |

Implementation lives in [`mcp/`](../mcp/). Catalog data is baked at image build time from `dist/manifest.json`, `dist/tokens.json`, `themes/*.css`, and `prototype/src/components/library/generated-props.json`.

## 6. Rollout checklist (operators)

1. Merge and let CI build `ghcr.io/samueldbines/bareframe/mcp`.
2. Create DNS **A** record `mcp.bareframe.dev` → ingress load balancer (same IP as `bareframe.org`; see deploy docs).
3. Create `bareframe-mcp-env` with `BAREFRAME_MCP_TOKENS`.
4. Deploy manifests (`kubectl apply -k deploy/k8s`) when ready — this PR adds the Deployment/Ingress but does not deploy by itself.
5. Verify: `curl -sf https://mcp.bareframe.dev/v1/healthz`.

## 7. Staying current

The hosted server version tracks the Bareframe release baked into the container. After library releases, rebuild and redeploy the MCP image so agents see new components and tokens.

For product background and future Designer write tools, see [`prototype/DESIGNER_SPEC.md`](../prototype/DESIGNER_SPEC.md) §7.
