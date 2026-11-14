import type pg from 'pg';
import { normalizeUserId } from '../db/normalize.js';

export type PlanTier = 'free' | 'pro';

export type PlanLimits = {
  maxProjects: number;
  maxScreensPerProject: number;
  maxAiReviewsPerMonth: number;
  /** "Describe your product" flow generations, including regenerate and refine. */
  maxFlowGenerationsPerMonth: number;
  /** AI screen designs (one per screen and device). */
  maxScreenDesignsPerMonth: number;
  urlImport: boolean;
  privateCanvases: boolean;
  exportEnabled: boolean;
  mcpStudioTools: boolean;
};

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxProjects: 1,
    maxScreensPerProject: 10,
    maxAiReviewsPerMonth: 3,
    maxFlowGenerationsPerMonth: 1,
    maxScreenDesignsPerMonth: 3,
    urlImport: false,
    privateCanvases: false,
    exportEnabled: false,
    mcpStudioTools: false,
  },
  pro: {
    maxProjects: Number.POSITIVE_INFINITY,
    maxScreensPerProject: Number.POSITIVE_INFINITY,
    maxAiReviewsPerMonth: 50,
    maxFlowGenerationsPerMonth: 30,
    maxScreenDesignsPerMonth: 300,
    urlImport: true,
    privateCanvases: true,
    exportEnabled: true,
    mcpStudioTools: true,
  },
};

export async function getUserPlanTier(pool: pg.Pool, userId: number): Promise<PlanTier> {
  const { rows } = await pool.query<{ plan_tier: string }>(`SELECT plan_tier FROM users WHERE id = $1`, [
    userId,
  ]);
  const tier = rows[0]?.plan_tier ?? 'free';
  return tier === 'pro' ? 'pro' : 'free';
}

