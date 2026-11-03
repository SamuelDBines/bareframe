import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { createProjectAuthMiddleware, getActor } from '../projects/auth.js';
import { findUserBySessionToken } from '../db/index.js';
import { readSignedCookie, SESSION_COOKIE } from '../auth/cookies.js';
import { hashToken } from '../auth/crypto.js';
import { createCheckoutSession, stripeConfigured } from './stripe.js';

export function createBillingRouter(pool: pg.Pool, config: Config) {
  const auth = createProjectAuthMiddleware(pool, config);
  const router = new Hono();

  router.get('/billing/config', (c) =>
    c.json({
      stripeEnabled: stripeConfigured(config),
      priceLabel: '£20/month',
      planName: 'Bareframe Pro',
    }),
  );

  router.post('/billing/checkout', auth, async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const token = readSignedCookie(c, SESSION_COOKIE, config.sessionSecret);
    const user = token ? await findUserBySessionToken(pool, hashToken(token)) : null;
    const session = await createCheckoutSession(config, actor.userId, user?.email ?? null);
    if (session.disabled) {
      return c.json(session, 503);
    }
    return c.json(session);
  });

  return router;
}
