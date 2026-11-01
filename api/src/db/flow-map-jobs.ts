import type pg from 'pg';
import { randomUUID } from 'node:crypto';
import type { AuditFinding } from '@bareframe/flow-map-engine';

export type FlowMapJobRow = {
	id: string;
	project_id: string;
	render_job_id: string | null;
	status: string;
	input: unknown;
	result: unknown | null;
	error_message: string | null;
};

export type FlowMapInput = {
	baseVersion: number;
	url?: string;
	routes?: string[];
	viewports?: ('mobile' | 'desktop')[];
	maxPages?: number;
	auditRules?: Record<string, unknown>;
	actorUserId: number;
};

export async function createFlowMapJob(
	pool: pg.Pool,
	projectId: string,
	input: FlowMapInput,
	renderJobId: string,
): Promise<string> {
	const id = randomUUID();
	await pool.query(
		`INSERT INTO flow_map_jobs (id, project_id, render_job_id, status, input)
     VALUES ($1, $2, $3, 'queued', $4)`,
		[id, projectId, renderJobId, JSON.stringify(input)],
	);
	return id;
}

export async function updateFlowMapJobStatus(
	pool: pg.Pool,
	jobId: string,
	status: 'running' | 'completed' | 'failed',
	result?: unknown,
	error?: string,
): Promise<void> {
	await pool.query(
		`UPDATE flow_map_jobs
     SET status = $2, result = COALESCE($3, result), error_message = $4,
         finished_at = CASE WHEN $2 IN ('completed','failed') THEN NOW() ELSE finished_at END
     WHERE id = $1`,
		[jobId, status, result ? JSON.stringify(result) : null, error ?? null],
	);
}

export async function getFlowMapJob(pool: pg.Pool, jobId: string): Promise<FlowMapJobRow | null> {
	const { rows } = await pool.query<FlowMapJobRow>(
		`SELECT id, project_id, render_job_id, status, input, result, error_message FROM flow_map_jobs WHERE id = $1`,
		[jobId],
	);
	return rows[0] ?? null;
}

export async function insertAuditFindings(
	pool: pg.Pool,
	flowMapJobId: string,
	findings: AuditFinding[],
): Promise<void> {
	for (const f of findings) {
		await pool.query(
			`INSERT INTO audit_findings (flow_map_job_id, page_url, rule_id, severity, message, evidence)
       VALUES ($1, $2, $3, $4, $5, $6)`,
			[
				flowMapJobId,
				f.pageUrl,
				f.ruleId,
				f.severity,
				f.message,
				f.evidence ? JSON.stringify(f.evidence) : null,
			],
		);
	}
}

export async function listAuditFindings(pool: pg.Pool, flowMapJobId: string) {
	const { rows } = await pool.query(
		`SELECT page_url, rule_id, severity, message, evidence FROM audit_findings WHERE flow_map_job_id = $1`,
		[flowMapJobId],
	);
	return rows;
}
