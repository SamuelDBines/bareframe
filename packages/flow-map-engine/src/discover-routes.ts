import type { DiscoveredRoute } from './types.js';
import { buildPageUrl, routeKeyFromUrl } from './page-url.js';

function normalizePath(href: string, origin: string): string | null {
	try {
		const u = new URL(href, origin);
		return routeKeyFromUrl(u, origin);
	} catch {
		return null;
	}
}

function parseSitemapLocs(xml: string, origin: string, limit: number): string[] {
	const paths: string[] = [];
	const re = /<loc>([^<]+)<\/loc>/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(xml)) && paths.length < limit) {
		const loc = m[1]?.trim();
		if (!loc) continue;
		const p = normalizePath(loc, origin);
		if (p) paths.push(p);
	}
	return paths;
}

function extractLinks(html: string, origin: string): { href: string; text: string }[] {
	const links: { href: string; text: string }[] = [];
	const re = /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(html))) {
		const href = m[1]?.trim();
		if (!href || href.startsWith('mailto:') || href.startsWith('javascript:')) continue;
		if (href === '#' || href.startsWith('#') && !href.startsWith('#/')) continue;
		const text = m[2]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || href;
		const path = normalizePath(href, origin);
		if (path) links.push({ href: path, text });
	}
	return links;
}

export type DiscoverRoutesInput = {
	startUrl: string;
	seedRoutes?: string[];
	maxPages: number;
	fetchHtml: (url: string) => Promise<string>;
	fetchSitemap?: (origin: string) => Promise<string | null>;
};

export async function discoverRoutes(input: DiscoverRoutesInput): Promise<DiscoveredRoute[]> {
	const start = new URL(input.startUrl);
	const origin = start.origin;
	const max = Math.max(1, Math.min(input.maxPages, 50));
	const seen = new Set<string>();
	const out: DiscoveredRoute[] = [];

	function add(path: string, source: DiscoveredRoute['source']) {
		const normalized = path === '' ? '/' : path;
		if (seen.has(normalized)) return;
		seen.add(normalized);
		out.push({ path: normalized, source });
	}

	for (const r of input.seedRoutes ?? []) {
		const key = r.startsWith('/') ? r : `/${r}`;
		add(key, 'seed');
	}
	const startKey = routeKeyFromUrl(start, origin);
	add(startKey ?? (start.pathname || '/'), 'seed');

	if (input.fetchSitemap) {
		const xml = await input.fetchSitemap(origin);
		if (xml) {
			for (const p of parseSitemapLocs(xml, origin, max)) {
				add(p, 'sitemap');
				if (out.length >= max) return out;
			}
		}
	}

	const queue = [...out.map((r) => r.path)];
	while (queue.length && out.length < max) {
		const path = queue.shift()!;
		const url = buildPageUrl(origin, path);
		let html: string;
		try {
			html = await input.fetchHtml(url);
		} catch {
			continue;
		}
		for (const link of extractLinks(html, origin)) {
			if (seen.has(link.href)) continue;
			add(link.href, 'crawl');
			queue.push(link.href);
			if (out.length >= max) break;
		}
	}

	return out.slice(0, max);
}

export { extractLinks, normalizePath, buildPageUrl, routeKeyFromUrl };