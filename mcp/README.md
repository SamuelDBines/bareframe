# @bareframe/mcp-server

Public **Model Context Protocol** server for Bareframe — served at **`https://bareframe.org/mcp`** on the main site ingress (namespace `bareframe`).

- **Health:** `https://bareframe.org/mcp/healthz`
- **Migration guide (Repkit → React):** [`docs/MIGRATING-TO-BAREFRAME-REACT.md`](../docs/MIGRATING-TO-BAREFRAME-REACT.md)

No authentication. Per-IP rate limits apply (`BAREFRAME_MCP_RATE_MAX` / `BAREFRAME_MCP_RATE_WINDOW_MS`).

## Tools

| Tool | Description |
| --- | --- |
| `list_components` | Slugs, categories, stability, React export |
| `get_component` | Props + real docs `.example.tsx` sources |
| `list_themes` | Theme ids and `@bareframe/react/themes/*` imports |
| `export_tokens` | `tokens.json` or per-theme values |
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
