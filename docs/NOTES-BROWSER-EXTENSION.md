# Browser extension design (future)

Bareframe project notes support a **capture API** for a Manifest V3 Chrome extension that logs UX issues while browsing a live site. The extension is not implemented yet; this document describes the intended contract.

## Goals

- Capture the current tab URL, optional viewport screenshot, and optional DOM selector for a clicked element.
- Attach a human-readable **Where** (area or page) and **Issue** (free text) per note.
- POST to Bareframe with the same project tokens used for MCP (`bf_proj_…`) or account tokens with project access.

## API

`POST /api/projects/:projectId/notes/capture`

Authentication: `Authorization: Bearer bf_proj_…` or `bf_acc_…` with `notes:write`. Screenshots require `assets:upload` or `projects:write`.

```json
{
  "where": "top navigation on root page",
  "issue": "Logo overlaps the menu",
  "pageUrl": "https://example.com/",
  "elementSelector": "nav.header > a.logo",
  "screenshot": "data:image/png;base64,..."
}
```

`issue` may be sent as `body` for compatibility with older clients.

Response: `{ "note": { ... } }` including `screenshotAssetId` when a screenshot was stored. Screenshots are saved as **project assets** (same storage as designer uploads).

## Extension architecture (MV3)

| Piece | Role |
| --- | --- |
| Service worker | Holds project id and token (from user onboarding), queues failed posts, rate limits |
| Content script | On "pick element" mode, records `elementSelector` from click target |
| Popup or side panel | Where/Issue fields, capture screenshot via `chrome.tabs.captureVisibleTab` |
| Options page | Bareframe API base URL, project id, paste token once |

## Capture flow

1. User opens extension on a tab they are reviewing.
2. Extension sets `pageUrl` from `tab.url` automatically.
3. User fills **Where** (prefilled from last note) and **Issue**.
4. Optional: toggle "Include screenshot" (PNG from visible tab, max 5 MB).
5. Optional: "Pick element" injects content script; next click sends a stable CSS path as `elementSelector`.
6. POST to `/notes/capture` with Bearer token.

## Security

- Tokens stay in `chrome.storage.session` or encrypted local storage; never in page context.
- Content script does not receive the token; only the service worker calls the API.
- Respect Bareframe SSRF and size limits on screenshots (base64 or raw PNG only, no arbitrary URLs in capture path).

## Relation to designer Notes panel

The designer **Notes** panel and bulk paste use the same Where/Issue fields. Extension captures appear in the panel numbered in creation order. Map pins still use optional `frameId` from the designer; extension notes typically use `pageUrl` and `where` instead.