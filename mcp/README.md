# @bareframe/mcp-server

Hosted **Model Context Protocol** server for Bareframe component docs, React props, themes, and design tokens.

- **Production URL:** `https://mcp.bareframe.dev/v1` (Streamable HTTP)
- **Migration guide:** [`docs/MCP-MIGRATION.md`](../docs/MCP-MIGRATION.md)

## Tools

| Tool | Scope | Description |
| --- | --- | --- |
| `list_components` | `components:read` | Slugs, categories, stability, React export |
| `get_component` | `components:read` | Props + usage snippet for one slug |
| `list_themes` | `themes:read` | Theme ids and CSS variable bundles |
| `export_tokens` | `themes:read` | Token manifest or per-theme values |

## Development

From the repo root (requires built `dist/` and generated props):

```bash
pnpm run build:lib
pnpm run generate:component-props
cd mcp && npm ci && npm run build && npm test
BAREFRAME_MCP_TOKENS='[{"id":"dev","token":"dev","scopes":["components:read","themes:read"]}]' npm start
```

Health check: `curl -sf http://127.0.0.1:8080/v1/healthz`

## Container

```bash
docker build -f mcp/Dockerfile -t bareframe-mcp:local .
```

Environment:

| Variable | Description |
| --- | --- |
| `BAREFRAME_MCP_TOKENS` | JSON array of `{ id, token, scopes[] }` |
| `BAREFRAME_MCP_BASE_PATH` | Default `/v1` |
| `BAREFRAME_MCP_ALLOWED_HOSTS` | Comma-separated Host header allow list |
| `PORT` | Default `8080` |
