import type pg from 'pg';
import type { Config } from '../config.js';
import {
	findUserByStripeCustomerId,
	findUserByStripeSubscriptionId,
	markCheckoutCompleted,
	markSubscriptionActive,
	markSubscriptionEnded,
	recordStripeWebhookEvent,
} from './db.js';
import { verifyStripeWebhookSignature } from './signature.js';

type StripeEvent = {
	id: string;
	type: string;
	data: { object: Record<string, unknown> };
};

const PRO_STATUSES = new Set(['active', 'trialing']);
const DOWNGRADE_STATUSES = new Set(['canceled', 'unpaid', 'incomplete_expired']);

function stripeId(value: unknown): string | null {
	if (typeof value === 'string' && value) return value;
	if (value && typeof value === 'object' && 'id' in value && typeof (value as { id: unknown }).id === 'string') {
		return (value as { id: string }).id;
	}
	return null;
}

function resolveUserIdFromCheckout(session: Record<string, unknown>): number | null {
	const ref = session.client_reference_id;
	if (typeof ref === 'string' && ref.trim()) {
		const id = Number.parseInt(ref, 10);
		if (Number.isFinite(id) && id > 0) return id;
	}
	const meta = session.metadata;
	if (meta && typeof meta === 'object' && 'user_id' in meta) {
		const raw = (meta as { user_id: unknown }).user_id;
		const id = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw);
		if (Number.isFinite(id) && id > 0) return id;
	}
	return null;
}

async function onCheckoutSessionCompleted(pool: pg.Pool, session: Record<string, unknown>) {
	if (session.mode !== 'subscription') return;

	const userId = resolveUserIdFromCheckout(session);
	const customerId = stripeId(session.customer);
	const subscriptionId = stripeId(session.subscription);
	if (!userId || !customerId || !subscriptionId) {
		console.warn('[stripe] checkout.session.completed missing user, customer, or subscription', {
			userId,
			customerId: Boolean(customerId),
			subscriptionId: Boolean(subscriptionId),
		});
		return;
	}

	await markCheckoutCompleted(pool, userId, customerId, subscriptionId);
}

async function onSubscriptionChanged(pool: pg.Pool, sub: Record<string, unknown>) {
	const subscriptionId = stripeId(sub.id);
	const customerId = stripeId(sub.customer);
	const status = typeof sub.status === 'string' ? sub.status : null;
	if (!subscriptionId || !customerId || !status) return;

	let user =
		(await findUserByStripeSubscriptionId(pool, subscriptionId)) ??
		(await findUserByStripeCustomerId(pool, customerId));
	if (!user) return;

	if (PRO_STATUSES.has(status)) {
		await markSubscriptionActive(pool, user.id, customerId, subscriptionId, status);
		return;
	}

	if (DOWNGRADE_STATUSES.has(status)) {
		await markSubscriptionEnded(pool, user.id, status);
	}
}

async function onInvoicePaymentFailed(invoice: Record<string, unknown>) {
	const customerId = stripeId(invoice.customer);
	const subscriptionId = stripeId(invoice.subscription);
	console.warn('[stripe] invoice.payment_failed', {
		customerId,
		subscriptionId,
		invoiceId: stripeId(invoice.id),
	});
}

export async function handleStripeWebhook(
	pool: pg.Pool,
	config: Config,
	rawBody: string,
	signatureHeader: string | undefined,
): Promise<{ status: number; body: unknown }> {
	if (!config.stripeWebhookSecret) {
		return { status: 503, body: { error: 'webhook_not_configured' } };
	}

	const verified = verifyStripeWebhookSignature(rawBody, signatureHeader, config.stripeWebhookSecret);
	if (!verified.ok) {
		return { status: 400, body: { error: 'invalid_signature', reason: verified.reason } };
	}

	let event: StripeEvent;
	try {
		event = JSON.parse(rawBody) as StripeEvent;
	} catch {
		return { status: 400, body: { error: 'invalid_json' } };
	}

	if (!event?.id || !event?.type) {
		return { status: 400, body: { error: 'invalid_event' } };
	}

	const isNew = await recordStripeWebhookEvent(pool, event.id, event.type);
	if (!isNew) {
		return { status: 200, body: { received: true, duplicate: true } };
	}

	const object = event.data?.object ?? {};

	try {
		switch (event.type) {
			case 'checkout.session.completed':
				await onCheckoutSessionCompleted(pool, object);
				break;
			case 'customer.subscription.updated':
			case 'customer.subscription.deleted':
				await onSubscriptionChanged(pool, object);
				break;
			case 'invoice.payment_failed':
				await onInvoicePaymentFailed(object);
				break;
			default:
				break;
		}
	} catch (err) {
		console.error('[stripe] webhook handler error', event.type, err);
		return { status: 500, body: { error: 'handler_failed' } };
	}

	return { status: 200, body: { received: true } };
}
