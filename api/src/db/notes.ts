import type pg from 'pg';
import type { AuthActor } from './projects.js';
import { assertProjectAccess, ProjectAccessError, tokenHasScope } from './projects.js';
import { storeNoteScreenshot } from '../notes/screenshot.js';

export type ProjectNoteRow = {
	id: string;
	project_id: string;
	author_user_id: number;
	where_text: string | null;
	body: string;
	frame_id: string | null;
	node_id: string | null;
	page_url: string | null;
	element_selector: string | null;
	screenshot_asset_id: string | null;
	status: 'open' | 'done';
	tags: string[];
	converted_to_backlog_id: string | null;
	created_at: string;
	updated_at: string;
};

export type ProjectNote = {
	id: string;
	projectId: string;
	authorUserId: number;
	where: string | null;
	body: string;
	frameId: string | null;
	nodeId: string | null;
	pageUrl: string | null;
	elementSelector: string | null;
	screenshotAssetId: string | null;
	status: 'open' | 'done';
	tags: string[];
	convertedToBacklogId: string | null;
	createdAt: string;
	updatedAt: string;
};

export type ListNotesQuery = {
	status?: 'open' | 'done' | 'all';
	frameId?: string;
	tag?: string;
	q?: string;
};

function mapNote(row: ProjectNoteRow): ProjectNote {
	return {
		id: row.id,
		projectId: row.project_id,
		authorUserId: row.author_user_id,
		where: row.where_text,
		body: row.body,
		frameId: row.frame_id,
		nodeId: row.node_id,
		pageUrl: row.page_url,
		elementSelector: row.element_selector,
		screenshotAssetId: row.screenshot_asset_id,
		status: row.status,
		tags: row.tags ?? [],
		convertedToBacklogId: row.converted_to_backlog_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at,
	};
}

export async function listProjectNotes(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	query: ListNotesQuery = {},
): Promise<ProjectNote[]> {
	await assertProjectAccess(pool, projectId, actor, 'notes:read');
	const clauses = ['project_id = $1'];
	const params: unknown[] = [projectId];
	let i = 2;
	if (query.status && query.status !== 'all') {
		clauses.push(`status = $${i++}`);
		params.push(query.status);
	}
	if (query.frameId) {
		clauses.push(`frame_id = $${i++}`);
		params.push(query.frameId);
	}
	if (query.tag) {
		clauses.push(`$${i++} = ANY(tags)`);
		params.push(query.tag);
	}
	if (query.q?.trim()) {
		const like = `%${query.q.trim()}%`;
		clauses.push(`(body ILIKE $${i} OR where_text ILIKE $${i})`);
		params.push(like);
		i++;
	}
	const sql = `SELECT * FROM project_notes WHERE ${clauses.join(' AND ')} ORDER BY created_at ASC`;
	const { rows } = await pool.query<ProjectNoteRow>(sql, params);
	return rows.map(mapNote);
}

export type CreateNoteInput = {
	where?: string | null;
	body: string;
	frameId?: string | null;
	nodeId?: string | null;
	pageUrl?: string | null;
	elementSelector?: string | null;
	screenshotAssetId?: string | null;
	tags?: string[];
};

