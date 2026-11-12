import type pg from 'pg';

export type UserBillingRow = {
	id: number;
	plan_tier: string;
	stripe_customer_id: string | null;
	stripe_subscription_id: string | null;
	stripe_subscription_status: string | null;
};

export async function getUserBillingRow(pool: pg.Pool, userId: number): Promise<UserBillingRow | null> {
	const { rows } = await pool.query<UserBillingRow>(
		`SELECT id, plan_tier, stripe_customer_id, stripe_subscription_id, stripe_subscription_status
     FROM users WHERE id = $1`,
		[userId],
	);
	return rows[0] ?? null;
}

export async function findUserByStripeCustomerId(
	pool: pg.Pool,
	customerId: string,
): Promise<UserBillingRow | null> {
	const { rows } = await pool.query<UserBillingRow>(
		`SELECT id, plan_tier, stripe_customer_id, stripe_subscription_id, stripe_subscription_status
     FROM users WHERE stripe_customer_id = $1`,
		[customerId],
	);
	return rows[0] ?? null;
}

export async function findUserByStripeSubscriptionId(
	pool: pg.Pool,
	subscriptionId: string,
): Promise<UserBillingRow | null> {
	const { rows } = await pool.query<UserBillingRow>(
		`SELECT id, plan_tier, stripe_customer_id, stripe_subscription_id, stripe_subscription_status
     FROM users WHERE stripe_subscription_id = $1`,
		[subscriptionId],
	);
	return rows[0] ?? null;
}

export async function recordStripeWebhookEvent(
	pool: pg.Pool,
	eventId: string,
	eventType: string,
): Promise<boolean> {
	const { rowCount } = await pool.query(
		`INSERT INTO stripe_webhook_events (event_id, event_type) VALUES ($1, $2)
     ON CONFLICT (event_id) DO NOTHING`,
		[eventId, eventType],
	);
	return (rowCount ?? 0) > 0;
}

export async function markCheckoutCompleted(
	pool: pg.Pool,
	userId: number,
	customerId: string,
	subscriptionId: string,
) {
	await pool.query(
		`UPDATE users SET
       plan_tier = 'pro',
       stripe_customer_id = $2,
       stripe_subscription_id = $3,
       stripe_subscription_status = 'active',
       updated_at = NOW()
     WHERE id = $1`,
		[userId, customerId, subscriptionId],
	);
}

/** Upgrade only affects users with a stored Stripe subscription (not manual Pro grants). */
export async function markSubscriptionActive(
	pool: pg.Pool,
	userId: number,
	customerId: string,
	subscriptionId: string,
	status: string,
) {
	await pool.query(
		`UPDATE users SET
       plan_tier = 'pro',
       stripe_customer_id = COALESCE(stripe_customer_id, $2),
       stripe_subscription_id = $3,
       stripe_subscription_status = $4,
       updated_at = NOW()
     WHERE id = $1 AND (stripe_subscription_id IS NOT NULL OR stripe_customer_id = $2)`,
		[userId, customerId, subscriptionId, status],
	);
}

/** Downgrade only users who were Pro via Stripe (have stripe_subscription_id). */
export async function markSubscriptionEnded(pool: pg.Pool, userId: number, status: string) {
	await pool.query(
		`UPDATE users SET
       plan_tier = 'free',
       stripe_subscription_status = $2,
       updated_at = NOW()
     WHERE id = $1 AND stripe_subscription_id IS NOT NULL`,
		[userId, status],
	);
}
