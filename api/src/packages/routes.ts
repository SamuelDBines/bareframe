import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { Buffer } from 'node:buffer';
import type pg from 'pg';
import {
  getContractSchema,
  INTAKE_QUESTIONS,
} from '@bareframe/package-contracts';
import type { Config } from '../config.js';
import {
  assertPackageOwner,
  canGeneratePackage,
  createPackageJob,
  getPackageById,
  getPackageByShareToken,
  getPackageJob,
  getUsage,
  listPackagesForUser,
  mintShareToken,
  PackageAccessError,
  setPackageShareToken,
  updateProductPackageDocument,
} from '../db/packages.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { normalizeUserId } from '../db/normalize.js';
import { subscribePackageJob } from './events.js';
import { reviseProductPackage, patchProductPackage } from './package-mutations.js';
import { buildPackageZip } from './export-zip.js';
import { processPackageGenerationJob } from './process-job.js';

const recentGenerations = new Map<number, number[]>();

function rateLimitOk(userId: number, limitPerHour: number): boolean {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000;
  const prev = recentGenerations.get(userId) ?? [];
  const inWindow = prev.filter((t) => now - t < windowMs);
  if (inWindow.length >= limitPerHour) return false;
  inWindow.push(now);
  recentGenerations.set(userId, inWindow);
  return true;
}

export function resetPackageRateLimitForTests() {
  recentGenerations.clear();
}

