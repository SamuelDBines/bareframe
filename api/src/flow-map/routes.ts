import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import {
	createFlowMapJob,
	getFlowMapJob,
	listAuditFindings,
} from '../db/flow-map-jobs.js';
import { insertRenderJob, getRenderJob } from '../db/render-jobs.js';
import {
	buildFlowFromRecordingTx,
	addRecordingSteps,
	createRecording,
	getRecording,
	listRecordings,
	type RecordingStepInput,
} from '../db/recordings.js';
import { assertProjectAccess, getProjectById } from '../db/projects.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { publishProjectUpdate } from '../projects/events.js';
import { processFlowMapJob, processRenderFrameJob, processScreenshotUrlJob } from '../render/process-jobs.js';
import { VersionConflictError } from '../db/projects.js';

export function createFlowMapRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();

	const authed = new Hono();
	authed.use('*', auth);

	authed.post('/projects/:projectId/flow-maps', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			const project = await assertProjectAccess(pool, projectId, actor, 'flowmap:write');
			const body = await c.req.json<{
				baseVersion: number;
				url?: string;
				routes?: string[];
				viewports?: ('mobile' | 'desktop')[];
				maxPages?: number;
				auditRules?: Record<string, unknown>;
			}>();
			if (project.version !== body.baseVersion) {
				return c.json({ error: 'Version conflict', currentVersion: project.version }, 409);
			}
			const userId = actor.kind === 'user' ? actor.userId : actor.userId;
			const renderJobId = await insertRenderJob(
				pool,
				'flow_map',
				{},
				projectId,
			);
			const input = {
				baseVersion: body.baseVersion,
				url: body.url,
				routes: body.routes,
				viewports: body.viewports,
				maxPages: body.maxPages,
				auditRules: body.auditRules,
				actorUserId: userId,
			};
			const flowMapJobId = await createFlowMapJob(pool, projectId, input, renderJobId);
			const payload = { ...input, flowMapJobId, projectId };
			await pool.query(`UPDATE render_jobs SET payload = $2 WHERE id = $1`, [
				renderJobId,
				JSON.stringify(payload),
			]);

			if (process.env.RENDER_INLINE === '1' || config.nodeEnv === 'test') {
				await processFlowMapJob(pool, renderJobId, payload);
				publishProjectUpdate(projectId, (await getProjectById(pool, projectId))!.version);
			}

			return c.json({ jobId: flowMapJobId, renderJobId, status: 'queued' }, 202);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	authed.get('/projects/:projectId/flow-maps/:jobId', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			const job = await getFlowMapJob(pool, c.req.param('jobId'));
			if (!job || job.project_id !== projectId) return c.json({ error: 'Not found' }, 404);
			const findings = await listAuditFindings(pool, job.id);
			return c.json({
				id: job.id,
				status: job.status,
				result: job.result,
				error: job.error_message,
				findings,
			});
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	authed.post('/projects/:projectId/render-jobs', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'render');
			const body = await c.req.json<{
				kind: 'screenshot_url' | 'render_frame';
				url?: string;
				viewport?: 'mobile' | 'desktop';
				frameId?: string;
				withAnnotations?: boolean;
			}>();
			const payload =
				body.kind === 'screenshot_url'
					? { url: body.url, viewport: body.viewport, projectId }
					: {
							projectId,
							frameId: body.frameId,
							withAnnotations: body.withAnnotations,
						};
			const jobId = await insertRenderJob(pool, body.kind, payload, projectId);
			if (process.env.RENDER_INLINE === '1' || config.nodeEnv === 'test') {
				if (body.kind === 'screenshot_url') {
					await processScreenshotUrlJob(pool, jobId, payload as {
						url: string;
						viewport?: 'mobile' | 'desktop';
						projectId?: string;
					});
				} else {
					await processRenderFrameJob(pool, jobId, payload as {
						projectId: string;
						frameId: string;
						withAnnotations?: boolean;
					});
				}
			}
			return c.json({ jobId, status: 'pending' }, 202);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	authed.get('/projects/:projectId/render-jobs/:jobId', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			const job = await getRenderJob(pool, c.req.param('jobId'));
			if (!job || job.project_id !== projectId) return c.json({ error: 'Not found' }, 404);
			return c.json(job);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	authed.get('/projects/:projectId/recordings', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:read');
			const rows = await listRecordings(pool, projectId);
			return c.json({ recordings: rows });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	authed.post('/projects/:projectId/recordings', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'recordings:upload');
			const body = await c.req.json<{
				name?: string;
				viewport?: { width: number; height: number };
				steps: RecordingStepInput[];
				baseVersion?: number;
				build?: boolean;
			}>();
			const recordingId = await createRecording(pool, projectId, body.name ?? 'Recording', body.viewport);
			await addRecordingSteps(pool, recordingId, projectId, body.steps);
			let buildResult: unknown = null;
			if (body.build && body.baseVersion != null) {
				buildResult = await buildFlowFromRecordingTx(
					pool,
					projectId,
					recordingId,
					body.baseVersion,
					actor,
				);
				publishProjectUpdate(projectId, (buildResult as { version: number }).version);
			}
			const rec = await getRecording(pool, projectId, recordingId);
			return c.json({ recordingId, recording: rec, build: buildResult }, 201);
		} catch (err) {
			if (err instanceof VersionConflictError) {
				return c.json({ error: 'Version conflict', currentVersion: err.currentVersion }, 409);
			}
			return handleProjectError(c, err);
		}
	});

	authed.post('/projects/:projectId/recordings/:recordingId/build', async (c) => {
		try {
			const actor = getActor(c);
			const projectId = c.req.param('projectId');
			await assertProjectAccess(pool, projectId, actor, 'projects:write');
			const body = await c.req.json<{ baseVersion: number }>();
			const result = await buildFlowFromRecordingTx(
				pool,
				projectId,
				c.req.param('recordingId'),
				body.baseVersion,
				actor,
			);
			publishProjectUpdate(projectId, result.version);
			return c.json(result);
		} catch (err) {
			if (err instanceof VersionConflictError) {
				return c.json({ error: 'Version conflict', currentVersion: err.currentVersion }, 409);
			}
			return handleProjectError(c, err);
		}
	});

	router.route('/', authed);
	return router;
}
