export function normalizeOrigin(raw: string): string | null {
	try {
		const u = new URL(raw.trim());
		if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
		return u.origin.toLowerCase();
	} catch {
		return null;
	}
}

export function hostMatchesOrigin(url: string, allowedOrigin: string): boolean {
	try {
		const u = new URL(url.trim());
		const eventOrigin = u.origin.toLowerCase();
		const allowed = allowedOrigin.toLowerCase();
		if (eventOrigin === allowed) return true;
		const allowedHost = new URL(allowed).hostname.replace(/^www\./, '');
		const eventHost = u.hostname.replace(/^www\./, '');
		return eventHost === allowedHost;
	} catch {
		return false;
	}
}

export function eventUrlAllowed(url: string, allowedOrigins: string[]): boolean {
	if (!allowedOrigins.length) return true;
	return allowedOrigins.some((o) => hostMatchesOrigin(url, o));
}