export function createPackagesRouter(pool: pg.Pool, config: Config) {
  const auth = createProjectAuthMiddleware(pool, config);
  const router = new Hono();

  router.get('/packages/config', (c) =>
    c.json({
      llmConfigured: config.llmAdapter !== 'disabled',
      llmAdapter: config.llmAdapter === 'disabled' ? null : config.llmAdapter,
      intakeQuestions: INTAKE_QUESTIONS,
      monthlyLimit: config.packageMonthlyLimit,
    }),
  );

  router.get('/packages/intake-questions', (c) => c.json({ questions: INTAKE_QUESTIONS }));

  router.get('/contracts', (c) =>
    c.json({
      contracts: [
        { id: 'bareframe.package', version: '1.0' },
        { id: 'define.requirements', version: '1.0' },
        { id: 'design.spec', version: '1.0' },
      ],
    }),
  );

  router.get('/contracts/:contractId', (c) => {
    const id = c.req.param('contractId') as 'bareframe.package' | 'define.requirements' | 'design.spec';
    if (!['bareframe.package', 'define.requirements', 'design.spec'].includes(id)) {
      return c.json({ error: 'Unknown contract' }, 404);
    }
    return c.json(getContractSchema(id));
  });

  router.get('/packages/public/:token', async (c) => {
    const pkg = await getPackageByShareToken(pool, c.req.param('token'));
    if (!pkg) return c.json({ error: 'Not found' }, 404);
    return c.json({ package: pkg.document, name: pkg.name, status: pkg.status });
  });

  const authed = new Hono();
  authed.use('*', auth);

  authed.get('/packages/usage', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const usage = await getUsage(pool, actor.userId);
    return c.json({
      packagesThisMonth: usage?.packages_this_month ?? 0,
      periodStart: usage?.period_start ?? null,
      monthlyLimit: config.packageMonthlyLimit,
    });
  });

  authed.get('/packages', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const packages = await listPackagesForUser(pool, actor.userId);
    return c.json({ packages });
  });

  authed.get('/packages/:id', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      return c.json({
        id: pkg.id,
        name: pkg.name,
        status: pkg.status,
        revision: pkg.revision,
        designerProjectId: pkg.designer_project_id,
        document: pkg.document,
      });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  authed.post('/packages/generate', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      if (config.llmAdapter === 'disabled') {
        return c.json(
          {
            error: 'llm_not_configured',
            message:
              'Package generation requires an LLM. Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL on the API (or LLM_ADAPTER=fixture for development).',
          },
          503,
        );
      }
      if (!(await canGeneratePackage(pool, actor.userId, config.packageMonthlyLimit))) {
        return c.json({ error: 'monthly_limit_reached', message: 'Monthly package limit reached.' }, 429);
      }
      if (!rateLimitOk(actor.userId, config.packageRateLimitPerHour)) {
        return c.json({ error: 'rate_limited', message: 'Too many generation requests. Try again later.' }, 429);
      }

      const body = await c.req.json<{
        idea: string;
        audience: string;
        constraints?: string[];
        references?: { url: string; note?: string }[];
        answers?: Record<string, string | null | undefined>;
      }>();

      if (!body.idea?.trim() || !body.audience?.trim()) {
        return c.json({ error: 'idea and audience are required' }, 400);
      }

      const jobId = await createPackageJob(pool, actor.userId, body);

      if (process.env.PACKAGE_INLINE === '1' || config.nodeEnv === 'test') {
        await processPackageGenerationJob(pool, config, jobId, actor.userId, body);
      } else {
        setImmediate(() => {
          void processPackageGenerationJob(pool, config, jobId, actor.userId, body);
        });
      }

      return c.json({ jobId, status: 'queued' }, 202);
    } catch (err) {
      return handleProjectError(c, err);
    }
  });

  authed.get('/packages/jobs/:jobId', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const job = await getPackageJob(pool, c.req.param('jobId'));
    if (!job || normalizeUserId(job.owner_user_id) !== normalizeUserId(actor.userId)) return c.json({ error: 'Not found' }, 404);
    return c.json({
      id: job.id,
      status: job.status,
      stage: job.stage,
      progress: job.progress,
      packageId: job.package_id,
      error: job.error_message,
    });
  });

  authed.get('/packages/jobs/:jobId/events', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const jobId = c.req.param('jobId');
    const job = await getPackageJob(pool, jobId);
    if (!job || normalizeUserId(job.owner_user_id) !== normalizeUserId(actor.userId)) return c.json({ error: 'Not found' }, 404);

    return streamSSE(c, async (stream) => {
      const send = (data: Record<string, unknown>) => stream.writeSSE({ data: JSON.stringify(data) });
      await send({
        type: 'snapshot',
        status: job.status,
        stage: job.stage,
        progress: job.progress,
        packageId: job.package_id,
        error: job.error_message,
      });
      if (job.status === 'completed' || job.status === 'failed') return;

      await new Promise<void>((resolve) => {
        const unsub = subscribePackageJob(jobId, (event) => {
          void send(event);
          if (event.type === 'completed' || event.type === 'failed') {
            unsub();
            resolve();
          }
        });
        stream.onAbort(() => {
          unsub();
          resolve();
        });
      });
    });
  });

  authed.post('/packages/:id/revise', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      const review = pkg.document.review as { rounds_included: number; rounds_used: number };
      if (review.rounds_used >= review.rounds_included) {
        return c.json({ error: 'no_revision_rounds', message: 'All included revision rounds are used.' }, 400);
      }
      if (config.llmAdapter === 'disabled') {
        return c.json({ error: 'llm_not_configured', message: 'LLM is not configured on the server.' }, 503);
      }
      const body = await c.req.json<{ deliverable: string; feedback: string }>();
      const result = await reviseProductPackage(
        pool,
        config,
        actor.userId,
        pkg.id,
        body.deliverable,
        body.feedback,
      );
      return c.json({ ok: true, document: result.document, roundsUsed: (result.document.review as { rounds_used: number }).rounds_used });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  authed.patch('/packages/:id', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const body = await c.req.json<{
        selectedDirection?: string;
        status?: 'approved';
        checklist?: { id: string; status: string; comment?: string }[];
      }>();
      const doc = await patchProductPackage(pool, config, actor.userId, c.req.param('id'), body);
      return c.json({ ok: true, document: doc });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      if (err instanceof Error && err.message.startsWith('invalid_package')) {
        return c.json({ error: 'invalid_package', details: err.message }, 400);
      }
      return handleProjectError(c, err);
    }
  });

  authed.post('/packages/:id/share', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      if (pkg.share_token_hash) {
        const { rows } = await pool.query<{ share_token: string | null }>(
          `SELECT share_token FROM product_packages WHERE id = $1`,
          [pkg.id],
        );
        const existing = rows[0]?.share_token;
        if (existing) {
          return c.json({ url: `${config.designerPublicUrl}/#/share/${existing}`, token: existing });
        }
      }
      const { token, hash } = mintShareToken();
      await setPackageShareToken(pool, pkg.id, hash);
      await pool.query(`UPDATE product_packages SET share_token = $2 WHERE id = $1`, [pkg.id, token]);
      const url = `${config.designerPublicUrl}/#/share/${token}`;
      const doc = { ...pkg.document } as Record<string, unknown>;
      (doc.prototype as { share_url: string }).share_url = url;
      await updateProductPackageDocument(pool, pkg.id, doc);
      return c.json({ url, token });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  authed.get('/packages/:id/export.zip', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      const zipped = await buildPackageZip(pool, pkg);
      const filename = `${pkg.name.replace(/\s+/g, '-').toLowerCase()}-package.zip`;
      return new Response(Buffer.from(zipped), {
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  authed.get('/packages/:id/delivery-flow.json', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      return c.json((pkg.document as { delivery_flow: unknown }).delivery_flow);
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  router.route('/', authed);
  return router;
}
