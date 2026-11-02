import { URL } from 'node:url';
import {
	auditPageMetrics,
	discoverRoutes,
	summarizeFindings,
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
	type ProjectDocument,
} from '@bareframe/designer-core';
import { isValidComponentSlug } from '../catalog/components.js';
import {
	getFlowMapJob,
	insertAuditFindings,
	updateFlowMapJobStatus,
	type FlowMapInput,
} from '../db/flow-map-jobs.js';
import { getProjectById } from '../db/projects.js';
import { completeRenderJob, failRenderJob } from '../db/render-jobs.js';
import { capturePageWithPlaywright, type BrowserCapture } from './playwright-capture.js';
import { isAllowedPublicUrl } from './ssrf.js';

export type FlowMapPayload = FlowMapInput & {
	flowMapJobId: string;
	projectId: string;
};

export async function processFlowMapJob(
	pool: pg.Pool,
	renderJobId: string,
	payload: FlowMapPayload,
	capture: BrowserCapture = capturePageWithPlaywright,
): Promise<void> {
	const flowMapJobId = payload.flowMapJobId;
	const projectId = payload.projectId;
	await updateFlowMapJobStatus(pool, flowMapJobId, 'running');

	try {
		const startUrl = payload.url;
		if (!startUrl) throw new Error('url is required');
		if (!isAllowedPublicUrl(startUrl)) throw new Error('URL not allowed');

		const project = await getProjectById(pool, projectId);
		if (!project) throw new Error('Project not found');
		if (project.version !== payload.baseVersion) {
			throw new Error(`Version conflict (current ${project.version})`);
		}

		const viewports: ViewportPreset[] =
			payload.viewports?.length ? payload.viewports : ['mobile'];
		const maxPages = payload.maxPages ?? 20;

		const origin = new URL(startUrl).origin;
		const routes = await discoverRoutes({
			startUrl,
			seedRoutes: payload.routes,
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
		let document = project.document as ProjectDocument;
		const pageTitle = `Flow map: ${new URL(startUrl).hostname}`;
		const canvasRes = applyProjectCommand(
			document,
			{ type: 'create_canvas', name: pageTitle, presetId: 'mobile' },
			ctx,
		);
		document = canvasRes.document;
		const pageId = canvasRes.effects.pageId as string;

		const allFindings: AuditFinding[] = [];
		const shots: { assetId: string; title?: string; url?: string }[] = [];
		const links: PageLink[] = [];
		const pathToAsset = new Map<string, string>();

		for (const route of routes) {
			const pageUrl = `${origin}${route.path === '/' ? '' : route.path}`;
			const vp = VIEWPORT_SIZES[viewports[0] ?? 'mobile'];
			const captured = await capture(pool, projectId, pageUrl, vp.width, vp.height);
			shots.push({ assetId: captured.assetId, title: route.path, url: pageUrl });
			pathToAsset.set(route.path, captured.assetId);
			allFindings.push(...auditPageMetrics(captured.metrics, payload.auditRules ?? {}));
			for (const link of captured.outboundLinks) {
				links.push({
					fromPath: route.path,
					toPath: link.path,
					label: link.label,
					trigger: link.trigger,
				});
			}
		}

		const importLinks = links
			.filter((l) => l.fromPath !== l.toPath)
			.map((l) => {
				const from = pathToAsset.get(l.fromPath);
				const to = pathToAsset.get(l.toPath);
				if (!from || !to) return null;
				return {
					fromAssetId: from,
					toAssetId: to,
					label: l.label,
					trigger: l.trigger,
				};
			})
			.filter(Boolean) as {
			fromAssetId: string;
			toAssetId: string;
			label?: string;
			trigger?: string;
		}[];

		const imported = applyImportScreenshots(document, shots, importLinks, ctx, { pageId });
		document = imported.document;

		const summary = summarizeFindings(allFindings);
		const summaryFrameId = (imported.effects.frameIds as string[])[0];
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
			const frameId = (imported.effects.frameIds as string[])[shotIndex];
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

		const newVersion = project.version + 1;
		await pool.query(
			`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`,
			[projectId, JSON.stringify(document), newVersion],
		);
		await pool.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, $2, $3, 'worker', $4)`,
			[projectId, newVersion, JSON.stringify({ type: 'create_flow_map', flowMapJobId }), renderJobId],
		);

		await insertAuditFindings(pool, flowMapJobId, allFindings);
		const result = {
			version: newVersion,
			pageId,
			pageCount: routes.length,
			findingsSummary: summary,
			canvasPath: `/designer/editor/${projectId}`,
		};
		await updateFlowMapJobStatus(pool, flowMapJobId, 'completed', result);
		await completeRenderJob(pool, renderJobId, result);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Flow map failed';
		await updateFlowMapJobStatus(pool, flowMapJobId, 'failed', undefined, message);
		await failRenderJob(pool, renderJobId, message);
		throw err;
	}
}

export async function processScreenshotUrlJob(
	pool: pg.Pool,
	jobId: string,
	payload: { url: string; viewport?: ViewportPreset; projectId?: string },
	capture: BrowserCapture = capturePageWithPlaywright,
): Promise<void> {
	try {
		if (!isAllowedPublicUrl(payload.url)) throw new Error('URL not allowed');
		const vp = VIEWPORT_SIZES[payload.viewport ?? 'mobile'];
		const projectId = payload.projectId;
		if (!projectId) throw new Error('projectId required for screenshot storage');
		const captured = await capture(pool, projectId, payload.url, vp.width, vp.height);
		await completeRenderJob(pool, jobId, {
			assetId: captured.assetId,
			url: payload.url,
			viewport: payload.viewport ?? 'mobile',
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Screenshot failed';
		await failRenderJob(pool, jobId, message);
		throw err;
	}
}

export async function processRenderFrameJob(
	pool: pg.Pool,
	jobId: string,
	payload: {
		projectId: string;
		frameId: string;
		withAnnotations?: boolean;
	},
): Promise<void> {
	try {
		const project = await getProjectById(pool, payload.projectId);
		if (!project) throw new Error('Project not found');
		const doc = project.document as ProjectDocument;
		const annotations = payload.withAnnotations ? doc.project.annotations : [];
		const { buildFrameRenderHtml } = await import('./frame-preview.js');
		const { getProjectAsset } = await import('../db/projects.js');
		let html = buildFrameRenderHtml({
			document: doc,
			frameId: payload.frameId,
			annotations,
		});
		const assetRefs = [...html.matchAll(/asset:\/\/([a-f0-9-]+)/gi)].map((m) => m[1]!);
		for (const assetId of assetRefs) {
			const asset = await getProjectAsset(pool, payload.projectId, assetId);
			if (!asset) continue;
			const b64 = Buffer.from(asset.bytes).toString('base64');
			const dataUrl = `data:${asset.content_type};base64,${b64}`;
			html = html.replaceAll(`asset://${assetId}`, dataUrl);
		}
		const frame = doc.project.frames.find((f) => f.id === payload.frameId);
		if (!frame) throw new Error('Frame not found');
		const { chromium } = await import('playwright');
		const browser = await chromium.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const context = await browser.newContext({
			viewport: { width: frame.width, height: frame.height },
		});
		const page = await context.newPage();
		await page.setContent(html, { waitUntil: 'load' });
		const png = await page.screenshot({ type: 'png' });
		await context.close();
		await browser.close();
		const { insertProjectAsset } = await import('../db/projects.js');
		const assetId = await insertProjectAsset(pool, payload.projectId, 'image/png', Buffer.from(png));
		await completeRenderJob(pool, jobId, { assetId, frameId: payload.frameId });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Render frame failed';
		await failRenderJob(pool, jobId, message);
		throw err;
	}
}

export async function resolveFlowMapJobForRender(pool: pg.Pool, renderJobId: string) {
	const { rows } = await pool.query(
		`SELECT id FROM flow_map_jobs WHERE render_job_id = $1 LIMIT 1`,
		[renderJobId],
	);
	return rows[0]?.id as string | undefined;
}

export async function getFlowMapJobByRenderJob(pool: pg.Pool, renderJobId: string) {
	const { rows } = await pool.query(`SELECT * FROM flow_map_jobs WHERE render_job_id = $1`, [
		renderJobId,
	]);
	return rows[0] ?? null;
}

void getFlowMapJobByRenderJob;
