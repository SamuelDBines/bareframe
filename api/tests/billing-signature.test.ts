import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import {
	STRIPE_WEBHOOK_TOLERANCE_SECONDS,
	signStripeWebhookPayload,
	verifyStripeWebhookSignature,
} from '../src/billing/signature.js';

/** Stripe-style fixture: v1 computed independently with the raw `whsec_…` secret as key. */
const FIXTURE = {
	secret: 'whsec_0K9v8RegressionFixtureSigningSecretBytes',
	timestamp: 1_700_000_000,
	payload: '{"id":"evt_fixture_01","type":"checkout.session.completed","livemode":false}',
} as const;

const FIXTURE_SIGNED_PAYLOAD = `${FIXTURE.timestamp}.${FIXTURE.payload}`;
const FIXTURE_V1 = createHmac('sha256', FIXTURE.secret)
	.update(FIXTURE_SIGNED_PAYLOAD, 'utf8')
	.digest('hex');
const FIXTURE_HEADER = `t=${FIXTURE.timestamp},v1=${FIXTURE_V1}`;

describe('Stripe webhook signature', () => {
	it('accepts a Stripe-style fixture (raw whsec secret as HMAC key)', () => {
		const result = verifyStripeWebhookSignature(FIXTURE.payload, FIXTURE_HEADER, FIXTURE.secret, {
			toleranceSeconds: STRIPE_WEBHOOK_TOLERANCE_SECONDS,
			nowSeconds: FIXTURE.timestamp,
		});
		expect(result).toEqual({ ok: true });
	});

	it('signStripeWebhookPayload matches independent HMAC for whsec secrets', () => {
		const secret = 'whsec_sign_helper_matches_stripe_bytes';
		const ts = 1_730_000_123;
		const body = '{"id":"evt_sign","object":"event"}';
		const header = signStripeWebhookPayload(body, secret, ts);
		const expectedV1 = createHmac('sha256', secret).update(`${ts}.${body}`, 'utf8').digest('hex');
		expect(header).toBe(`t=${ts},v1=${expectedV1}`);
		expect(verifyStripeWebhookSignature(body, header, secret, { nowSeconds: ts })).toEqual({ ok: true });
	});

	it('accepts any matching v1 when multiple are present', () => {
		const secret = 'whsec_multi_v1_header_check__________';
		const ts = 1_731_000_000;
		const body = '{"id":"evt_multi"}';
		const good = createHmac('sha256', secret).update(`${ts}.${body}`, 'utf8').digest('hex');
		const header = `t=${ts},v1=deadbeef,v1=${good}`;
		expect(verifyStripeWebhookSignature(body, header, secret, { nowSeconds: ts })).toEqual({ ok: true });
	});

	it('rejects timestamps outside tolerance', () => {
		const now = 1_800_000_000;
		const staleTs = now - STRIPE_WEBHOOK_TOLERANCE_SECONDS - 1;
		const body = FIXTURE.payload;
		const v1 = createHmac('sha256', FIXTURE.secret).update(`${staleTs}.${body}`, 'utf8').digest('hex');
		const header = `t=${staleTs},v1=${v1}`;
		expect(verifyStripeWebhookSignature(body, header, FIXTURE.secret, { nowSeconds: now })).toEqual({
			ok: false,
			reason: 'timestamp_outside_tolerance',
		});
	});
});
