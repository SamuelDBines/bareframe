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
		'async',
	]
		.filter(Boolean)
		.join('\n  ');
	return `<script\n  ${attrs}\n></script>`;
}
