import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { assertProjectAccess, ProjectAccessError } from '../db/projects.js';
import {
  assertCanRunReview,
  assertFeature,
  getPlanSummary,
  PlanLimitError,
} from '../plans/limits.js';
import { createOpenAiCompatibleReviewLlm } from './llm.js';
import {
  createFixtureReviewLlm,
  createReviewRun,
  getReviewRun,
  listReviewRuns,
  patchReviewIssue,
  processReviewRun,
} from './process-review.js';

function reviewLlmForProject(config: Config, projectDoc: import('@bareframe/designer-core').ProjectDocument) {
  if (config.llmAdapter === 'fixture' || config.nodeEnv === 'test') {
    return createFixtureReviewLlm(projectDoc);
  }
  if (config.llmAdapter === 'disabled') {
    return null;
  }
  if (config.llmAdapter === 'openai_compatible') {
    return createOpenAiCompatibleReviewLlm(config, projectDoc);
  }
  return createFixtureReviewLlm(projectDoc);
}

export function createReviewsRouter(pool: pg.Pool, config: Config) {
  const auth = createProjectAuthMiddleware(pool, config);
  const router = new Hono();
  router.use('*', auth);

  router.get('/plan', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    return c.json(await getPlanSummary(pool, actor.userId));
  });

  router.get('/projects/:projectId/reviews', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const projectId = c.req.param('projectId');
      await assertProjectAccess(pool, projectId, actor, 'projects:read');
      const runs = await listReviewRuns(pool, projectId, actor.userId);
      return c.json({ runs });
    } catch (err) {
      return handleProjectError(c, err);
    }
  });

  router.post('/projects/:projectId/reviews', async (c) => {
    try {
      const actor = getActor(c);
      const projectId = c.req.param('projectId');
      const project = await assertProjectAccess(
        pool,
        projectId,
        actor,
        actor.kind === 'token' ? 'reviews:write' : undefined,
      );
      if (config.llmAdapter === 'disabled') {
        return c.json(
          {
            error: 'llm_not_configured',
            message:
              'AI review requires an LLM. Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL (or LLM_ADAPTER=fixture for development).',
          },
          503,
        );
      }
      if (actor.kind === 'token') {
        await assertFeature(pool, actor.userId, 'mcpStudioTools');
      }
      await assertCanRunReview(pool, actor.userId);
      const runId = await createReviewRun(pool, projectId, actor.userId);
      const llm = reviewLlmForProject(config, project.document);
      if (!llm) {
        return c.json({ error: 'llm_not_configured' }, 503);
      }
      if (process.env.REVIEW_INLINE === '1' || config.nodeEnv === 'test') {
        await processReviewRun(pool, runId, actor.userId, llm);
      } else {
        setImmediate(() => {
          void processReviewRun(pool, runId, actor.userId, llm);
        });
      }
      const run = await getReviewRun(pool, runId, actor.userId);
      return c.json({ runId, status: run?.status ?? 'queued' }, 202);
    } catch (err) {
      if (err instanceof PlanLimitError) {
        return c.json({ error: err.code, message: err.message }, 429);
      }
      return handleProjectError(c, err);
    }
  });

  router.get('/projects/:projectId/reviews/:runId', async (c) => {
    try {
      const actor = getActor(c);
      const projectId = c.req.param('projectId');
      await assertProjectAccess(
        pool,
        projectId,
        actor,
        actor.kind === 'token' ? 'reviews:write' : undefined,
      );
      const run = await getReviewRun(pool, c.req.param('runId'), actor.userId);
      if (!run) return c.json({ error: 'Not found' }, 404);
      return c.json({
        id: run.id,
        status: run.status,
        issues: run.issues,
        summary: run.summary,
        error: run.error_message,
        createdAt: run.created_at,
        completedAt: run.completed_at,
      });
    } catch (err) {
      return handleProjectError(c, err);
    }
  });

  router.patch('/projects/:projectId/reviews/:runId/issues/:issueId', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const body = await c.req.json<{ status: 'open' | 'resolved' | 'dismissed' }>();
      const issue = await patchReviewIssue(
        pool,
        c.req.param('runId'),
        c.req.param('issueId'),
        actor.userId,
        body.status,
      );
      if (!issue) return c.json({ error: 'Not found' }, 404);
      return c.json({ issue });
    } catch (err) {
      return handleProjectError(c, err);
    }
  });

  return router;
}

export function createPublicShareRouter(pool: pg.Pool) {
  const router = new Hono();
  router.get('/share/:token', async (c) => {
    const token = c.req.param('token');
    const { hashToken } = await import('../auth/crypto.js');
    const { rows } = await pool.query(
      `SELECT id, name, version, document, updated_at FROM projects
       WHERE share_token_hash = $1 OR share_token_hash = $2`,
      [token, hashToken(token)],
    );
    const project = rows[0];
    if (!project) return c.json({ error: 'Not found' }, 404);
    return c.json({
      id: project.id,
      name: project.name,
      version: project.version,
      document: project.document,
      updatedAt: project.updated_at,
      readOnly: true,
    });
  });
  return router;
}
