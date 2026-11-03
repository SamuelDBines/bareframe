import { describe, expect, it, beforeEach, afterAll } from 'vitest';
import pg from 'pg';
import { createTestApp, mockGitHubUser, setupTestDb, testConfig } from '../src/test-utils.js';
import { cookieHeaderFromResponse } from './helpers.js';
import type { GitHubClient } from '../src/auth/github.js';
import { vi } from 'vitest';

describe('figma import API', () => {
  const pool = new pg.Pool({ connectionString: testConfig.databaseUrl });
  let sessionCookie = '';
  const exchangeCode = vi.fn(async () => 'gh-token');
  const fetchUser = vi.fn(async () => mockGitHubUser());
  const github: GitHubClient = { exchangeCode, fetchUser };

  beforeEach(async () => {
    await setupTestDb(pool);
    const app = createTestApp(pool, github);
    const start = await app.request('/api/auth/github?returnTo=/');
    const oauthCookie = cookieHeaderFromResponse(start);
    const loc = start.headers.get('location');
    expect(loc).toBeTruthy();
    const state = new URL(loc!).searchParams.get('state')!;
    const callback = await app.request(
      `/api/auth/github/callback?code=ok&state=${encodeURIComponent(state)}`,
      { headers: { Cookie: oauthCookie } },
    );
    sessionCookie = cookieHeaderFromResponse(callback);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('imports demo fixture frames and connectors', async () => {
    const app = createTestApp(pool, github);
    const createRes = await app.request('/api/projects', {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Import test' }),
    });
    expect(createRes.status).toBe(201);
    const created = (await createRes.json()) as { id: string };
    const res = await app.request(`/api/projects/${created.id}/figma-import`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: 'https://www.figma.com/design/demo/Hookoh',
        baseVersion: 1,
      }),
    });
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      framesImported: number;
      connectorsImported: number;
      version: number;
    };
    expect(body.framesImported).toBe(3);
    expect(body.connectorsImported).toBe(2);
    expect(body.version).toBe(2);

    const get = await app.request(`/api/projects/${created.id}`, {
      headers: { Cookie: sessionCookie },
    });
    const project = (await get.json()) as {
      document: { project: { frames: unknown[]; connectors: unknown[] } };
    };
    expect(project.document.project.frames.length).toBe(3);
    expect(project.document.project.connectors.length).toBe(2);
  });
});
