import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import { strToU8, zipSync } from 'fflate';
import type pg from 'pg';
import {
  getContractSchema,
  INTAKE_QUESTIONS,
  validateBareframePackage,
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
import { subscribePackageJob } from './events.js';
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

function packageMarkdown(doc: Record<string, unknown>): string {
  return `# ${doc.project}\n\n${doc.summary}\n\n_Status: ${doc.status}_\n`;
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
    if (!job || job.owner_user_id !== actor.userId) return c.json({ error: 'Not found' }, 404);
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
    if (!job || job.owner_user_id !== actor.userId) return c.json({ error: 'Not found' }, 404);

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
      const body = await c.req.json<{ deliverable: string; feedback: string }>();
      const doc = { ...pkg.document } as Record<string, unknown>;
      review.rounds_used += 1;
      doc.revision = ((doc.revision as number) ?? 0) + 1;
      doc.status = 'revision_requested';
      const checklist = (doc.review as { checklist: { id: string; section?: string; comment?: string; status: string }[] }).checklist;
      const item = checklist.find((x) => x.id.includes(body.deliverable) || x.section === body.deliverable);
      if (item) {
        item.status = 'change_requested';
        item.comment = body.feedback;
      }
      await updateProductPackageDocument(pool, pkg.id, doc, {
        revision: doc.revision as number,
        status: 'revision_requested',
      });
      return c.json({ ok: true, roundsUsed: review.rounds_used });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  authed.patch('/packages/:id', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      const body = await c.req.json<{
        selectedDirection?: string;
        status?: 'approved';
        checklist?: { id: string; status: string; comment?: string }[];
      }>();
      const doc = { ...pkg.document } as Record<string, unknown>;
      if (body.selectedDirection) doc.selected_direction = body.selectedDirection;
      if (body.checklist) {
        const review = doc.review as { checklist: { id: string; status: string; comment?: string }[] };
        review.checklist = review.checklist.map((item) => {
          const patch = body.checklist!.find((x) => x.id === item.id);
          return patch ? { ...item, ...patch } : item;
        });
      }
      if (body.status === 'approved') {
        doc.status = 'approved';
        const review = doc.review as Record<string, unknown>;
        review.approved_at = new Date().toISOString();
        review.approved_by = String(actor.userId);
      }
      const validation = validateBareframePackage(doc);
      if (!validation.ok) return c.json({ error: 'invalid_package', details: validation.errors }, 400);
      await updateProductPackageDocument(pool, pkg.id, doc, {
        status: doc.status as string,
      });
      return c.json({ ok: true });
    } catch (err) {
      if (err instanceof PackageAccessError) return c.json({ error: err.message }, err.status as 404);
      return handleProjectError(c, err);
    }
  });

  authed.post('/packages/:id/share', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const pkg = await assertPackageOwner(pool, c.req.param('id'), actor.userId);
      const { token, hash } = mintShareToken();
      await setPackageShareToken(pool, pkg.id, hash);
      const url = `${config.designerPublicUrl}/#/share/${token}`;
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
      const doc = pkg.document as Record<string, unknown>;
      const files: Record<string, Uint8Array> = {};
      files['bareframe.package.json'] = strToU8(JSON.stringify(doc, null, 2));
      files['README.md'] = strToU8(packageMarkdown(doc));
      files['delivery-flow/define.requirements.json'] = strToU8(
        JSON.stringify((doc.delivery_flow as { define: unknown }).define, null, 2),
      );
      files['delivery-flow/design.spec.json'] = strToU8(
        JSON.stringify((doc.delivery_flow as { design: unknown }).design, null, 2),
      );
      const scaffolds = (doc.handoff as { scaffolded_screens?: { path: string; tsx: string }[] })?.scaffolded_screens ?? [];
      for (const s of scaffolds) {
        files[s.path.replace(/^\//, '')] = strToU8(s.tsx);
      }
      const zipped = zipSync(files);
      c.header('Content-Type', 'application/zip');
      c.header('Content-Disposition', `attachment; filename="${pkg.name.replace(/\s+/g, '-').toLowerCase()}-package.zip"`);
      return c.body(zipped);
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
