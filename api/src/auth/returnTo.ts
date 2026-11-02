/** Allow same-origin relative paths (incl. hash routes) and Designer absolute return URLs. */
export function isSafeReturnTo(returnTo: string, designerPublicUrl?: string): boolean {
	if (returnTo.startsWith('https://')) {
		if (!designerPublicUrl) return false;
		try {
			const target = new URL(returnTo);
			const allowed = new URL(designerPublicUrl);
			return target.origin === allowed.origin && !returnTo.includes('\0');
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
): string {
	if (!raw || !isSafeReturnTo(raw, designerPublicUrl)) return '/';
	return raw;
}

export function resolvePostAuthRedirect(publicUrl: string, returnTo: string): string {
	if (returnTo.startsWith('https://')) return returnTo;
	return `${publicUrl}${returnTo}`;
}
