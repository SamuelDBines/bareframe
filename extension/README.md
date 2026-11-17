# Bareframe Chrome extension (Manifest V3)

Record click-through journeys and capture UX notes into a Bareframe project.

## Features

- **Sign in**: paste a `bf_proj_` or `bf_acc_` token, choose API base URL, and pick a target project.
- **Record flow**: screenshots on each navigation (full load or SPA route change), click metadata, upload to `POST /api/projects/:id/capture/flow`.
- **Quick note**: Where/Issue fields, optional screenshot, optional element picker; posts to `POST /api/projects/:id/notes/capture`.
- **Privacy**: recording runs only after you click Start, shows a red on-tab badge, blurs inputs in screenshots, and never logs keystrokes.

## Develop

```bash
pnpm install
pnpm run extension:build
pnpm run extension:test
```

Load unpacked in Chrome:

1. Open `chrome://extensions` and enable **Developer mode**.
2. Click **Load unpacked** and choose `extension/dist` (after `pnpm run extension:build`).

## Build zip for sharing

```bash
pnpm run extension:zip
```

Creates `extension/bareframe-extension.zip`. CI copies this to `public/extension/` for download links in the app.

## Publish to Chrome Web Store

1. Bump `version` in `extension/src/manifest.json` and `extension/package.json`.
2. Run `pnpm run extension:zip`.
3. Upload `bareframe-extension.zip` in the [Chrome Web Store developer dashboard](https://chrome.google.com/webstore/devconsole).
4. Set visibility and submit for review. Link the listing URL from project **Extension setup** in the Bareframe app.

## Token scopes

Recommended project token scopes:

- `capture:write`
- `notes:write`
- `assets:upload`
- `projects:read`

Create a token from **Extension setup** in the app or project settings.