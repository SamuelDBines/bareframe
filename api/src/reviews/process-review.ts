import type pg from 'pg';
import {
  applyProjectCommand,
  createDefaultCommandContext,
  type ProjectDocument,
} from '@bareframe/designer-core';
import { isValidComponentSlug } from '../catalog/components.js';
import { getProjectById } from '../db/projects.js';
import { incrementReviewUsage } from '../plans/limits.js';

export type ReviewIssueCategory =
  | 'ux_problem'
  | 'missing_state'
  | 'drop_off_estimate'
  | 'accessibility'
  | 'design_consistency'
  | 'alternative_solution';

export type ReviewIssue = {
  id: string;
  category: ReviewIssueCategory;
  severity: 'critical' | 'major' | 'minor' | 'info';
  title: string;
  explanation: string;
  fix: string;
  frameId?: string;
  stepRef?: string;
  annotationId?: string;
  previewHint?: string;
  status: 'open' | 'resolved' | 'dismissed';
};

export type ReviewLlmAdapter = {
  completeJson<T>(input: { projectName: string; frameCount: number; pageCount: number }): Promise<T>;
};

export function createFixtureReviewLlm(project: ProjectDocument): ReviewLlmAdapter {
  return {
    async completeJson<T>() {
      const frames = project.project.frames;
      const firstFrame = frames[0];
      const issues: ReviewIssue[] = [
        {
          id: 'iss_ux_1',
          category: 'ux_problem',
          severity: 'major',
          title: 'Primary action competes with secondary nav',
          explanation:
            'Sign-in and the main CTA share visual weight on the landing screen, which can slow first-time comprehension.',
          fix: 'Demote secondary actions to ghost buttons and keep one primary CTA per viewport.',
          frameId: firstFrame?.id,
          status: 'open',
        },
        {
          id: 'iss_missing_1',
          category: 'missing_state',
          severity: 'major',
          title: 'No empty or error state on the queue screen',
          explanation: 'Users who have no scheduled posts will hit a dead end without guidance.',
          fix: 'Add an empty-state component with a single “Create first post” action.',
          status: 'open',
        },
        {
          id: 'iss_drop_1',
          category: 'drop_off_estimate',
          severity: 'info',
          title: 'Likely drop-off after sign-in code (estimate)',
          explanation:
            'Magic-link flows often lose users between email entry and code confirmation when there is no progress indicator.',
          fix: 'Add a 3-step progress header and resend-code affordance.',
          status: 'open',
        },
        {
          id: 'iss_a11y_1',
          category: 'accessibility',
          severity: 'minor',
          title: 'Focus order may skip hero inputs',
          explanation: 'WCAG 2.2 focus order should follow visual reading order on mobile.',
          fix: 'Ensure tab order: logo → primary field → primary button → secondary links.',
          status: 'open',
        },
        {
          id: 'iss_design_1',
          category: 'design_consistency',
          severity: 'minor',
          title: 'Mixed button styles detected',
          explanation: 'Some controls use browser-default styling instead of @bareframe/react tokens.',
          fix: 'Standardise on bf-btn primary/secondary variants from the active theme.',
          status: 'open',
        },
        {
          id: 'iss_alt_1',
          category: 'alternative_solution',
          severity: 'info',
          title: 'Consider OTP input component for codes',
          explanation: 'A segmented OTP field reduces errors versus a plain text input.',
          fix: 'Replace code field with @bareframe/react otp-input and scaffolded screen preview.',
          previewHint: 'otp-input',
          status: 'open',
        },
      ];
      return { issues } as T;
    },
  };
}

function newIssueId() {
  return `iss_${Math.random().toString(36).slice(2, 10)}`;
}

