import type pg from 'pg';
import type { AuthActor } from './projects.js';
import { assertProjectAccess, ProjectAccessError } from './projects.js';

export type ProjectNoteRow = {
	id: string;
	project_id: string;
	author_user_id: number;
	body: string;
	frame_id: string | null;
	node_id: string | null;
	page_url: string | null;
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
	body: string;
	frameId: string | null;
	nodeId: string | null;
	pageUrl: string | null;
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
		body: row.body,
		frameId: row.frame_id,
		nodeId: row.node_id,
		pageUrl: row.page_url,
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
		clauses.push(`body ILIKE $${i++}`);
		params.push(`%${query.q.trim()}%`);
	}
	const sql = `SELECT * FROM project_notes WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC`;
	const { rows } = await pool.query<ProjectNoteRow>(sql, params);
	return rows.map(mapNote);
}

export type CreateNoteInput = {
	body: string;
	frameId?: string | null;
	nodeId?: string | null;
	pageUrl?: string | null;
	tags?: string[];
};

export async function createProjectNote(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	input: CreateNoteInput,
): Promise<ProjectNote> {
	await assertProjectAccess(pool, projectId, actor, 'notes:write');
	const body = input.body.trim();
	if (!body) throw new ProjectAccessError('Note body is required', 400);
	const tags = (input.tags ?? []).map((t) => t.trim()).filter(Boolean);
	const { rows } = await pool.query<ProjectNoteRow>(
		`INSERT INTO project_notes (project_id, author_user_id, body, frame_id, node_id, page_url, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
		[
			projectId,
			actor.userId,
			body,
			input.frameId?.trim() || null,
			input.nodeId?.trim() || null,
			input.pageUrl?.trim() || null,
			tags,
		],
	);
	const row = rows[0];
	if (!row) throw new Error('insert failed');
	return mapNote(row);
}

export type UpdateNoteInput = {
	body?: string;
	frameId?: string | null;
	nodeId?: string | null;
	pageUrl?: string | null;
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
	const tags = input.tags !== undefined ? input.tags.map((t) => t.trim()).filter(Boolean) : existing.tags;
	const frameId = input.frameId !== undefined ? input.frameId?.trim() || null : existing.frameId;
	const nodeId = input.nodeId !== undefined ? input.nodeId?.trim() || null : existing.nodeId;
	const pageUrl = input.pageUrl !== undefined ? input.pageUrl?.trim() || null : existing.pageUrl;
	const status = input.status ?? existing.status;
	const { rows } = await pool.query<ProjectNoteRow>(
		`UPDATE project_notes
     SET body = $3, frame_id = $4, node_id = $5, page_url = $6, status = $7, tags = $8, updated_at = NOW()
     WHERE project_id = $1 AND id = $2
     RETURNING *`,
		[projectId, noteId, body, frameId, nodeId, pageUrl, status, tags],
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