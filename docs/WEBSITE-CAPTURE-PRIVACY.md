# Website capture — privacy & GDPR-oriented defaults

This document describes how Bareframe’s **installed capture** script is designed to minimise personal data. It is **not legal advice**. Your organisation remains the **data controller** for visitors on your site; Bareframe typically acts as a **processor** when you use bareframe.org cloud capture.

## What is collected (after consent)

| Data | Collected | Notes |
|------|-----------|--------|
| Page URL & title | Yes | Bound to token allowlisted origin |
| Viewport size | Yes | For layout on the flow map |
| Link / SPA navigation | Yes | No keystroke logging |
| Optional screenshot | Opt-in | JPEG; masking applied in the browser before upload |
| Form field values | **No** | Masked / cleared client-side; not sent in events |
| Passwords / payment fields | **No** | Selectors excluded; never in payload |
| IP address (visitor) | Not stored by script | Ingest may see IP at edge — truncated / not retained per infra policy |

## Defaults in `bareframe-capture.js`

- **Consent gate** — script does nothing until `Bareframe.consent(true)` (or `data-consent="granted"` for staging).
- **DNT / GPC** — script does not load when Do Not Track or Global Privacy Control is set.
- **Redaction** — all `input`, `textarea`, `select`, `[data-bareframe-mask]`, and common PII patterns in visible text before screenshots.
- **No third-party cookies** — pseudonymous `sessionId` in first-party `sessionStorage` only.
- **Retention** — `data-retention-days` (default **90**); local expiry hint in `sessionStorage`.
- **Data location** — EU/UK processing when using bareframe.org; confirm DPA for your account.

## Integrating consent

```html
<!-- After your CMP grants analytics / product-improvement telemetry: -->
<script>
  window.Bareframe?.consent(true);
</script>
```

Mark sensitive UI: `data-bareframe-mask` on containers that must never appear in screenshots.

## Recommendations

1. Pilot on **staging** or **internal authenticated users** before production traffic.
2. Update your privacy notice to mention navigation telemetry and optional screenshots.
3. Execute a **DPA** with Bareframe when processing EU/UK personal data in production.

## GitHub install PR

Listing repositories uses GitHub OAuth with **`repo`** read scope (your repos only). Opening a pull request requires the **Bareframe GitHub App** with `contents:write` and `pull_requests:write` on the target repository.
