import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createApp } from '../src/app.js';
import { createPool } from '../src/db/index.js';
import { setupTestDb, testConfig, mockGitHubUser } from '../src/test-utils.js';
import { cookieHeaderFromResponse } from './helpers.js';
import type { GitHubClient } from '../src/auth/github.js';
import { resetPublicCheckRateLimitForTests } from '../src/public/check-url.js';

describe('journey AI review e2e', () => {
  let pool: ReturnType<typeof createPool>;
  let baseUrl = '';
  let server: Server;
  let sessionCookie = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.REVIEW_INLINE = '1';
    resetPublicCheckRateLimitForTests();
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    process.env.BAREFRAME_CATALOG_PATH =
      process.env.BAREFRAME_CATALOG_PATH ?? path.join(repoRoot, 'mcp/data/catalog.json');
    pool = createPool(testConfig);
    await setupTestDb(pool);

    const github: GitHubClient = {
      exchangeCode: async () => 'token',
      fetchUser: async () => mockGitHubUser(),
    };
    const app = createApp({ config: testConfig, pool, github });
    await new Promise<void>((resolve) => {
      server = serve({ fetch: app.fetch, port: 0 }, (info) => {
        baseUrl = `http://127.0.0.1:${info.port}`;
        resolve();
      });
    });

    const start = await fetch(`${baseUrl}/api/auth/github?returnTo=/`, { redirect: 'manual' });
    const location = start.headers.get('location')!;
    const oauthCookie = cookieHeaderFromResponse(start);
    const state = new URL(location).searchParams.get('state')!;
    const callback = await fetch(
      `${baseUrl}/api/auth/github/callback?code=ok&state=${encodeURIComponent(state)}`,
      { headers: { Cookie: oauthCookie }, redirect: 'manual' },
    );
    sessionCookie = cookieHeaderFromResponse(callback);
  });

  afterAll(async () => {
    server?.close();
    await pool.end();
  });

  it('runs a review pass and exposes public share + check-url', async () => {
    const created = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Review me' }),
    });
    expect(created.status).toBe(201);
    const project = (await created.json()) as { id: string };

    const review = await fetch(`${baseUrl}/api/projects/${project.id}/reviews`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    expect(review.status).toBe(202);
    const { runId } = (await review.json()) as { runId: string };

    const runRes = await fetch(`${baseUrl}/api/projects/${project.id}/reviews/${runId}`, {
      headers: { Cookie: sessionCookie },
    });
    const run = (await runRes.json()) as { status: string; issues: unknown[] };
    expect(run.status).toBe('completed');
    expect(run.issues.length).toBeGreaterThanOrEqual(4);

    const share = await fetch(`${baseUrl}/api/projects/${project.id}/share`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    expect(share.status).toBe(200);
    const { token } = (await share.json()) as { token: string };
    const publicShare = await fetch(`${baseUrl}/api/share/${token}`);
    expect(publicShare.status).toBe(200);

    const plan = await fetch(`${baseUrl}/api/plan`, { headers: { Cookie: sessionCookie } });
    const planJson = (await plan.json()) as { tier: string; usage: { aiReviewsThisMonth: number } };
    expect(planJson.tier).toBe('free');
    expect(planJson.usage.aiReviewsThisMonth).toBe(1);

    const check = await fetch(`${baseUrl}/api/public/check-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    expect(check.status).toBe(200);

    const review2 = await fetch(`${baseUrl}/api/projects/${project.id}/reviews`, {
      method: 'POST',
      headers: { Cookie: sessionCookie },
    });
    expect(review2.status).toBe(202);
    const { runId: runId2 } = (await review2.json()) as { runId: string };
    const run2 = await fetch(`${baseUrl}/api/projects/${project.id}/reviews/${runId2}`, {
      headers: { Cookie: sessionCookie },
    });
    const run2Json = (await run2.json()) as { summary?: { changedFromPrevious?: boolean; diff?: unknown } };
    expect(run2Json.summary?.changedFromPrevious).toBe(true);
    expect(run2Json.summary?.diff).toBeTruthy();
  }, 120_000);
});
