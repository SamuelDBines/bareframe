import type pg from 'pg';
import {
	applyImportScreenshots,
	applyProjectCommand,
	createDefaultCommandContext,
	type ProjectDocument,
} from '@bareframe/designer-core';
import { isValidComponentSlug } from '../catalog/components.js';
import { assertScreenCountForUser } from '../plans/limits.js';
import {
	assertProjectAccess,
	getProjectById,
	type AuthActor,
	ProjectAccessError,
} from '../db/projects.js';
import { mapCaptureEventsToFlow } from './event-mapping.js';

function clearPageFrames(doc: ProjectDocument, pageId: string): ProjectDocument {
	const frameIds = new Set(doc.project.frames.filter((f) => f.pageId === pageId).map((f) => f.id));
	const page = doc.project.pages.find((p) => p.id === pageId);
	if (!page) return doc;
	const root = page.nodes[page.rootNodeId];
	return {
		...doc,
		project: {
			...doc.project,
			frames: doc.project.frames.filter((f) => !frameIds.has(f.id)),
			connectors: doc.project.connectors.filter(
				(c) => !frameIds.has(c.fromFrameId) && !frameIds.has(c.toFrameId),
			),
			annotations: doc.project.annotations.filter((a) => !frameIds.has(a.frameId)),
			pages: doc.project.pages.map((p) =>
				p.id === pageId && root
					? { ...p, nodes: { [p.rootNodeId]: root } }
					: p,
			),
		},
	};
}

export async function syncCaptureFlowMap(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
): Promise<{ version: number; pageId: string; screenCount: number; connectorCount: number }> {
	await assertProjectAccess(pool, projectId, actor, 'capture:write');

	const { rows: events } = await pool.query<{
		url: string;
		title: string | null;
		asset_id: string | null;
		navigated_from: string | null;
		clicked_selector: string | null;
	}>(
		`SELECT url, title, asset_id, navigated_from, clicked_selector
     FROM capture_events
     WHERE project_id = $1 AND asset_id IS NOT NULL
     ORDER BY captured_at ASC, id ASC`,
		[projectId],
	);

	const { shots, links } = mapCaptureEventsToFlow(events);
	if (shots.length === 0) {
		throw new ProjectAccessError('No capture events with screenshots yet', 400);
	}

	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const project = await getProjectById(pool, projectId);
		if (!project) throw new ProjectAccessError('Project not found', 404);

		const { rows: stateRows } = await client.query<{ page_id: string | null }>(
			`SELECT page_id FROM capture_flow_state WHERE project_id = $1 FOR UPDATE`,
			[projectId],
		);
		let pageId = stateRows[0]?.page_id ?? null;

		const ctx = createDefaultCommandContext(isValidComponentSlug);
		let document = project.document as ProjectDocument;

		if (pageId && document.project.pages.some((p) => p.id === pageId)) {
			document = clearPageFrames(document, pageId);
		} else {
			const canvasRes = applyProjectCommand(
				document,
				{ type: 'create_canvas', name: 'App capture', presetId: 'mobile' },
				ctx,
			);
			document = canvasRes.document;
			pageId = canvasRes.effects.pageId as string;
			await client.query(
				`INSERT INTO capture_flow_state (project_id, page_id, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (project_id) DO UPDATE SET page_id = EXCLUDED.page_id, updated_at = NOW()`,
				[projectId, pageId],
			);
		}

		const imported = applyImportScreenshots(document, shots, links, ctx, { pageId: pageId! });
		document = imported.document;

		const ownerId = actor.userId;
		await assertScreenCountForUser(pool, ownerId, document);

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
				JSON.stringify({ type: 'sync_capture_flow', screenCount: shots.length }),
				actor.kind,
				actor.kind === 'token' ? actor.tokenId : String(actor.userId),
			],
		);
		await client.query(`UPDATE capture_flow_state SET updated_at = NOW() WHERE project_id = $1`, [
			projectId,
		]);
		await client.query('COMMIT');

		return {
			version: newVersion,
			pageId: pageId!,
			screenCount: shots.length,
			connectorCount: links.length,
		};
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}
