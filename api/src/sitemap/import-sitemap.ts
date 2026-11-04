import type pg from 'pg';
import {
	applyProjectCommand,
	createDefaultCommandContext,
	layoutFramesInFlowRow,
	type ProjectDocument,
} from '@bareframe/designer-core';
import {
	parentPathEdges,
	resolveSitemapPaths,
	titleFromPath,
	extractLinks,
} from '@bareframe/flow-map-engine';
import { isValidComponentSlug } from '../catalog/components.js';
import {
	assertProjectAccess,
	getProjectById,
	replaceProjectDocument,
	type AuthActor,
} from '../db/projects.js';
import { assertScreenCountForUser } from '../plans/limits.js';
import { assertResolvedPublicHost, isAllowedPublicUrl } from '../render/ssrf.js';

const MAX_CRAWL_PAGES = 12;
const MAX_SITEMAP_URLS = 80;

async function fetchPublicHtml(url: string): Promise<string> {
	if (!isAllowedPublicUrl(url)) throw new Error('URL not allowed');
	await assertResolvedPublicHost(url);
	const res = await fetch(url, {
		redirect: 'follow',
		headers: { 'User-Agent': 'BareframeSitemapImport/1.0' },
		signal: AbortSignal.timeout(15_000),
	});
	if (!res.ok) throw new Error(`Could not fetch ${url}`);
	const text = await res.text();
	if (text.length > 2 * 1024 * 1024) throw new Error('Page too large');
	return text;
}

function extractTitle(html: string): string | null {
	const m = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
	if (!m) return null;
	return m[1]!.replace(/\s+/g, ' ').trim().slice(0, 120) || null;
}

export type SitemapImportResult = {
	version: number;
	pageId: string;
	routeCount: number;
	connectorCount: number;
	sourceUrl: string;
};

export async function importSitemapIntoProject(
	pool: pg.Pool,
	projectId: string,
	userId: number,
	baseVersion: number,
	rawUrl: string,
): Promise<SitemapImportResult> {
	const startUrl = rawUrl.trim();
	if (!startUrl) throw new Error('url required');
	if (!isAllowedPublicUrl(startUrl)) throw new Error('URL not allowed');
	await assertResolvedPublicHost(startUrl);

	const origin = new URL(startUrl).origin;
	const paths = await resolveSitemapPaths({
		startUrl,
		maxUrls: MAX_SITEMAP_URLS,
		fetchText: fetchPublicHtml,
	});

	const pathSet = new Set(paths);
	const crawlBudget = Math.min(MAX_CRAWL_PAGES, MAX_SITEMAP_URLS - paths.length);
	if (crawlBudget > 0 && paths.length) {
		const sample = paths.slice(0, MAX_CRAWL_PAGES);
		for (const path of sample) {
			if (pathSet.size >= MAX_SITEMAP_URLS) break;
			const pageUrl = `${origin}${path === '/' ? '' : path}`;
			let html: string;
			try {
				html = await fetchPublicHtml(pageUrl);
			} catch {
				continue;
			}
			for (const link of extractLinks(html, origin)) {
				if (pathSet.has(link.href)) continue;
				pathSet.add(link.href);
				paths.push(link.href);
				if (pathSet.size >= MAX_SITEMAP_URLS) break;
			}
		}
	}

	const titles = new Map<string, string>();
	for (const path of paths.slice(0, 8)) {
		const pageUrl = `${origin}${path === '/' ? '' : path}`;
		try {
			const html = await fetchPublicHtml(pageUrl);
			titles.set(path, extractTitle(html) ?? titleFromPath(path));
		} catch {
			titles.set(path, titleFromPath(path));
		}
	}
	for (const path of paths) {
		if (!titles.has(path)) titles.set(path, titleFromPath(path));
	}

	const project = await getProjectById(pool, projectId);
	if (!project) throw new Error('Project not found');
	if (project.version !== baseVersion) {
		throw new Error(`Version conflict (current ${project.version})`);
	}

	const ctx = createDefaultCommandContext(isValidComponentSlug);
	let document = project.document as ProjectDocument;
	const hostname = new URL(startUrl).hostname;
	const canvasRes = applyProjectCommand(
		document,
		{ type: 'create_canvas', name: `Sitemap: ${hostname}`, presetId: 'mobile' },
		ctx,
	);
	document = canvasRes.document;
	const pageId = canvasRes.effects.pageId as string;

	const pathToFrame = new Map<string, string>();
	const newFrames = [];
	for (const path of paths) {
		const res = applyProjectCommand(
			document,
			{
				type: 'add_frame',
				pageId,
				name: titles.get(path) ?? titleFromPath(path),
				presetId: 'mobile',
			},
			ctx,
		);
		document = res.document;
		const frameId = res.effects.frameId as string;
		pathToFrame.set(path === '' ? '/' : path, frameId);
		const frame = document.project.frames.find((f) => f.id === frameId);
		if (frame) newFrames.push(frame);
	}
	layoutFramesInFlowRow(newFrames);

	let connectorCount = 0;
	for (const edge of parentPathEdges([...pathToFrame.keys()])) {
		const from = pathToFrame.get(edge.from);
		const to = pathToFrame.get(edge.to);
		if (!from || !to) continue;
		const res = applyProjectCommand(
			document,
			{
				type: 'add_connector',
				fromFrameId: from,
				toFrameId: to,
				label: 'Section',
				trigger: 'navigate',
			},
			ctx,
		);
		document = res.document;
		connectorCount += 1;
	}

	await assertScreenCountForUser(pool, userId, document);
	const version = await replaceProjectDocument(pool, projectId, userId, document, baseVersion);

	return {
		version,
		pageId,
		routeCount: paths.length,
		connectorCount,
		sourceUrl: startUrl,
	};
}
