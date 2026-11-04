import { normalizePath } from './discover-routes.js';

export const MAX_SITEMAP_BYTES = 2 * 1024 * 1024;

export function parseSitemapLocs(xml: string, origin: string, limit: number): string[] {
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

export function parseSitemapIndexLocs(xml: string): string[] {
	const urls: string[] = [];
	const re = /<loc>([^<]+)<\/loc>/gi;
	let m: RegExpExecArray | null;
	while ((m = re.exec(xml))) {
		const loc = m[1]?.trim();
		if (loc) urls.push(loc);
	}
	return urls;
}

export function isSitemapIndexXml(xml: string): boolean {
	return /<sitemapindex[\s>]/i.test(xml);
}

export function titleFromPath(path: string): string {
	if (path === '/' || path === '') return 'Home';
	const segment = path.split('/').filter(Boolean).pop();
	if (!segment) return path;
	return decodeURIComponent(segment).replace(/[-_]/g, ' ');
}

export function parentPath(path: string): string | null {
	const normalized = path === '' ? '/' : path;
	if (normalized === '/') return null;
	const parts = normalized.split('/').filter(Boolean);
	if (parts.length <= 1) return '/';
	return `/${parts.slice(0, -1).join('/')}`;
}

export type ResolveSitemapInput = {
	startUrl: string;
	maxUrls: number;
	fetchText: (url: string) => Promise<string>;
};

export async function resolveSitemapPaths(input: ResolveSitemapInput): Promise<string[]> {
	const start = new URL(input.startUrl);
	const origin = start.origin;
	const max = Math.max(1, Math.min(input.maxUrls, 200));
	const seen = new Set<string>();
	const out: string[] = [];

	function add(path: string) {
		const normalized = path === '' ? '/' : path;
		if (seen.has(normalized)) return;
		seen.add(normalized);
		out.push(normalized);
	}

	async function loadSitemap(url: string, depth: number): Promise<void> {
		if (out.length >= max || depth > 3) return;
		let xml: string;
		try {
			xml = await input.fetchText(url);
		} catch {
			return;
		}
		if (xml.length > MAX_SITEMAP_BYTES) return;

		if (isSitemapIndexXml(xml)) {
			for (const childUrl of parseSitemapIndexLocs(xml)) {
				if (out.length >= max) break;
				try {
					const childOrigin = new URL(childUrl).origin;
					if (childOrigin !== origin) continue;
				} catch {
					continue;
				}
				await loadSitemap(childUrl, depth + 1);
			}
			return;
		}

		for (const p of parseSitemapLocs(xml, origin, max - out.length)) {
			add(p);
			if (out.length >= max) return;
		}
	}

	const explicitSitemap = start.pathname.endsWith('.xml');
	if (explicitSitemap) {
		await loadSitemap(start.href, 0);
	} else {
		try {
			const robots = await input.fetchText(`${origin}/robots.txt`);
			const sitemapLines = robots
				.split('\n')
				.map((l) => l.trim())
				.filter((l) => /^sitemap:/i.test(l));
			if (sitemapLines.length) {
				for (const line of sitemapLines) {
					const smUrl = line.replace(/^sitemap:\s*/i, '').trim();
					if (!smUrl) continue;
					try {
						if (new URL(smUrl).origin !== origin) continue;
					} catch {
						continue;
					}
					await loadSitemap(smUrl, 0);
					if (out.length >= max) break;
				}
			}
		} catch {
			/* ignore missing robots.txt */
		}
		if (!out.length) {
			await loadSitemap(`${origin}/sitemap.xml`, 0);
		}
	}

	if (!out.length) {
		add(start.pathname || '/');
	}

	return out.slice(0, max);
}

export function parentPathEdges(paths: string[]): { from: string; to: string }[] {
	const set = new Set(paths.map((p) => (p === '' ? '/' : p)));
	const edges: { from: string; to: string }[] = [];
	for (const path of set) {
		const parent = parentPath(path);
		if (parent && set.has(parent) && parent !== path) {
			edges.push({ from: parent, to: path });
		}
	}
	return edges;
}
