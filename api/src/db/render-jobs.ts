import type pg from 'pg';
import { randomUUID } from 'node:crypto';

export type RenderJobKind = 'screenshot_url' | 'render_frame' | 'flow_map';
export type RenderJobStatus = 'pending' | 'running' | 'completed' | 'failed';

export type RenderJobRow = {
	id: string;
	project_id: string | null;
	kind: RenderJobKind;
	status: RenderJobStatus;
	payload: unknown;
	result: unknown | null;
	error_message: string | null;
};

export async function insertRenderJob(
	pool: pg.Pool,
	kind: RenderJobKind,
	payload: unknown,
	projectId?: string,
): Promise<string> {
	const id = randomUUID();
	await pool.query(
		`INSERT INTO render_jobs (id, project_id, kind, payload) VALUES ($1, $2, $3, $4)`,
		[id, projectId ?? null, kind, JSON.stringify(payload)],
	);
	return id;
}

export async function claimNextRenderJob(
	pool: pg.Pool,
	workerId: string,
	lockSeconds = 120,
): Promise<RenderJobRow | null> {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const { rows } = await client.query<RenderJobRow>(
			`SELECT id, project_id, kind, status, payload, result, error_message
       FROM render_jobs
       WHERE status = 'pending'
         AND (locked_until IS NULL OR locked_until < NOW())
       ORDER BY created_at ASC
       FOR UPDATE SKIP LOCKED
       LIMIT 1`,
		);
		const row = rows[0];
		if (!row) {
			await client.query('COMMIT');
			return null;
		}
		await client.query(
			`UPDATE render_jobs
       SET status = 'running', started_at = NOW(), locked_by = $2,
           locked_until = NOW() + ($3 || ' seconds')::interval
       WHERE id = $1`,
			[row.id, workerId, String(lockSeconds)],
		);
		await client.query('COMMIT');
		return row;
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export async function completeRenderJob(
	pool: pg.Pool,
	jobId: string,
	result: unknown,
): Promise<void> {
	await pool.query(
		`UPDATE render_jobs
     SET status = 'completed', result = $2, finished_at = NOW(), locked_until = NULL
     WHERE id = $1`,
		[jobId, JSON.stringify(result)],
	);
}

export async function failRenderJob(pool: pg.Pool, jobId: string, message: string): Promise<void> {
	await pool.query(
		`UPDATE render_jobs
     SET status = 'failed', error_message = $2, finished_at = NOW(), locked_until = NULL
     WHERE id = $1`,
		[jobId, message.slice(0, 2000)],
	);
}

export async function getRenderJob(pool: pg.Pool, jobId: string): Promise<RenderJobRow | null> {
	const { rows } = await pool.query<RenderJobRow>(
		`SELECT id, project_id, kind, status, payload, result, error_message FROM render_jobs WHERE id = $1`,
		[jobId],
	);
	return rows[0] ?? null;
}
