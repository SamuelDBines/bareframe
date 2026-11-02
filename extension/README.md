# Bareframe Record flow (Chrome MV3)

Record click-through journeys and upload them to a Bareframe project canvas.

## Setup

1. Open `chrome://extensions`, enable Developer mode, **Load unpacked**, select this `extension/` folder.
2. In Designer → **Project settings**, create a token with scopes including `recordings:upload` (and `projects:write` if you want automatic canvas build).
3. In the extension popup, paste the token (`bf_proj_…`), API base URL, and project UUID.

## Usage

- **Record** — starts capture on the active tab (red badge). Inputs are blurred before each screenshot.
- **Pause / Stop** — Stop opens step review; uncheck steps to exclude before upload.
- **Upload journey** — POSTs steps to `POST /api/projects/:id/recordings` with `build: true`.

Host permissions should be narrowed to your allow-listed domains in production builds.