export async function processReviewRun(
  pool: pg.Pool,
  runId: string,
  userId: number,
  llm: ReviewLlmAdapter,
): Promise<void> {
  const { rows } = await pool.query<{
    project_id: string;
    previous_run_id: string | null;
  }>(`SELECT project_id, previous_run_id FROM review_runs WHERE id = $1 AND owner_user_id = $2`, [
    runId,
    userId,
  ]);
  const row = rows[0];
  if (!row) throw new Error('Review run not found');

  await pool.query(`UPDATE review_runs SET status = 'running' WHERE id = $1`, [runId]);

  try {
    const project = await getProjectById(pool, row.project_id);
    if (!project) throw new Error('Project not found');

    const doc = project.document as ProjectDocument;
    const out = await llm.completeJson<{ issues: ReviewIssue[] }>({
      projectName: project.name,
      frameCount: doc.project.frames.length,
      pageCount: doc.project.pages.length,
    });

    const ctx = createDefaultCommandContext(isValidComponentSlug);
    let document = doc;
    const issues: ReviewIssue[] = [];

    for (const template of out.issues) {
      const issue: ReviewIssue = {
        ...template,
        id: template.id || newIssueId(),
        status: template.status ?? 'open',
      };
      const frameId = issue.frameId ?? document.project.frames[0]?.id;
      if (frameId) {
        const ann = applyProjectCommand(
          document,
          {
            type: 'add_annotation',
            frameId,
            kind: 'callout',
            target: { kind: 'rect', x: 20, y: 64 + issues.length * 52, w: 300, h: 48 },
            text: `${issue.title}\n${issue.explanation}`,
          },
          ctx,
        );
        document = ann.document;
        const annotations = document.project.annotations;
        issue.annotationId = annotations[annotations.length - 1]?.id;
        issue.frameId = frameId;
      }
      issues.push(issue);
    }

    const newVersion = project.version + 1;
    await pool.query(`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`, [
      project.id,
      JSON.stringify(document),
      newVersion,
    ]);

    const summary = {
      open: issues.filter((i) => i.status === 'open').length,
      resolved: issues.filter((i) => i.status === 'resolved').length,
      dismissed: issues.filter((i) => i.status === 'dismissed').length,
      changedFromPrevious: Boolean(row.previous_run_id),
    };

    await pool.query(
      `UPDATE review_runs SET status = 'completed', issues = $2, summary = $3, completed_at = NOW() WHERE id = $1`,
      [runId, JSON.stringify(issues), JSON.stringify(summary)],
    );
    await incrementReviewUsage(pool, userId);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Review failed';
    await pool.query(`UPDATE review_runs SET status = 'failed', error_message = $2 WHERE id = $1`, [
      runId,
      message,
    ]);
    throw err;
  }
}

export async function createReviewRun(pool: pg.Pool, projectId: string, userId: number) {
  const { rows: prev } = await pool.query<{ id: string }>(
    `SELECT id FROM review_runs WHERE project_id = $1 AND status = 'completed' ORDER BY created_at DESC LIMIT 1`,
    [projectId],
  );
  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO review_runs (project_id, owner_user_id, previous_run_id)
     VALUES ($1, $2, $3) RETURNING id`,
    [projectId, userId, prev[0]?.id ?? null],
  );
  return rows[0]!.id;
}

export async function getReviewRun(pool: pg.Pool, runId: string, userId: number) {
  const { rows } = await pool.query(
    `SELECT * FROM review_runs WHERE id = $1 AND owner_user_id = $2`,
    [runId, userId],
  );
  return rows[0] ?? null;
}

export async function listReviewRuns(pool: pg.Pool, projectId: string, userId: number) {
  const { rows } = await pool.query(
    `SELECT id, status, summary, created_at, completed_at FROM review_runs
     WHERE project_id = $1 AND owner_user_id = $2 ORDER BY created_at DESC LIMIT 20`,
    [projectId, userId],
  );
  return rows;
}

export async function patchReviewIssue(
  pool: pg.Pool,
  runId: string,
  issueId: string,
  userId: number,
  status: 'open' | 'resolved' | 'dismissed',
) {
  const run = await getReviewRun(pool, runId, userId);
  if (!run) return null;
  const issues = run.issues as ReviewIssue[];
  const idx = issues.findIndex((i) => i.id === issueId);
  if (idx < 0) return null;
  issues[idx] = { ...issues[idx], status };
  await pool.query(`UPDATE review_runs SET issues = $2 WHERE id = $1`, [runId, JSON.stringify(issues)]);
  return issues[idx];
}
