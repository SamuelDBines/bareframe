import type { Config } from '../config.js';

export function stripeConfigured(config: Config): boolean {
  return Boolean(config.stripeSecretKey && config.stripePriceId);
}

export async function createCheckoutSession(config: Config, userId: number, email: string | null) {
  if (!stripeConfigured(config)) {
    return { disabled: true as const, message: 'Stripe is not configured on this deployment.' };
  }
  const successUrl = `${config.publicUrl}/#/app?checkout=success`;
  const cancelUrl = `${config.publicUrl}/#/pricing?checkout=cancelled`;

  const params = new URLSearchParams({
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    'line_items[0][price]': config.stripePriceId!,
    'line_items[0][quantity]': '1',
    client_reference_id: String(userId),
  });
  if (email) params.set('customer_email', email);

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.stripeSecretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params,
  });
  const text = await res.text();
  if (!res.ok) {
    return {
      disabled: true as const,
      message: `Stripe checkout failed (${res.status}): ${text.slice(0, 240)}`,
    };
  }
  const session = JSON.parse(text) as { url?: string; id?: string };
  if (!session.url) {
    return { disabled: true as const, message: 'Stripe did not return a checkout URL.' };
  }
  return {
    disabled: false as const,
    checkoutUrl: session.url,
    sessionId: session.id,
    successUrl,
    cancelUrl,
  };
}
