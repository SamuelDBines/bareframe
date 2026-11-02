# @bareframe/mcp-server

Public **Model Context Protocol** server for Bareframe — served at **`https://bareframe.org/mcp`** on the main site ingress (namespace `bareframe`).

- **Health:** `https://bareframe.org/mcp/healthz`
- **Migration guide (Repkit → React):** [`docs/MIGRATING-TO-BAREFRAME-REACT.md`](../docs/MIGRATING-TO-BAREFRAME-REACT.md)

No authentication on the public endpoint. Per-IP rate limits apply (`BAREFRAME_MCP_RATE_MAX` / `BAREFRAME_MCP_RATE_WINDOW_MS`).

## Studio (authenticated writes)

- **Endpoint:** `https://bareframe.org/mcp/studio`
- **Auth:** `Authorization: Bearer bf_proj_…` (project token from Designer → Project settings)
- **Backend:** proxies to `@bareframe/api` project routes (`BAREFRAME_API_URL` in the MCP deployment)
- **Rate limit:** per token (`BAREFRAME_MCP_STUDIO_RATE_MAX`, default 120/min)

Studio tools: `list_projects`, `get_project`, `create_canvas`, `add_screen`, `add_component`, `add_connector`, `add_annotation`, `update_node`, `delete_node`, `import_screenshots`, `get_upload_url`, `create_flow_map`, `screenshot_url`, `render_frame`, `list_recordings`, `build_flow_from_recording`.

## Public read tools

| Tool | Description |
| --- | --- |
| `list_components` | Stability, description, category, React export, compact props summaries |
| `get_component` | Props + real docs `.example.tsx` sources |
| `list_themes` | Theme ids and `@bareframe/react/themes/*` imports |
| `get_design_tokens` | Structured tokens (colors, spacing, typography, radii, shadows) per theme |
| `scaffold_screen` | Working `@bareframe/react` page TSX from intent and/or component slugs |
| `export_tokens` | Legacy flat `tokens.json` / per-theme maps (prefer `get_design_tokens`) |
| `search_docs` | Search markdown + component reference text |
| `get_install_steps` | @bareframe/react install/CSS steps |
| `get_migration_guide` | Full Repkit → Bareframe migration markdown |

## Development

```bash
pnpm run build:lib
pnpm run generate:component-props
cd mcp && npm ci && npm run build && npm test
npm start
# curl -sf http://127.0.0.1:8080/mcp/healthz
```

## Environment

| Variable | Default | Description |
| --- | --- | --- |
| `BAREFRAME_MCP_BASE_PATH` | `/mcp` | HTTP prefix |
| `BAREFRAME_MCP_ALLOWED_HOSTS` | `bareframe.org,…` | Host header allow list |
| `BAREFRAME_MCP_RATE_MAX` | `120` | Requests per IP per window |
| `BAREFRAME_MCP_RATE_WINDOW_MS` | `60000` | Rate limit window |
| `PORT` | `8080` | Listen port |
