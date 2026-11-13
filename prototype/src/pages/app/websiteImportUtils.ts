export function looksLikeWebsiteUrl(raw: string): boolean {
	const trimmed = raw.trim();
	if (!trimmed) return false;
	try {
		const u = new URL(trimmed);
		return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
	} catch {
		return false;
	}
}

export function websiteHostname(raw: string): string {
	try {
		return new URL(raw.trim()).hostname;
	} catch {
		return 'Website';
	}
}

export function buildCaptureSnippet(opts: {
	origin: string;
	token: string;
	endpoint: string;
	screenshots: boolean;
}) {
	const attrs = [
		`src="${opts.origin}/bareframe-capture.js"`,
		`data-token="${opts.token}"`,
		`data-endpoint="${opts.endpoint}"`,
		opts.screenshots ? `data-screenshots="1"` : '',
		`data-redact="1"`,
		`data-consent-required="1"`,
		`data-retention-days="90"`,
		'async',
	]
		.filter(Boolean)
		.join('\n  ');
	const consentHint = `<!-- Call Bareframe.consent(true) after your CMP grants analytics/telemetry, or set data-consent="granted" when appropriate for internal/staging builds. -->`;
	return `${consentHint}\n<script\n  ${attrs}\n></script>`;
}

export function buildPrivacyNoticeSnippet(hostname: string): string {
	return [
		`Privacy notice (summary — not legal advice):`,
		`Your organisation is the data controller for visitors on ${hostname}. Bareframe acts as a processor for capture data you send.`,
		`Installed capture records: page URL, document title, viewport size, optional masked screenshots, and link navigation (no keystrokes, passwords, or payment fields).`,
		`Form field values are masked client-side before upload; mark sensitive UI with data-bareframe-mask.`,
		`The script waits for Bareframe.consent(true) (or your CMP) and honours Do Not Track / Global Privacy Control.`,
		`No third-party cookies; pseudonymous session id in first-party sessionStorage only; default retention 90 days (configurable).`,
		`EU/UK: confirm data location and DPA with Bareframe before production capture.`,
		`Recommendation: pilot on staging or logged-in internal users first.`,
	].join('\n');
}
