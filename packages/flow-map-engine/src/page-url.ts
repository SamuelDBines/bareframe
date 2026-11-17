/** Route key used in crawl graphs (pathname or `/#/…` hash route). */
export function routeKeyFromUrl(url: URL, origin: string): string | null {
	if (url.origin !== origin) return null;
	if (url.hash.startsWith('#/')) {
		return `/${url.hash}`;
	}
	const path = url.pathname || '/';
	return path.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
}

export function buildPageUrl(origin: string, routePath: string): string {
	if (routePath.startsWith('/#')) {
		return `${origin}${routePath}`;
	}
	return `${origin}${routePath === '/' ? '' : routePath}`;
}