export async function countUserProjects(pool: pg.Pool, userId: number): Promise<number> {
  const { rows } = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM projects WHERE owner_user_id = $1`,
    [userId],
  );
  return Number(rows[0]?.count ?? 0);
}

export function countScreensInDocument(document: { project?: { frames?: unknown[] } }): number {
  return document.project?.frames?.length ?? 0;
}

export async function getReviewUsage(pool: pg.Pool, userId: number) {
  const { rows } = await pool.query<{ ai_reviews_this_month: number; period_start: Date }>(
    `SELECT ai_reviews_this_month, period_start FROM user_plan_usage WHERE user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function incrementReviewUsage(pool: pg.Pool, userId: number) {
  await pool.query(
    `INSERT INTO user_plan_usage (user_id, ai_reviews_this_month, period_start)
     VALUES ($1, 1, date_trunc('month', CURRENT_DATE)::date)
     ON CONFLICT (user_id) DO UPDATE SET
       ai_reviews_this_month = CASE
         WHEN user_plan_usage.period_start < date_trunc('month', CURRENT_DATE)::date THEN 1
         ELSE user_plan_usage.ai_reviews_this_month + 1
       END,
       period_start = date_trunc('month', CURRENT_DATE)::date`,
    [userId],
  );
}

export async function assertScreenCountForUser(
  pool: pg.Pool,
  userId: number,
  document: { project?: { frames?: unknown[] } },
) {
  const tier = await getUserPlanTier(pool, userId);
  const limits = PLAN_LIMITS[tier];
  if (limits.maxScreensPerProject === Number.POSITIVE_INFINITY) return;
  const count = countScreensInDocument(document);
  if (count > limits.maxScreensPerProject) {
    throw new PlanLimitError(
      'screen_limit',
      `Free plan allows ${limits.maxScreensPerProject} screens per project. Upgrade to Bareframe Pro.`,
    );
  }
}

export async function assertCanCreateProject(pool: pg.Pool, userId: number) {
  const tier = await getUserPlanTier(pool, userId);
  const limits = PLAN_LIMITS[tier];
  if (limits.maxProjects === Number.POSITIVE_INFINITY) return;
  const count = await countUserProjects(pool, userId);
  if (count >= limits.maxProjects) {
    throw new PlanLimitError('project_limit', `Free plan allows ${limits.maxProjects} project. Upgrade to Bareframe Pro.`);
  }
}

export async function assertCanRunReview(pool: pg.Pool, userId: number) {
  const tier = await getUserPlanTier(pool, userId);
  const limits = PLAN_LIMITS[tier];
  const usage = await getReviewUsage(pool, userId);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const used =
    usage && new Date(usage.period_start) >= monthStart ? usage.ai_reviews_this_month : 0;
  if (used >= limits.maxAiReviewsPerMonth) {
    throw new PlanLimitError('review_limit', `Monthly AI review limit reached (${limits.maxAiReviewsPerMonth}).`);
  }
}

export async function assertFeature(pool: pg.Pool, userId: number, feature: keyof PlanLimits) {
  const tier = await getUserPlanTier(pool, userId);
  const limits = PLAN_LIMITS[tier];
  const value = limits[feature];
  if (value === false) {
    throw new PlanLimitError('upgrade_required', 'This feature requires Bareframe Pro (£20/month).');
  }
}

export type GenerationKind = 'flow' | 'screen_design';

const GENERATION_LIMIT: Record<GenerationKind, { key: keyof PlanLimits; code: string; noun: string }> = {
  flow: { key: 'maxFlowGenerationsPerMonth', code: 'flow_generation_limit', noun: 'flow generation' },
  screen_design: { key: 'maxScreenDesignsPerMonth', code: 'screen_design_limit', noun: 'screen design' },
};

export async function getGenerationUsage(pool: pg.Pool, userId: number): Promise<Record<GenerationKind, number>> {
  const { rows } = await pool.query<{ kind: GenerationKind; count: number }>(
    `SELECT kind, count FROM ai_generation_usage
     WHERE user_id = $1 AND period_start = date_trunc('month', CURRENT_DATE)::date`,
    [userId],
  );
  const usage: Record<GenerationKind, number> = { flow: 0, screen_design: 0 };
  for (const row of rows) usage[row.kind] = row.count;
  return usage;
}

/**
 * Atomically take one generation from this month's allowance, or throw PlanLimitError.
 * Call `refundGeneration` if the generation then fails, so failures don't use up the plan.
 */
export async function reserveGeneration(pool: pg.Pool, userId: number, kind: GenerationKind) {
  const tier = await getUserPlanTier(pool, userId);
  const meta = GENERATION_LIMIT[kind];
  const limit = PLAN_LIMITS[tier][meta.key] as number;
  const cap = Number.isFinite(limit) ? limit : 2_147_483_647;
  const { rows } = await pool.query<{ count: number }>(
    `INSERT INTO ai_generation_usage (user_id, kind, period_start, count)
     SELECT $1, $2, date_trunc('month', CURRENT_DATE)::date, 1 WHERE $3::int > 0
     ON CONFLICT (user_id, kind, period_start) DO UPDATE SET count = ai_generation_usage.count + 1
       WHERE ai_generation_usage.count < $3::int
     RETURNING count`,
    [userId, kind, cap],
  );
  if (rows.length === 0) {
    const plan = tier === 'pro' ? 'Bareframe Pro' : 'The free plan';
    const upgrade = tier === 'pro' ? '' : ' Upgrade to Bareframe Pro for more.';
    throw new PlanLimitError(
      meta.code,
      `${plan} includes ${limit} ${meta.noun}${limit === 1 ? '' : 's'} a month, and you've used ${limit === 1 ? 'it' : 'them all'}.${upgrade}`,
    );
  }
}

export async function refundGeneration(pool: pg.Pool, userId: number, kind: GenerationKind) {
  await pool.query(
    `UPDATE ai_generation_usage SET count = GREATEST(count - 1, 0)
     WHERE user_id = $1 AND kind = $2 AND period_start = date_trunc('month', CURRENT_DATE)::date`,
    [userId, kind],
  );
}

export class PlanLimitError extends Error {
  constructor(
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = 'PlanLimitError';
  }
}

export async function getPlanSummary(pool: pg.Pool, userId: number) {
  const tier = await getUserPlanTier(pool, userId);
  const limits = PLAN_LIMITS[tier];
  const projects = await countUserProjects(pool, userId);
  const usage = await getReviewUsage(pool, userId);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const reviewsUsed =
    usage && new Date(usage.period_start) >= monthStart ? usage.ai_reviews_this_month : 0;
  const generations = await getGenerationUsage(pool, userId);
  return {
    tier,
    limits,
    usage: {
      projects,
      aiReviewsThisMonth: reviewsUsed,
      flowGenerationsThisMonth: generations.flow,
      screenDesignsThisMonth: generations.screen_design,
    },
  };
}

export function normalizeOwnerId(id: number | string) {
  return normalizeUserId(id);
}