async function insertNoteRow(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	input: CreateNoteInput,
): Promise<ProjectNote> {
	const body = input.body.trim();
	if (!body) throw new ProjectAccessError('Note body is required', 400);
	const whereText = input.where?.trim() || null;
	const tags = (input.tags ?? []).map((t) => t.trim()).filter(Boolean);
	const { rows } = await pool.query<ProjectNoteRow>(
		`INSERT INTO project_notes (
       project_id, author_user_id, where_text, body, frame_id, node_id, page_url,
       element_selector, screenshot_asset_id, tags
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
		[
			projectId,
			actor.userId,
			whereText,
			body,
			input.frameId?.trim() || null,
			input.nodeId?.trim() || null,
			input.pageUrl?.trim() || null,
			input.elementSelector?.trim() || null,
			input.screenshotAssetId ?? null,
			tags,
		],
	);
	const row = rows[0];
	if (!row) throw new Error('insert failed');
	return mapNote(row);
}

export async function createProjectNote(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	input: CreateNoteInput,
): Promise<ProjectNote> {
	await assertProjectAccess(pool, projectId, actor, 'notes:write');
	return insertNoteRow(pool, projectId, actor, input);
}

export async function createProjectNotesBatch(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	items: CreateNoteInput[],
): Promise<ProjectNote[]> {
	await assertProjectAccess(pool, projectId, actor, 'notes:write');
	if (!items.length) return [];
	if (items.length > 100) throw new ProjectAccessError('Too many notes in one batch', 400);
	const created: ProjectNote[] = [];
	for (const item of items) {
		created.push(await insertNoteRow(pool, projectId, actor, item));
	}
	return created;
}

export type CaptureNoteInput = {
	where?: string | null;
	issue: string;
	pageUrl?: string | null;
	elementSelector?: string | null;
	screenshot?: string;
};

export async function captureProjectNote(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	input: CaptureNoteInput,
): Promise<ProjectNote> {
	await assertProjectAccess(pool, projectId, actor, 'notes:write');
	let screenshotAssetId: string | null = null;
	if (input.screenshot?.trim()) {
		if (actor.kind === 'token' || actor.kind === 'account_token') {
			const canUpload =
				tokenHasScope(actor.scopes, 'assets:upload') || tokenHasScope(actor.scopes, 'projects:write');
			if (!canUpload) {
				throw new ProjectAccessError('Insufficient scope for screenshot upload', 403);
			}
		}
		screenshotAssetId = await storeNoteScreenshot(pool, projectId, input.screenshot);
	}
	return insertNoteRow(pool, projectId, actor, {
		where: input.where,
		body: input.issue,
		pageUrl: input.pageUrl,
		elementSelector: input.elementSelector,
		screenshotAssetId,
	});
}

export type UpdateNoteInput = {
	where?: string | null;
	body?: string;
	frameId?: string | null;
	nodeId?: string | null;
	pageUrl?: string | null;
	elementSelector?: string | null;
	status?: 'open' | 'done';
	tags?: string[];
};

export async function updateProjectNote(
	pool: pg.Pool,
	projectId: string,
	noteId: string,
	actor: AuthActor,
	input: UpdateNoteInput,
): Promise<ProjectNote | null> {
	await assertProjectAccess(pool, projectId, actor, 'notes:write');
	const existing = await getProjectNote(pool, projectId, noteId, actor, 'notes:write');
	if (!existing) return null;
	const body = input.body !== undefined ? input.body.trim() : existing.body;
	if (!body) throw new ProjectAccessError('Note body is required', 400);
	const whereText =
		input.where !== undefined ? input.where?.trim() || null : existing.where;
	const tags = input.tags !== undefined ? input.tags.map((t) => t.trim()).filter(Boolean) : existing.tags;
	const frameId = input.frameId !== undefined ? input.frameId?.trim() || null : existing.frameId;
	const nodeId = input.nodeId !== undefined ? input.nodeId?.trim() || null : existing.nodeId;
	const pageUrl = input.pageUrl !== undefined ? input.pageUrl?.trim() || null : existing.pageUrl;
	const elementSelector =
		input.elementSelector !== undefined ? input.elementSelector?.trim() || null : existing.elementSelector;
	const status = input.status ?? existing.status;
	const { rows } = await pool.query<ProjectNoteRow>(
		`UPDATE project_notes
     SET where_text = $3, body = $4, frame_id = $5, node_id = $6, page_url = $7,
         element_selector = $8, status = $9, tags = $10, updated_at = NOW()
     WHERE project_id = $1 AND id = $2
     RETURNING *`,
		[projectId, noteId, whereText, body, frameId, nodeId, pageUrl, elementSelector, status, tags],
	);
	const row = rows[0];
	return row ? mapNote(row) : null;
}

export async function deleteProjectNote(
	pool: pg.Pool,
	projectId: string,
	noteId: string,
	actor: AuthActor,
): Promise<boolean> {
	await assertProjectAccess(pool, projectId, actor, 'notes:write');
	const { rowCount } = await pool.query(`DELETE FROM project_notes WHERE project_id = $1 AND id = $2`, [
		projectId,
		noteId,
	]);
	return (rowCount ?? 0) > 0;
}

export async function getProjectNote(
	pool: pg.Pool,
	projectId: string,
	noteId: string,
	actor: AuthActor,
	requiredScope: 'notes:read' | 'notes:write' = 'notes:read',
): Promise<ProjectNote | null> {
	await assertProjectAccess(pool, projectId, actor, requiredScope);
	const { rows } = await pool.query<ProjectNoteRow>(`SELECT * FROM project_notes WHERE project_id = $1 AND id = $2`, [
		projectId,
		noteId,
	]);
	const row = rows[0];
	return row ? mapNote(row) : null;
}