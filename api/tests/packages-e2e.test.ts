import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { validateBareframePackage } from '@bareframe/package-contracts';
import { createApp } from '../src/app.js';
import { createPool } from '../src/db/index.js';
import { setupTestDb, testConfig } from '../src/test-utils.js';
import { resetPackageRateLimitForTests } from '../src/packages/routes.js';
import { resetPackageJobEventBusForTests } from '../src/packages/events.js';
import { cookieHeaderFromResponse } from './helpers.js';
import type { GitHubClient } from '../src/auth/github.js';
import { mockGitHubUser } from '../src/test-utils.js';

describe('product package generation e2e', () => {
  let pool: ReturnType<typeof createPool>;
  let baseUrl = '';
  let server: Server;
  let sessionCookie = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.PACKAGE_INLINE = '1';
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
    process.env.BAREFRAME_CATALOG_PATH =
      process.env.BAREFRAME_CATALOG_PATH ?? path.join(repoRoot, 'mcp/data/catalog.json');
    resetPackageJobEventBusForTests();
    resetPackageRateLimitForTests();
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
    expect(start.status).toBe(302);
    const location = start.headers.get('location');
    expect(location).toBeTruthy();
    const oauthCookie = cookieHeaderFromResponse(start);
    const state = new URL(location!).searchParams.get('state');
    expect(state).toBeTruthy();
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

  it('generates a barber booking package that validates', async () => {
    const gen = await fetch(`${baseUrl}/api/packages/generate`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idea: 'A barber booking site for walk-in shops with deposits',
        audience: 'Local barbers and their clients',
        answers: {},
      }),
    });
    expect(gen.status).toBe(202);
    const { jobId } = (await gen.json()) as { jobId: string };

    const jobRes = await fetch(`${baseUrl}/api/packages/jobs/${jobId}`, {
      headers: { Cookie: sessionCookie },
    });
    const job = (await jobRes.json()) as { status: string; packageId?: string };
    expect(job.status).toBe('completed');
    expect(job.packageId).toBeTruthy();

    const pkgRes = await fetch(`${baseUrl}/api/packages/${job.packageId}`, {
      headers: { Cookie: sessionCookie },
    });
    expect(pkgRes.status).toBe(200);
    const pkg = (await pkgRes.json()) as { document: Record<string, unknown>; designerProjectId: string };
    expect(pkg.designerProjectId).toBeTruthy();

    const validation = validateBareframePackage(pkg.document);
    if (!validation.ok) {
      console.error(validation.errors);
    }
    expect(validation.ok).toBe(true);
    expect(pkg.document.contract).toBe('bareframe.package');
    const journeys = pkg.document.journeys as unknown[];
    expect(journeys.length).toBeGreaterThanOrEqual(3);
    const screens = (pkg.document.prototype as { screens: unknown[] }).screens;
    expect(screens.length).toBeGreaterThanOrEqual(6);
  }, 120_000);
});
