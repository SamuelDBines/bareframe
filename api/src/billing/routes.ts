import { Hono } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { createProjectAuthMiddleware, getActor } from '../projects/auth.js';
import { findUserBySessionToken } from '../db/index.js';
import { readSignedCookie, SESSION_COOKIE } from '../auth/cookies.js';
import { hashToken } from '../auth/crypto.js';
import { getUserBillingRow } from './db.js';
import { createBillingPortalSession, createCheckoutSession, stripeConfigured } from './stripe.js';
import { handleStripeWebhook } from './webhook.js';

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
    const billing = await getUserBillingRow(pool, actor.userId);
    const session = await createCheckoutSession(
      config,
      actor.userId,
      user?.email ?? null,
      billing?.stripe_customer_id ?? null,
    );
    if (session.disabled) {
      return c.json(session, 503);
    }
    return c.json(session);
  });

  router.post('/billing/portal', auth, async (c) => {
    const actor = getActor(c);
    if (actor.kind === 'token') return c.json({ error: 'Forbidden' }, 403);
    const billing = await getUserBillingRow(pool, actor.userId);
    if (!billing?.stripe_customer_id) {
      return c.json(
        {
          error: 'no_stripe_customer',
          message: 'Billing is managed outside Stripe for this account, or you have not subscribed yet.',
        },
        400,
      );
    }
    const portal = await createBillingPortalSession(config, billing.stripe_customer_id);
    if (portal.disabled) {
      return c.json(portal, 503);
    }
    return c.json(portal);
  });

  router.post('/billing/webhook', async (c) => {
    const rawBody = await c.req.text();
    const signature = c.req.header('stripe-signature');
    const result = await handleStripeWebhook(pool, config, rawBody, signature);
    return c.json(result.body, result.status as 200 | 400 | 500 | 503);
  });

  return router;
}
