import type pg from 'pg';
import { randomUUID } from 'node:crypto';
import {
	applyImportScreenshots,
	applyProjectCommand,
	attachConnectorButtonNodes,
	createDefaultCommandContext,
	type ProjectDocument,
} from '@bareframe/designer-core';
import {
	getProjectById,
	insertProjectAsset,
	VersionConflictError,
	type AuthActor,
} from './projects.js';
import { isValidComponentSlug } from '../catalog/components.js';
import { mapCaptureShotsToImport } from '../capture/import-shots.js';

export type CaptureFlowStepInput = {
	stepIndex: number;
	url: string;
	title?: string;
	capturedAt: string;
	viewport: { width: number; height: number; devicePixelRatio?: number };
	click?: {
		x: number;
		y: number;
		w?: number;
		h?: number;
		selector?: string;
		role?: string;
		name?: string;
		text?: string;
	};
	assetId?: string;
	imageBytes?: Buffer;
	imageBase64?: string;
	contentType?: string;
};

export function dedupeCaptureStepsByUrl<T extends { url: string }>(steps: T[]): T[] {
	const seen = new Set<string>();
	const out: T[] = [];
	for (const step of steps) {
		const key = step.url.trim();
		if (seen.has(key)) continue;
		seen.add(key);
		out.push(step);
	}
	return out;
}

/** Map each step to a canonical URL bucket for flow edges (keeps visit order). */
export function urlAssetSequence(
	steps: { url: string; assetId: string; click?: CaptureFlowStepInput['click'] }[],
): {
	shots: { assetId: string; title?: string; url: string }[];
	links: { fromAssetId: string; toAssetId: string; label?: string; trigger?: string }[];
	hotspots: { assetId: string; click: NonNullable<CaptureFlowStepInput['click']> }[];
} {
	const urlToAsset = new Map<string, string>();
	const shots: { assetId: string; title?: string; url: string }[] = [];
	const links: {
		fromAssetId: string;
		toAssetId: string;
		label?: string;
		trigger?: string;
	}[] = [];
	const hotspots: { assetId: string; click: NonNullable<CaptureFlowStepInput['click']> }[] = [];

	let prevUrl: string | null = null;

	for (const step of steps) {
		if (!step.assetId) continue;
		if (!urlToAsset.has(step.url)) {
			urlToAsset.set(step.url, step.assetId);
			shots.push({ assetId: step.assetId, title: step.url, url: step.url });
		}
		if (prevUrl && step.click) {
			const fromAsset = urlToAsset.get(prevUrl);
			const toAsset = urlToAsset.get(step.url);
			if (fromAsset && toAsset && fromAsset !== toAsset) {
				const label =
					step.click.name?.trim() ||
					step.click.text?.trim()?.slice(0, 80) ||
					step.click.selector ||
					'Click';
				links.push({
					fromAssetId: fromAsset,
					toAssetId: toAsset,
					label,
					trigger: 'click',
				});
				hotspots.push({ assetId: fromAsset, click: step.click });
			}
		}
		prevUrl = step.url;
	}

	return { shots, links, hotspots };
}

export async function persistCaptureFlowSteps(
	pool: pg.Pool,
	projectId: string,
	steps: CaptureFlowStepInput[],
): Promise<CaptureFlowStepInput[]> {
	const stored: CaptureFlowStepInput[] = [];
	for (const step of steps) {
		let assetId = step.assetId;
		const bytes =
			step.imageBytes ??
			(step.imageBase64 ? Buffer.from(step.imageBase64, 'base64') : undefined);
		if (!assetId && bytes) {
			assetId = await insertProjectAsset(
				pool,
				projectId,
				step.contentType ?? 'image/png',
				bytes,
			);
		}
		stored.push({ ...step, assetId });
	}
	return stored;
}

export async function buildFlowFromCaptureStepsTx(
	pool: pg.Pool,
	projectId: string,
	name: string,
	steps: CaptureFlowStepInput[],
	baseVersion: number,
	actor: AuthActor,
): Promise<{ version: number; pageId: string; frameIds: string[]; screenCount: number; connectorCount: number }> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const withAssets = await persistCaptureFlowSteps(pool, projectId, steps);
		const resolved = withAssets
			.filter((s) => s.assetId)
			.map((s) => ({
				url: s.url,
				assetId: s.assetId as string,
				click: s.click,
			}));
		if (resolved.length === 0) throw new Error('No screenshots in flow');

		const project = await getProjectById(pool, projectId);
		if (!project) throw new Error('Project not found');
		if (project.version !== baseVersion) {
			throw new VersionConflictError(project.version);
		}

		const { shots, links, hotspots } = urlAssetSequence(resolved);

		const ctx = createDefaultCommandContext(isValidComponentSlug);
		let document = project.document as ProjectDocument;
		const pageName = name.trim() || 'Recorded flow';
		const canvasRes = applyProjectCommand(
			document,
			{ type: 'create_canvas', name: pageName, presetId: 'mobile' },
			ctx,
		);
		document = canvasRes.document;
		const pageId = canvasRes.effects.pageId as string;

		const mapped = mapCaptureShotsToImport(shots, links);
		const imported = applyImportScreenshots(document, mapped.shots, mapped.links, ctx, { pageId });
		document = imported.document;
		const frameIds = imported.effects.frameIds as string[];

		const assetToFrame = new Map<string, string>();
		for (let i = 0; i < mapped.shots.length; i++) {
			const shot = mapped.shots[i]!;
			const frameId = frameIds[i];
			if (!frameId || !shot.assetId) continue;
			assetToFrame.set(shot.assetId, frameId);
		}

		for (const frameId of frameIds) {
			if (frameId) attachConnectorButtonNodes(document, pageId, frameId);
		}

		let hotspotIndex = 1;
		for (const spot of hotspots) {
			const frameId = assetToFrame.get(spot.assetId);
			if (!frameId || !spot.click) continue;
			const w = spot.click.w ?? 48;
			const h = spot.click.h ?? 32;
			const x = Math.max(0, spot.click.x - w / 2);
			const y = Math.max(0, spot.click.y - h / 2);
			const ann = applyProjectCommand(
				document,
				{
					type: 'add_annotation',
					frameId,
					kind: 'callout',
					target: { kind: 'rect', x, y, w, h },
					text: `${hotspotIndex}. ${spot.click.name ?? spot.click.text ?? 'Click'}`,
					index: hotspotIndex,
				},
				ctx,
			);
			document = ann.document;
			hotspotIndex += 1;
		}

		const newVersion = project.version + 1;
		await client.query(
			`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`,
			[projectId, JSON.stringify(document), newVersion],
		);
		await client.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, $2, $3, $4, $5)`,
			[
				projectId,
				newVersion,
				JSON.stringify({ type: 'build_flow_from_capture', name }),
				actor.kind,
				actor.kind === 'token' || actor.kind === 'account_token'
					? actor.tokenId
					: String(actor.userId),
			],
		);
		await client.query('COMMIT');
		return {
			version: newVersion,
			pageId,
			frameIds,
			screenCount: mapped.shots.length,
			connectorCount: mapped.links.length,
		};
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export function newCaptureFlowId(): string {
	return randomUUID();
}