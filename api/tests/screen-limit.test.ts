import { describe, expect, it, beforeAll, afterAll } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from '@hono/node-server';
import type { Server } from 'node:http';
import { createEmptyProjectDocument } from '@bareframe/designer-core';
import { createApp } from '../src/app.js';
import { createPool } from '../src/db/index.js';
import { setupTestDb, testConfig, mockGitHubUser } from '../src/test-utils.js';
import { cookieHeaderFromResponse } from './helpers.js';
import type { GitHubClient } from '../src/auth/github.js';

describe('free plan screen limit', () => {
  let pool: ReturnType<typeof createPool>;
  let baseUrl = '';
  let server: Server;
  let sessionCookie = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
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

  it('rejects saves with more than 10 screens on free tier', async () => {
    const created = await fetch(`${baseUrl}/api/projects`, {
      method: 'POST',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Screen cap' }),
    });
    const project = (await created.json()) as { id: string; version: number; document: { project: { pages: { id: string }[] } } };
    const doc = createEmptyProjectDocument(project.id, 'Screen cap', 'light');
    const pageId = doc.project.pages[0]!.id;
    doc.project.frames = Array.from({ length: 11 }, (_, i) => ({
      id: `frame-${i}`,
      name: `Screen ${i}`,
      pageId,
      x: i * 40,
      y: 40,
      width: 393,
      height: 852,
      devicePresetId: 'iphone-15',
      heightMode: 'fixed' as const,
      frameSetId: 'fs-1',
    }));

    const save = await fetch(`${baseUrl}/api/projects/${project.id}/document`, {
      method: 'PUT',
      headers: { Cookie: sessionCookie, 'Content-Type': 'application/json' },
      body: JSON.stringify({ document: doc, baseVersion: project.version }),
    });
    expect(save.status).toBe(429);
    const body = (await save.json()) as { error: string };
    expect(body.error).toBe('screen_limit');
  });
});
