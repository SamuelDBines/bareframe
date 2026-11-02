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
  return {
    disabled: false as const,
    checkoutUrl: `${config.publicUrl}/api/billing/checkout/stub?userId=${userId}`,
    message:
      'Stripe checkout is wired behind STRIPE_SECRET_KEY and STRIPE_PRICE_ID. Configure those env vars to enable live Checkout Sessions.',
    successUrl,
    cancelUrl,
    customerEmail: email,
    priceId: config.stripePriceId,
  };
}
