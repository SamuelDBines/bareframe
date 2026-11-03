import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { assertProjectAccess } from '../db/projects.js';
import { replaceProjectDocument } from '../db/projects.js';
import { publishProjectUpdate } from '../projects/events.js';
import { importFigmaIntoDocument } from './import-figma.js';
import { parseFigmaDesignUrl } from './parse-url.js';

async function resolveFigmaToken(
  pool: pg.Pool,
  config: Config,
  userId: number,
  bodyToken?: string,
): Promise<string | null> {
  if (bodyToken?.trim()) return bodyToken.trim();
  const { rows } = await pool.query<{ figma_personal_access_token: string | null }>(
    `SELECT figma_personal_access_token FROM users WHERE id = $1`,
    [userId],
  );
  const userToken = rows[0]?.figma_personal_access_token;
  if (userToken) return userToken;
  return config.figmaAccessToken ?? null;
}

export function createFigmaRouter(pool: pg.Pool, config: Config) {
  const auth = createProjectAuthMiddleware(pool, config);
  const router = new Hono();
  router.use('*', auth);

  router.put('/me/figma-token', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const body = await c.req.json<{ token?: string }>();
    const token = body.token?.trim() ?? null;
    await pool.query(`UPDATE users SET figma_personal_access_token = $2 WHERE id = $1`, [
      actor.userId,
      token,
    ]);
    return c.json({ ok: true, configured: Boolean(token) });
  });

  router.get('/me/figma-token', async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const { rows } = await pool.query<{ figma_personal_access_token: string | null }>(
      `SELECT figma_personal_access_token FROM users WHERE id = $1`,
      [actor.userId],
    );
    const hasUser = Boolean(rows[0]?.figma_personal_access_token);
    return c.json({
      configured: hasUser || Boolean(config.figmaAccessToken),
      source: hasUser ? 'user' : config.figmaAccessToken ? 'server' : null,
    });
  });

  router.post('/projects/:projectId/figma-import', async (c) => {
    try {
      const actor = getActor(c);
      if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
      const projectId = c.req.param('projectId');
      const project = await assertProjectAccess(pool, projectId, actor, 'projects:write');
      const body = await c.req.json<{ url: string; token?: string; baseVersion: number }>();
      if (!body.url?.trim()) return c.json({ error: 'url required' }, 400);
      if (!parseFigmaDesignUrl(body.url) && !body.url.includes('/design/demo')) {
        return c.json({ error: 'invalid_figma_url' }, 400);
      }
      const token = await resolveFigmaToken(pool, config, actor.userId, body.token);
      if (!token && !body.url.includes('/design/demo')) {
        return c.json(
          {
            error: 'figma_token_required',
            message:
              'Set a Figma personal access token in Settings or FIGMA_ACCESS_TOKEN on the server.',
          },
          400,
        );
      }
      const { document, result } = await importFigmaIntoDocument(
        project.document,
        project.name,
        body.url.trim(),
        token ?? 'fixture',
      );
      const version = await replaceProjectDocument(pool, projectId, actor.userId, document, body.baseVersion);
      publishProjectUpdate(projectId, version);
      return c.json({ version, ...result });
    } catch (err) {
      return handleProjectError(c, err);
    }
  });

  return router;
}
