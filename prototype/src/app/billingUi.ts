import { fetchBillingConfig, startProCheckout } from './reviewApi';

/** Shown when POST /api/billing/checkout returns 503 (Stripe not configured or checkout unavailable). */
export const UPGRADE_UNAVAILABLE_MESSAGE =
	'Upgrades open soon. Your free plan keeps working in the meantime.';

export type BillingOfferState = {
	stripeEnabled: boolean | null;
	priceLabel: string;
	planName: string;
};

export async function loadBillingOffer(): Promise<BillingOfferState> {
	try {
		const config = await fetchBillingConfig();
		return {
			stripeEnabled: Boolean(config.stripeEnabled),
			priceLabel: config.priceLabel,
			planName: config.planName,
		};
	} catch {
		return { stripeEnabled: false, priceLabel: '£20/month', planName: 'Bareframe Pro' };
	}
}

/** Returns a user-facing notice when checkout did not start; null when redirecting. */
export async function beginProCheckout(): Promise<string | null> {
	const result = await startProCheckout();
	if (result.checkoutUrl) {
		window.location.href = result.checkoutUrl;
		return null;
	}
	return result.message ?? UPGRADE_UNAVAILABLE_MESSAGE;
}
