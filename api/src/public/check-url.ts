import { Hono } from 'hono';
import type pg from 'pg';
import { isAllowedPublicUrl } from '../render/ssrf.js';
import { auditPageMetrics } from '@bareframe/flow-map-engine';
import { capturePublicUrlCheck } from '../render/playwright-capture.js';

const publicChecks = new Map<string, number[]>();

function rateLimitOk(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const prev = publicChecks.get(key) ?? [];
  const inWindow = prev.filter((t) => now - t < windowMs);
  if (inWindow.length >= limit) return false;
  inWindow.push(now);
  publicChecks.set(key, inWindow);
  return true;
}

export function resetPublicCheckRateLimitForTests() {
  publicChecks.clear();
}

export function createPublicToolsRouter(pool: pg.Pool) {
  const router = new Hono();

  router.post('/public/check-url', async (c) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!rateLimitOk(`ip:${ip}`, 10, 60 * 60 * 1000)) {
      return c.json({ error: 'rate_limited', message: 'Too many URL checks. Try again later.' }, 429);
    }
    const body = await c.req.json<{ url: string }>();
    const url = body.url?.trim();
    if (!url) return c.json({ error: 'url is required' }, 400);
    if (!isAllowedPublicUrl(url)) return c.json({ error: 'url_not_allowed' }, 400);

    try {
      const captured = await capturePublicUrlCheck(url, 390, 844);
      const findings = auditPageMetrics(captured.metrics, {});
      await pool.query(
        `INSERT INTO url_check_log (url, is_public, result) VALUES ($1, true, $2)`,
        [url, JSON.stringify({ findings: findings.slice(0, 12), metrics: captured.metrics })],
      );
      return c.json({
        url,
        findings: findings.slice(0, 12),
        metrics: captured.metrics,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Check failed';
      return c.json({ error: 'check_failed', message }, 502);
    }
  });

  return router;
}
