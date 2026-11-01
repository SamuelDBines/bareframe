import type { DiscoveredRoute } from './types.js';
declare function normalizePath(href: string, origin: string): string | null;
declare function extractLinks(html: string, origin: string): {
    href: string;
    text: string;
}[];
export type DiscoverRoutesInput = {
    startUrl: string;
    seedRoutes?: string[];
    maxPages: number;
    fetchHtml: (url: string) => Promise<string>;
    fetchSitemap?: (origin: string) => Promise<string | null>;
};
export declare function discoverRoutes(input: DiscoverRoutesInput): Promise<DiscoveredRoute[]>;
export { extractLinks, normalizePath };
