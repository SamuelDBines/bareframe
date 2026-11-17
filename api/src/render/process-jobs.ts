import type pg from 'pg';
import type { ProjectDocument } from '@bareframe/designer-core';
import {
	getFlowMapJob,
	insertAuditFindings,
	updateFlowMapJobProgress,
	updateFlowMapJobStatus,
	type FlowMapInput,
} from '../db/flow-map-jobs.js';
import { getProjectById } from '../db/projects.js';
import { completeRenderJob, failRenderJob } from '../db/render-jobs.js';
import { runWebsiteScreenshotImport } from '../website-import/run.js';
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

		const built = await runWebsiteScreenshotImport(
			pool,
			{
				startUrl,
				projectId,
				baseVersion: project.version,
				document: project.document as ProjectDocument,
				maxPages: payload.maxPages,
				viewports: payload.viewports,
				seedRoutes: payload.routes,
				auditRules: payload.auditRules,
				canvasName: `Flow map: ${new URL(startUrl).hostname}`,
				onProgress: async (p) => {
					await updateFlowMapJobProgress(pool, flowMapJobId, p);
				},
			},
			capture,
		);

		const newVersion = built.version;
		await pool.query(
			`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`,
			[projectId, JSON.stringify(built.document), newVersion],
		);
		await pool.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, $2, $3, 'worker', $4)`,
			[projectId, newVersion, JSON.stringify({ type: 'create_flow_map', flowMapJobId }), renderJobId],
		);

		await insertAuditFindings(pool, flowMapJobId, built.findings);
		const result = {
			version: newVersion,
			pageId: built.pageId,
			pageCount: built.pageCount,
			findingsSummary: built.findingsSummary,
			failedRoutes: built.failedRoutes,
			canvasPath: `/#/app/project/${projectId}`,
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
	payload: { url: string; viewport?: import('@bareframe/flow-map-engine').ViewportPreset; projectId?: string },
	capture: BrowserCapture = capturePageWithPlaywright,
): Promise<void> {
	try {
		if (!isAllowedPublicUrl(payload.url)) throw new Error('URL not allowed');
		const { VIEWPORT_SIZES } = await import('@bareframe/flow-map-engine');
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
		const { getProjectAsset, insertProjectAsset } = await import('../db/projects.js');
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

void getFlowMapJob;