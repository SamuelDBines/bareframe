import {
	getFlowTemplate,
	slugifyScreenId,
	type FlowDevice,
	type FlowPlatform,
	type FlowSpec,
	type FlowTemplateId,
} from '@bareframe/designer-core';
import type { FlowGenerationInput } from './llm.js';

const CHECKOUT_FLOW: FlowSpec = {
	screens: [
		{ id: 'catalog', name: 'Catalog', purpose: 'Browse products', keyContent: ['Search', 'Category filters', 'Product grid'], states: ['default', 'empty'] },
		{ id: 'product', name: 'Product detail', purpose: 'Review one item', keyContent: ['Photos', 'Price', 'Add to cart'], states: ['default'] },
		{ id: 'cart', name: 'Cart', purpose: 'Review items before checkout', keyContent: ['Line items', 'Promo code', 'Checkout button'], states: ['default', 'empty'] },
		{ id: 'checkout', name: 'Checkout', purpose: 'Pay and confirm delivery', keyContent: ['Address', 'Payment', 'Place order'], states: ['default', 'error', 'success'] },
		{ id: 'confirmation', name: 'Order confirmed', purpose: 'Receipt and next steps', keyContent: ['Order number', 'Track shipment'], states: ['default'] },
	],
	connections: [
		{ from: 'catalog', to: 'product', trigger: 'Open product' },
		{ from: 'product', to: 'cart', trigger: 'Add to cart' },
		{ from: 'cart', to: 'checkout', trigger: 'Checkout' },
		{ from: 'checkout', to: 'confirmation', trigger: 'Place order' },
	],
};

const AUTH_APP_FLOW: FlowSpec = {
	screens: [
		{ id: 'welcome', name: 'Welcome', purpose: 'Introduce the product', keyContent: ['Value proposition', 'Get started'], states: ['default'] },
		{ id: 'sign-up', name: 'Sign up', purpose: 'Create an account', keyContent: ['Email field', 'Password field', 'Create account'], states: ['default', 'loading', 'error'] },
		{ id: 'login', name: 'Log in', purpose: 'Return to your account', keyContent: ['Email field', 'Password field', 'Sign in'], states: ['default', 'error'] },
		{ id: 'dashboard', name: 'Dashboard', purpose: 'See what needs attention', keyContent: ['Summary', 'Recent list', 'New action'], states: ['default', 'empty'] },
		{ id: 'settings', name: 'Settings', purpose: 'Manage account', keyContent: ['Profile', 'Notifications', 'Sign out'], states: ['default'] },
	],
	connections: [
		{ from: 'welcome', to: 'sign-up', trigger: 'Get started' },
		{ from: 'welcome', to: 'login', trigger: 'Sign in' },
		{ from: 'sign-up', to: 'dashboard', trigger: 'Create account' },
		{ from: 'login', to: 'dashboard', trigger: 'Sign in' },
		{ from: 'dashboard', to: 'settings', trigger: 'Settings' },
	],
};

const TEMPLATE_KEYWORD_FLOWS: { pattern: RegExp; id: FlowTemplateId }[] = [
	{ pattern: /\b(shop|store|checkout|cart|ecommerce|commerce)\b/i, id: 'checkout' },
	{ pattern: /\b(book|appointment|schedule)\b/i, id: 'booking' },
	{ pattern: /\b(support|help|ticket)\b/i, id: 'support-ticket' },
	{ pattern: /\b(marketing|landing|website)\b/i, id: 'marketing-site' },
	{ pattern: /\b(social|feed|post)\b/i, id: 'social-feed' },
	{ pattern: /\b(sign\s*up|signup|register|onboard)\b/i, id: 'sign-up' },
	{ pattern: /\b(sign\s*in|login|auth)\b/i, id: 'sign-in' },
];

function defaultFlow(description: string): FlowSpec {
	const product = description.split(/[.\n]/)[0]!.trim().slice(0, 60) || 'your product';
	return {
		screens: [
			{ id: 'welcome', name: 'Welcome', purpose: `Introduce ${product}`, keyContent: ['Value proposition', 'Get started button', 'Sign in link'], states: ['default'] },
			{ id: 'sign-up', name: 'Sign up', purpose: 'Create an account', keyContent: ['Email field', 'Password field', 'Create account button'], states: ['default', 'loading', 'error'] },
			{ id: 'home', name: 'Home', purpose: 'See what needs attention today', keyContent: ['Summary cards', 'Recent items list', 'New item button'], states: ['default', 'empty', 'loading'] },
			{ id: 'item-detail', name: 'Item detail', purpose: 'Review and edit one item', keyContent: ['Title', 'Details', 'Save button'], states: ['default', 'error'] },
			{ id: 'settings', name: 'Settings', purpose: 'Manage account and preferences', keyContent: ['Profile', 'Notifications', 'Sign out'], states: ['default', 'success'] },
		],
		connections: [
			{ from: 'welcome', to: 'sign-up', trigger: 'Get started' },
			{ from: 'sign-up', to: 'home', trigger: 'Create account' },
			{ from: 'home', to: 'item-detail', trigger: 'Open item' },
			{ from: 'item-detail', to: 'home', trigger: 'Save' },
			{ from: 'home', to: 'settings', trigger: 'Settings' },
		],
	};
}

function pickStarter(description: string): FlowSpec {
	const lower = description.toLowerCase();
	for (const row of TEMPLATE_KEYWORD_FLOWS) {
		if (row.pattern.test(lower)) return getFlowTemplate(row.id).spec;
	}
	if (/\b(shop|store|checkout|cart|ecommerce|commerce)\b/.test(lower)) return CHECKOUT_FLOW;
	if (/\b(auth|sign up|signup|login|saas|app|platform)\b/.test(lower)) return AUTH_APP_FLOW;
	return defaultFlow(description);
}

/** Keyword and platform based flow when no LLM is available. */
export function ruleBasedFlowSpec(input: FlowGenerationInput): unknown {
	if (input.current && input.instruction) {
		const match = /add (?:an? )?(.+?)(?: screen| page)?$/i.exec(input.instruction.trim());
		const name = (match?.[1] ?? 'New screen').replace(/^\w/, (c) => c.toUpperCase()).slice(0, 40);
		const id = slugifyScreenId(name);
		const last = input.current.screens[input.current.screens.length - 1];
		return {
			screens: [
				...input.current.screens,
				{ id, name, purpose: `Added from: ${input.instruction}`, keyContent: [name], states: ['default'] },
			],
			connections: [
				...input.current.connections,
				...(last ? [{ from: last.id, to: id, trigger: `Open ${name.toLowerCase()}` }] : []),
			],
		};
	}
	return pickStarter(input.description);
}

export function ruleFlowPlatforms(_platform: FlowPlatform, platforms?: FlowDevice[]) {
	return platforms?.length ? platforms : ['mobile'];
}