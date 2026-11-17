const HASH_APP_PREFIXES = ['/app', '/sign-in', '/sign-up', '/demo', '/share', '/designer'];

/** Allow same-origin relative paths (incl. hash routes) and Designer absolute return URLs. */
export function isSafeReturnTo(returnTo: string, designerPublicUrl?: string, publicUrl?: string): boolean {
	if (returnTo.startsWith('https://')) {
		const allowedOrigins = new Set<string>();
		if (designerPublicUrl) {
			try {
				allowedOrigins.add(new URL(designerPublicUrl).origin);
			} catch {
				/* ignore */
			}
		}
		if (publicUrl) {
			try {
				allowedOrigins.add(new URL(publicUrl).origin);
			} catch {
				/* ignore */
			}
		}
		if (allowedOrigins.size === 0) return false;
		try {
			const target = new URL(returnTo);
			return allowedOrigins.has(target.origin) && !returnTo.includes('\0');
		} catch {
			return false;
		}
	}
	if (!returnTo.startsWith('/')) return false;
	if (returnTo.startsWith('//')) return false;
	if (returnTo.includes('://')) return false;
	if (returnTo.startsWith('/api')) return false;
	if (returnTo.includes('\0')) return false;
	return true;
}

export function normalizeReturnTo(
	raw: string | undefined | null,
	designerPublicUrl?: string,
	publicUrl?: string,
): string {
	if (!raw || !isSafeReturnTo(raw, designerPublicUrl, publicUrl)) return '/';
	return raw;
}

/** Hash-router paths must land on `/#/...` so the SPA can boot. */
export function resolvePostAuthRedirect(publicUrl: string, returnTo: string): string {
	if (returnTo.startsWith('https://')) return returnTo;
	const base = publicUrl.replace(/\/$/, '');
	if (returnTo.startsWith('/#/')) return `${base}${returnTo}`;
	const needsHash =
		returnTo.startsWith('/app') ||
		returnTo.startsWith('/sign-') ||
		returnTo.startsWith('/demo') ||
		returnTo.startsWith('/share') ||
		(returnTo.startsWith('/designer') && returnTo !== '/designer');
	if (needsHash) {
		const path = returnTo.startsWith('/designer') ? returnTo.replace(/^\/designer/, '/app') || '/app' : returnTo;
		return `${base}/#${path.startsWith('/') ? path : `/${path}`}`;
	}
	if (HASH_APP_PREFIXES.some((p) => returnTo === p || returnTo.startsWith(`${p}/`))) {
		return `${base}/#${returnTo}`;
	}
	return `${base}${returnTo}`;
}