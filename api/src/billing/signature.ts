import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Verifies a Stripe webhook signature (t=...,v1=...) against the raw request body.
 * @see https://docs.stripe.com/webhooks/signatures
 */
export function verifyStripeWebhookSignature(
	rawBody: string,
	signatureHeader: string | undefined,
	webhookSecret: string,
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
