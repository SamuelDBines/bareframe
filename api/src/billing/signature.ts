import { createHmac, timingSafeEqual } from 'node:crypto';

/** Stripe default replay tolerance for webhook timestamps (seconds). */
export const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

export type VerifyStripeWebhookOptions = {
	/** Max age of `t=` in seconds (default {@link STRIPE_WEBHOOK_TOLERANCE_SECONDS}). */
	toleranceSeconds?: number;
	/** Override "now" for tests (unix seconds). */
	nowSeconds?: number;
};

/**
 * Stripe signs webhooks with HMAC-SHA256 using the full endpoint secret string
 * (including the `whsec_` prefix) as UTF-8 key material.
 */
export function signStripeWebhookPayload(
	rawBody: string,
	webhookSecret: string,
	timestamp = Math.floor(Date.now() / 1000),
): string {
	const signedPayload = `${timestamp}.${rawBody}`;
	const v1 = createHmac('sha256', webhookSecret).update(signedPayload, 'utf8').digest('hex');
	return `t=${timestamp},v1=${v1}`;
}

/**
 * Verifies a Stripe webhook signature (t=...,v1=...) against the raw request body.
 * @see https://docs.stripe.com/webhooks/signatures
 */
export function verifyStripeWebhookSignature(
	rawBody: string,
	signatureHeader: string | undefined,
	webhookSecret: string,
	options: VerifyStripeWebhookOptions = {},
): { ok: true } | { ok: false; reason: string } {
	if (!signatureHeader?.trim()) {
		return { ok: false, reason: 'missing_signature' };
	}

	const parts = new Map<string, string[]>();
	for (const piece of signatureHeader.split(',')) {
		const [k, v] = piece.split('=');
		if (!k || !v) continue;
		const list = parts.get(k) ?? [];
		list.push(v);
		parts.set(k, list);
	}

	const timestamp = parts.get('t')?.[0];
	const v1Signatures = parts.get('v1');
	if (!timestamp || !v1Signatures?.length) {
		return { ok: false, reason: 'malformed_signature' };
	}

	const ts = Number.parseInt(timestamp, 10);
	if (!Number.isFinite(ts)) {
		return { ok: false, reason: 'malformed_signature' };
	}

	const tolerance = options.toleranceSeconds ?? STRIPE_WEBHOOK_TOLERANCE_SECONDS;
	const now = options.nowSeconds ?? Math.floor(Date.now() / 1000);
	if (Math.abs(now - ts) > tolerance) {
		return { ok: false, reason: 'timestamp_outside_tolerance' };
	}

	const signedPayload = `${timestamp}.${rawBody}`;
	const expected = createHmac('sha256', webhookSecret).update(signedPayload, 'utf8').digest('hex');

	const expectedBuf = Buffer.from(expected, 'hex');
	for (const sig of v1Signatures) {
		try {
			const sigBuf = Buffer.from(sig, 'hex');
			if (sigBuf.length === expectedBuf.length && timingSafeEqual(sigBuf, expectedBuf)) {
				return { ok: true };
			}
		} catch {
			// invalid hex
		}
	}

	return { ok: false, reason: 'signature_mismatch' };
}
