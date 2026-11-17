import type pg from 'pg';
import type { ProjectDocument } from '@bareframe/designer-core';
import {
	assertProjectAccess,
	getProjectById,
	replaceProjectDocument,
	type AuthActor,
} from '../db/projects.js';
import { assertScreenCountForUser } from '../plans/limits.js';
import { assertResolvedPublicHost, isAllowedPublicUrl } from '../render/ssrf.js';
import { capturePageWithPlaywright } from '../render/playwright-capture.js';
import { runWebsiteScreenshotImport } from '../website-import/run.js';

const MAX_PAGES = 20;

export type SitemapImportResult = {
	version: number;
	pageId: string;
	routeCount: number;
	connectorCount: number;
	sourceUrl: string;
	screenshotCount: number;
	failedRoutes: { routePath: string; error: string }[];
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

	const project = await getProjectById(pool, projectId);
	if (!project) throw new Error('Project not found');
	if (project.version !== baseVersion) {
		throw new Error(`Version conflict (current ${project.version})`);
	}

	const built = await runWebsiteScreenshotImport(
		pool,
		{
			startUrl,
			projectId,
			baseVersion: project.version,
			document: project.document as ProjectDocument,
			maxPages: MAX_PAGES,
			canvasName: `Website: ${new URL(startUrl).hostname}`,
		},
		capturePageWithPlaywright,
	);

	await assertScreenCountForUser(pool, userId, built.document);
	const version = await replaceProjectDocument(pool, projectId, userId, built.document, baseVersion);

	const connectorCount = built.document.project.connectors.length;
	const screenshotCount = built.document.project.pages
		.flatMap((p) => Object.values(p.nodes))
		.filter((n) => n.type === 'image').length;

	return {
		version,
		pageId: built.pageId,
		routeCount: built.pageCount,
		connectorCount,
		sourceUrl: startUrl,
		screenshotCount,
		failedRoutes: built.failedRoutes,
	};
}

export async function importSitemapForActor(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	baseVersion: number,
	rawUrl: string,
): Promise<SitemapImportResult> {
	await assertProjectAccess(pool, projectId, actor, 'projects:write');
	const userId = actor.kind === 'user' ? actor.userId : actor.userId;
	return importSitemapIntoProject(pool, projectId, userId, baseVersion, rawUrl);
}