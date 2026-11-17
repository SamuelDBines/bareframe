import {
	auditPageMetrics,
	buildPageUrl,
	discoverRoutes,
	summarizeFindings,
	titleFromPath,
	VIEWPORT_SIZES,
	type AuditFinding,
	type PageLink,
	type ViewportPreset,
} from '@bareframe/flow-map-engine';
import type pg from 'pg';
import {
	applyImportScreenshots,
	applyProjectCommand,
	createDefaultCommandContext,
	type ImportScreenshotLink,
	type ImportScreenshotShot,
	type ProjectDocument,
} from '@bareframe/designer-core';
import { isValidComponentSlug } from '../catalog/components.js';
import { type BrowserCapture } from '../render/playwright-capture.js';
import { isAllowedPublicUrl } from '../render/ssrf.js';

export type WebsiteImportProgress = {
	done: number;
	total: number;
	current?: string;
};

export type WebsiteScreenshotImportInput = {
	startUrl: string;
	projectId: string;
	baseVersion: number;
	document: ProjectDocument;
	maxPages?: number;
	viewports?: ViewportPreset[];
	seedRoutes?: string[];
	auditRules?: Record<string, unknown>;
	canvasName?: string;
	onProgress?: (p: WebsiteImportProgress) => void | Promise<void>;
};

export type WebsiteScreenshotImportResult = {
	document: ProjectDocument;
	version: number;
	pageId: string;
	pageCount: number;
	findings: AuditFinding[];
	findingsSummary: string;
	failedRoutes: { routePath: string; error: string }[];
};

export async function runWebsiteScreenshotImport(
	pool: pg.Pool,
	input: WebsiteScreenshotImportInput,
	capture: BrowserCapture,
): Promise<WebsiteScreenshotImportResult> {
	const startUrl = input.startUrl.trim();
	if (!startUrl) throw new Error('url is required');
	if (!isAllowedPublicUrl(startUrl)) throw new Error('URL not allowed');

	const viewports: ViewportPreset[] = input.viewports?.length ? input.viewports : ['mobile'];
	const maxPages = input.maxPages ?? 20;
	const origin = new URL(startUrl).origin;

	const routes = await discoverRoutes({
		startUrl,
		seedRoutes: input.seedRoutes,
		maxPages,
		fetchHtml: async (url) => {
			if (!isAllowedPublicUrl(url)) throw new Error('Blocked URL during crawl');
			const res = await fetch(url, { redirect: 'follow' });
			return res.text();
		},
		fetchSitemap: async (o) => {
			try {
				const res = await fetch(`${o}/sitemap.xml`, { redirect: 'follow' });
				if (!res.ok) return null;
				return res.text();
			} catch {
				return null;
			}
		},
	});

	const ctx = createDefaultCommandContext(isValidComponentSlug);
	let document = input.document;
	const canvasLabel = input.canvasName ?? `Website: ${new URL(startUrl).hostname}`;
	const canvasRes = applyProjectCommand(
		document,
		{ type: 'create_canvas', name: canvasLabel, presetId: 'mobile' },
		ctx,
	);
	document = canvasRes.document;
	const pageId = canvasRes.effects.pageId as string;

	const allFindings: AuditFinding[] = [];
	const shots: ImportScreenshotShot[] = [];
	const links: PageLink[] = [];
	const pathImported = new Set<string>();
	const failedRoutes: { routePath: string; error: string }[] = [];
	const viewport = viewports[0] ?? 'mobile';
	const vp = VIEWPORT_SIZES[viewport];

	for (let i = 0; i < routes.length; i++) {
		const route = routes[i]!;
		const pageUrl = buildPageUrl(origin, route.path);
		await input.onProgress?.({ done: i, total: routes.length, current: pageUrl });
		try {
			const captured = await capture(pool, input.projectId, pageUrl, vp.width, vp.height);
			const title = captured.metrics.title?.trim() || titleFromPath(route.path);
			shots.push({
				routePath: route.path,
				assetId: captured.assetId,
				title,
				url: pageUrl,
			});
			pathImported.add(route.path);
			allFindings.push(...auditPageMetrics(captured.metrics, input.auditRules ?? {}));
			for (const link of captured.outboundLinks) {
				links.push({
					fromPath: route.path,
					toPath: link.path,
					label: link.label,
					trigger: link.trigger,
				});
			}
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Screenshot failed';
			failedRoutes.push({ routePath: route.path, error: message });
			shots.push({
				routePath: route.path,
				error: `Screenshot failed: ${message}`,
				title: titleFromPath(route.path),
				url: pageUrl,
			});
		}
	}
	await input.onProgress?.({ done: routes.length, total: routes.length });

	const importLinks: ImportScreenshotLink[] = links
		.filter((l) => l.fromPath !== l.toPath && pathImported.has(l.fromPath) && pathImported.has(l.toPath))
		.map((l) => ({
			fromRoutePath: l.fromPath,
			toRoutePath: l.toPath,
			label: l.label,
			trigger: l.trigger,
		}));

	const imported = applyImportScreenshots(document, shots, importLinks, ctx, { pageId });
	document = imported.document;

	const summary = summarizeFindings(allFindings);
	const frameIds = (imported.effects.frameIds as string[]) ?? [];
	const summaryFrameId = frameIds[0];
	if (summaryFrameId) {
		const ann = applyProjectCommand(
			document,
			{
				type: 'add_annotation',
				frameId: summaryFrameId,
				kind: 'note',
				target: { kind: 'rect', x: 16, y: 16, w: 320, h: 80 },
				text: summary,
			},
			ctx,
		);
		document = ann.document;
	}

	for (const f of allFindings) {
		const shotIndex = shots.findIndex((s) => s.url === f.pageUrl);
		const frameId = frameIds[shotIndex];
		if (!frameId) continue;
		const ann = applyProjectCommand(
			document,
			{
				type: 'add_annotation',
				frameId,
				kind: 'callout',
				target: { kind: 'rect', x: 12, y: 48, w: 280, h: 40 },
				text: f.message,
			},
			ctx,
		);
		document = ann.document;
	}

	return {
		document,
		version: input.baseVersion + 1,
		pageId,
		pageCount: routes.length,
		findings: allFindings,
		findingsSummary: summary,
		failedRoutes,
	};
}