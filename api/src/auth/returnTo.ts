/** Allow only same-origin relative paths (incl. hash routes like /#/designer). */
export function isSafeReturnTo(returnTo: string): boolean {
	if (!returnTo.startsWith('/')) return false;
	if (returnTo.startsWith('//')) return false;
	if (returnTo.includes('://')) return false;
	if (returnTo.startsWith('/api')) return false;
	if (returnTo.includes('\0')) return false;
	return true;
}

export function normalizeReturnTo(raw: string | undefined | null): string {
	if (!raw || !isSafeReturnTo(raw)) return '/';
	return raw;
}
