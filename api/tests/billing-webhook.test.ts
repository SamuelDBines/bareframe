import { createHmac } from 'node:crypto';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import type pg from 'pg';
import { createTestApp, setupTestDb, testConfig } from '../src/test-utils.js';
import { upsertUser } from '../src/db/index.js';

const WEBHOOK_SECRET = 'whsec_test_webhook_secret_for_unit_tests';

function signStripePayload(payload: string, secret: string, timestamp = Math.floor(Date.now() / 1000)) {
	const signed = `${timestamp}.${payload}`;
	const v1 = createHmac('sha256', secret).update(signed, 'utf8').digest('hex');
	return `t=${timestamp},v1=${v1}`;
}

function checkoutCompletedEvent(userId: number, customerId: string, subId: string, eventId = 'evt_checkout_1') {
	return {
		id: eventId,
		type: 'checkout.session.completed',
		data: {
			object: {
				mode: 'subscription',
				client_reference_id: String(userId),
				customer: customerId,
				subscription: subId,
				metadata: { user_id: String(userId) },
			},
		},
	};
}

function subscriptionEvent(
	type: 'customer.subscription.updated' | 'customer.subscription.deleted',
	subId: string,
	customerId: string,
	status: string,
	eventId: string,
) {
	return {
		id: eventId,
		type,
		data: {
			object: {
				id: subId,
				customer: customerId,
				status,
			},
		},
	};
}

describe('Stripe billing webhooks', () => {
	let pool: pg.Pool;
	const config = { ...testConfig, stripeWebhookSecret: WEBHOOK_SECRET };

	beforeAll(async () => {
		const pgMod = await import('pg');
		pool = new pgMod.default.Pool({ connectionString: testConfig.databaseUrl });
		await setupTestDb(pool);
	});

	beforeEach(async () => {
		await setupTestDb(pool);
	});

	afterAll(async () => {
		await pool.end();
	});

	async function userPlan(userId: number) {
		const { rows } = await pool.query<{ plan_tier: string; stripe_subscription_id: string | null }>(
			`SELECT plan_tier, stripe_subscription_id FROM users WHERE id = $1`,
			[userId],
		);
		return rows[0]!;
	}

	async function postWebhook(body: unknown, signature?: string) {
		const app = createTestApp(pool, {} as never, config);
		const payload = JSON.stringify(body);
		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
		};
		if (signature !== undefined) {
			headers['stripe-signature'] = signature;
		}
		return app.request('/api/billing/webhook', {
			method: 'POST',
			headers,
			body: payload,
		});
	}

	it('rejects webhooks with an invalid signature', async () => {
		const user = await upsertUser(pool, {
			githubId: 9001,
			login: 'buyer',
			name: null,
			avatarUrl: null,
			email: 'buyer@test',
		});
		const payload = JSON.stringify(checkoutCompletedEvent(user.id, 'cus_x', 'sub_x'));
		const res = await postWebhook(JSON.parse(payload), 't=1,v1=deadbeef');
		expect(res.status).toBe(400);
	});

	it('upgrades plan on checkout.session.completed', async () => {
		const user = await upsertUser(pool, {
			githubId: 9002,
			login: 'checkout-user',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const body = checkoutCompletedEvent(user.id, 'cus_checkout', 'sub_checkout');
		const payload = JSON.stringify(body);
		const res = await postWebhook(body, signStripePayload(payload, WEBHOOK_SECRET));
		expect(res.status).toBe(200);
		const plan = await userPlan(user.id);
		expect(plan.plan_tier).toBe('pro');
		expect(plan.stripe_subscription_id).toBe('sub_checkout');
	});

	it('downgrades on customer.subscription.deleted and ignores manual Pro users', async () => {
		const paying = await upsertUser(pool, {
			githubId: 9003,
			login: 'paying',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const manual = await upsertUser(pool, {
			githubId: 9004,
			login: 'manual-pro',
			name: null,
			avatarUrl: null,
			email: null,
		});
		await pool.query(`UPDATE users SET plan_tier = 'pro' WHERE id = $1`, [manual.id]);

		const checkoutPayload = JSON.stringify(
			checkoutCompletedEvent(paying.id, 'cus_paying', 'sub_paying', 'evt_co_pay'),
		);
		await postWebhook(JSON.parse(checkoutPayload), signStripePayload(checkoutPayload, WEBHOOK_SECRET));

		const deleted = subscriptionEvent(
			'customer.subscription.deleted',
			'sub_paying',
			'cus_paying',
			'canceled',
			'evt_sub_del',
		);
		const delPayload = JSON.stringify(deleted);
		const res = await postWebhook(deleted, signStripePayload(delPayload, WEBHOOK_SECRET));
		expect(res.status).toBe(200);

		expect((await userPlan(paying.id)).plan_tier).toBe('free');
		expect((await userPlan(manual.id)).plan_tier).toBe('pro');
		expect((await userPlan(manual.id)).stripe_subscription_id).toBeNull();
	});

	it('is idempotent for duplicate event ids', async () => {
		const user = await upsertUser(pool, {
			githubId: 9005,
			login: 'dupe',
			name: null,
			avatarUrl: null,
			email: null,
		});
		const body = checkoutCompletedEvent(user.id, 'cus_dupe', 'sub_dupe', 'evt_same_id');
		const payload = JSON.stringify(body);
		const sig = signStripePayload(payload, WEBHOOK_SECRET);
		const first = await postWebhook(body, sig);
		const second = await postWebhook(body, sig);
		expect(first.status).toBe(200);
		expect(second.status).toBe(200);
		const secondJson = (await second.json()) as { duplicate?: boolean };
		expect(secondJson.duplicate).toBe(true);
	});
});
