import { routeKeyFromUrl } from '@bareframe/flow-map-engine';
import type { ImportScreenshotLink, ImportScreenshotShot } from '@bareframe/designer-core';
import type { CaptureLink, CaptureShot } from './event-mapping.js';

export function routePathFromUrl(url: string, index = 0): string {
	try {
		const u = new URL(url);
		return routeKeyFromUrl(u, u.origin) ?? (u.pathname || '/');
	} catch {
		return `/captured/${index}`;
	}
}

export function mapCaptureShotsToImport(
	shots: CaptureShot[],
	links: CaptureLink[],
): { shots: ImportScreenshotShot[]; links: ImportScreenshotLink[] } {
	const assetToRoute = new Map<string, string>();
	const importShots: ImportScreenshotShot[] = shots.map((s, i) => {
		const routePath = routePathFromUrl(s.url, i);
		assetToRoute.set(s.assetId, routePath);
		return {
			routePath,
			assetId: s.assetId,
			title: s.title,
			url: s.url,
		};
	});
	const importLinks: ImportScreenshotLink[] = [];
	for (const link of links) {
		const fromRoutePath = assetToRoute.get(link.fromAssetId);
		const toRoutePath = assetToRoute.get(link.toAssetId);
		if (!fromRoutePath || !toRoutePath) continue;
		importLinks.push({
			fromRoutePath,
			toRoutePath,
			label: link.label,
			trigger: link.trigger,
		});
	}
	return { shots: importShots, links: importLinks };
}