import { describe, expect, it } from 'vitest';
import { parseSitemapLocs, parentPathEdges, resolveSitemapPaths, titleFromPath } from '../src/sitemap.js';

describe('sitemap helpers', () => {
	it('parses urlset locs on same origin', () => {
		const xml = `<?xml version="1.0"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc></url>
  <url><loc>https://example.com/about</loc></url>
  <url><loc>https://other.test/nope</loc></url>
</urlset>`;
		expect(parseSitemapLocs(xml, 'https://example.com', 10)).toEqual(['/', '/about']);
	});

	it('builds parent path connectors', () => {
		expect(parentPathEdges(['/', '/products', '/products/item'])).toEqual([
			{ from: '/', to: '/products' },
			{ from: '/products', to: '/products/item' },
		]);
	});

	it('titles paths from last segment', () => {
		expect(titleFromPath('/checkout/confirm-order')).toBe('confirm order');
	});

	it('follows sitemap index', async () => {
		const fetches: Record<string, string> = {
			'https://shop.test/sitemap.xml': `<?xml version="1.0"?><sitemapindex>
<sitemap><loc>https://shop.test/sitemap-pages.xml</loc></sitemap>
</sitemapindex>`,
			'https://shop.test/sitemap-pages.xml': `<?xml version="1.0"?><urlset>
<url><loc>https://shop.test/</loc></url>
<url><loc>https://shop.test/cart</loc></url>
</urlset>`,
		};
		const paths = await resolveSitemapPaths({
			startUrl: 'https://shop.test/',
			maxUrls: 10,
			fetchText: async (url) => fetches[url] ?? '',
		});
		expect(paths.sort()).toEqual(['/', '/cart']);
	});
});
