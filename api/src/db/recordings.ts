import type pg from 'pg';
import { randomUUID } from 'node:crypto';
import {
	applyImportScreenshots,
	applyProjectCommand,
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

export type RecordingStepInput = {
	stepIndex: number;
	url: string;
	capturedAt: string;
	viewport: { width: number; height: number; devicePixelRatio?: number };
	click?: {
		x: number;
		y: number;
		selector?: string;
		role?: string;
		name?: string;
	};
	assetId?: string;
	imageBytes?: Buffer;
	imageBase64?: string;
	contentType?: string;
};

export async function createRecording(
	pool: pg.Pool,
	projectId: string,
	name: string,
	viewport?: { width: number; height: number },
): Promise<string> {
	const id = randomUUID();
	await pool.query(
		`INSERT INTO recordings (id, project_id, name, status, viewport)
     VALUES ($1, $2, $3, 'uploading', $4)`,
		[id, projectId, name, viewport ? JSON.stringify(viewport) : null],
	);
	return id;
}

export async function addRecordingSteps(
	pool: pg.Pool,
	recordingId: string,
	projectId: string,
	steps: RecordingStepInput[],
): Promise<void> {
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
		await pool.query(
			`INSERT INTO recording_steps (recording_id, step_index, url, captured_at, viewport, click, asset_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (recording_id, step_index) DO UPDATE SET
         url = EXCLUDED.url, captured_at = EXCLUDED.captured_at, viewport = EXCLUDED.viewport,
         click = EXCLUDED.click, asset_id = EXCLUDED.asset_id`,
			[
				recordingId,
				step.stepIndex,
				step.url,
				step.capturedAt,
				JSON.stringify(step.viewport),
				step.click ? JSON.stringify(step.click) : null,
				assetId ?? null,
			],
		);
	}
	await pool.query(
		`UPDATE recordings SET status = 'ready', updated_at = NOW() WHERE id = $1`,
		[recordingId],
	);
}

export async function listRecordings(pool: pg.Pool, projectId: string) {
	const { rows } = await pool.query(
		`SELECT id, name, status, created_at, expires_at, built_page_id
     FROM recordings WHERE project_id = $1 ORDER BY created_at DESC`,
		[projectId],
	);
	return rows;
}

export async function getRecording(pool: pg.Pool, projectId: string, recordingId: string) {
	const { rows } = await pool.query(
		`SELECT * FROM recordings WHERE id = $1 AND project_id = $2`,
		[recordingId, projectId],
	);
	return rows[0] ?? null;
}

export async function getRecordingSteps(pool: pg.Pool, recordingId: string) {
	const { rows } = await pool.query(
		`SELECT step_index, url, captured_at, viewport, click, asset_id
     FROM recording_steps WHERE recording_id = $1 ORDER BY step_index ASC`,
		[recordingId],
	);
	return rows;
}

export async function buildFlowFromRecordingTx(
	pool: pg.Pool,
	projectId: string,
	recordingId: string,
	baseVersion: number,
	actor: AuthActor,
): Promise<{ version: number; pageId: string; frameIds: string[] }> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const rec = await getRecording(pool, projectId, recordingId);
		if (!rec || rec.status !== 'ready') {
			throw new Error('Recording not ready');
		}
		const steps = await getRecordingSteps(pool, recordingId);
		if (steps.length === 0) throw new Error('Recording has no steps');

		const project = await getProjectById(pool, projectId);
		if (!project) throw new Error('Project not found');
		if (project.version !== baseVersion) {
			throw new VersionConflictError(project.version);
		}

		const ctx = createDefaultCommandContext(isValidComponentSlug);
		let document = project.document as ProjectDocument;
		const pageName = `Recording: ${rec.name}`;
		const canvasRes = applyProjectCommand(
			document,
			{ type: 'create_canvas', name: pageName, presetId: 'mobile' },
			ctx,
		);
		document = canvasRes.document;
		const pageId = canvasRes.effects.pageId as string;

		const shots: { assetId: string; title?: string; url?: string }[] = [];
		const links: {
			fromAssetId: string;
			toAssetId: string;
			label?: string;
			trigger?: string;
		}[] = [];

		const urlToAsset = new Map<string, string>();
		let prevAsset: string | null = null;

		for (const step of steps) {
			if (!step.asset_id) continue;
			const assetId = step.asset_id as string;
			shots.push({ assetId, title: step.url, url: step.url });
			if (prevAsset && step.click) {
				const click = step.click as { name?: string; selector?: string };
				links.push({
					fromAssetId: prevAsset,
					toAssetId: assetId,
					label: click.name || click.selector || 'Click',
					trigger: 'click',
				});
			}
			prevAsset = assetId;
			urlToAsset.set(step.url, assetId);
		}

		const imported = applyImportScreenshots(document, shots, links, ctx, { pageId });
		document = imported.document;
		const frameIds = imported.effects.frameIds as string[];

		let calloutIndex = 1;
		for (let i = 0; i < steps.length; i++) {
			const step = steps[i]!;
			if (!step.asset_id || !step.click) continue;
			const click = step.click as { x: number; y: number; name?: string };
			const frameId = frameIds[i];
			if (!frameId) continue;
			const ann = applyProjectCommand(
				document,
				{
					type: 'add_annotation',
					frameId,
					kind: 'callout',
					target: { kind: 'rect', x: click.x, y: click.y, w: 24, h: 24 },
					text: `${calloutIndex}. ${click.name ?? 'Click'}`,
					index: calloutIndex,
				},
				ctx,
			);
			document = ann.document;
			calloutIndex += 1;
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
				JSON.stringify({ type: 'build_flow_from_recording', recordingId }),
				actor.kind,
				actor.kind === 'token' ? actor.tokenId : String(actor.userId),
			],
		);
		await client.query(
			`UPDATE recordings SET status = 'built', built_page_id = $2, built_version = $3, updated_at = NOW()
       WHERE id = $1`,
			[recordingId, pageId, newVersion],
		);
		await client.query('COMMIT');
		return { version: newVersion, pageId, frameIds: imported.effects.frameIds as string[] };
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export async function purgeExpiredRecordings(pool: pg.Pool): Promise<number> {
	const { rowCount } = await pool.query(
		`DELETE FROM recordings WHERE expires_at < NOW() AND status != 'uploading'`,
	);
	return rowCount ?? 0;
}
