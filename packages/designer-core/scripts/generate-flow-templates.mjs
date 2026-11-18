#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', 'src', 'templateLibrary', 'flows');
fs.mkdirSync(root, { recursive: true });

const flows = [
	{
		id: 'sign-in',
		category: 'auth',
		title: 'Sign in',
		description: 'Log in, reset password, and reach the dashboard',
		screens: [
			['login', 'Log in', 'login', ['default', 'error']],
			['forgot-password', 'Forgot password', 'forgot-password', ['default']],
			['reset-password', 'Reset password', 'reset-password', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['default']],
		],
		connections: [
			['login', 'dashboard', 'Sign in'],
			['login', 'forgot-password', 'Forgot password?'],
			['forgot-password', 'reset-password', 'Send reset link'],
			['reset-password', 'login', 'Save password'],
		],
	},
	{
		id: 'sign-up',
		category: 'auth',
		title: 'Sign up and onboarding',
		description: 'Register, verify, set up profile, and land on dashboard',
		screens: [
			['register', 'Register', 'register', ['default', 'error']],
			['verify-email', 'Verify email', 'verify-email', ['default']],
			['onboarding', 'Onboarding', 'onboarding', ['default']],
			['profile-setup', 'Profile', 'profile-setup', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['default']],
		],
		connections: [
			['register', 'verify-email', 'Create account'],
			['verify-email', 'onboarding', 'Verify'],
			['onboarding', 'profile-setup', 'Continue'],
			['profile-setup', 'dashboard', 'Continue'],
		],
	},
	{
		id: 'checkout',
		category: 'commerce',
		title: 'Shop checkout',
		description: 'Browse, cart, checkout, and confirmation',
		screens: [
			['product-catalog', 'Catalog', 'product-catalog', ['default', 'empty']],
			['product-detail', 'Product', 'product-detail', ['default']],
			['cart', 'Cart', 'cart', ['default', 'empty']],
			['checkout', 'Checkout', 'checkout', ['default', 'error']],
			['order-confirmation', 'Confirmed', 'order-confirmation', ['success']],
		],
		connections: [
			['product-catalog', 'product-detail', 'Open product'],
			['product-detail', 'cart', 'Add to basket'],
			['cart', 'checkout', 'Checkout'],
			['checkout', 'order-confirmation', 'Place order'],
			['cart', 'product-catalog', 'Keep shopping'],
		],
	},
	{
		id: 'settings-account',
		category: 'app',
		title: 'Settings and account',
		description: 'Dashboard to settings, billing, security, and logout',
		screens: [
			['dashboard', 'Dashboard', 'dashboard', ['default']],
			['settings', 'Settings', 'settings', ['default']],
			['settings-billing', 'Billing', 'settings-billing', ['default']],
			['settings-security', 'Security', 'settings-security', ['default']],
			['logout', 'Log out', 'logout', ['default']],
		],
		connections: [
			['dashboard', 'settings', 'Settings'],
			['settings', 'settings-billing', 'Billing'],
			['settings', 'settings-security', 'Security'],
			['settings', 'logout', 'Log out'],
		],
	},
	{
		id: 'search-detail',
		category: 'content',
		title: 'Search to detail',
		description: 'Search, open a result, and view detail',
		screens: [
			['search', 'Search', 'search', ['default', 'empty']],
			['search-results', 'Results', 'search-results', ['default']],
			['record-detail', 'Detail', 'record-detail', ['default']],
		],
		connections: [
			['search', 'search-results', 'Search'],
			['search-results', 'record-detail', 'Open'],
			['record-detail', 'search-results', 'Back'],
		],
	},
	{
		id: 'magic-link-sign-in',
		category: 'auth',
		title: 'Magic link sign in',
		description: 'Email link login and dashboard',
		screens: [
			['login', 'Log in', 'login', ['default']],
			['verify-email', 'Check email', 'verify-email', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['default']],
		],
		connections: [
			['login', 'verify-email', 'Send magic link'],
			['verify-email', 'dashboard', 'Continue'],
		],
	},
	{
		id: 'sso-sign-in',
		category: 'auth',
		title: 'SSO sign in',
		description: 'Social login path',
		screens: [
			['login', 'Log in', 'login', ['default']],
			['two-factor', '2FA', 'two-factor', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['default']],
		],
		connections: [
			['login', 'two-factor', 'Continue with Google'],
			['two-factor', 'dashboard', 'Verify'],
		],
	},
	{
		id: 'invite-sign-up',
		category: 'onboarding',
		title: 'Invite acceptance',
		description: 'Accept invite and join workspace',
		screens: [
			['register', 'Join team', 'register', ['default']],
			['workspace-create', 'Workspace', 'workspace-create', ['default']],
			['invite-teammates', 'Invite', 'invite-teammates', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['default']],
		],
		connections: [
			['register', 'workspace-create', 'Create account'],
			['workspace-create', 'invite-teammates', 'Continue'],
			['invite-teammates', 'dashboard', 'Skip for now'],
		],
	},
	{
		id: 'plan-onboarding',
		category: 'onboarding',
		title: 'Plan selection onboarding',
		description: 'Pick a plan after signup',
		screens: [
			['plan-select', 'Choose plan', 'plan-select', ['default']],
			['pricing', 'Pricing', 'pricing', ['default']],
			['checkout', 'Checkout', 'checkout', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['success']],
		],
		connections: [
			['plan-select', 'pricing', 'See all plans'],
			['pricing', 'checkout', 'Choose plan'],
			['checkout', 'dashboard', 'Place order'],
		],
	},
	{
		id: 'guest-checkout',
		category: 'commerce',
		title: 'Guest checkout',
		description: 'Checkout without an account',
		screens: [
			['cart', 'Cart', 'cart', ['default']],
			['checkout', 'Checkout', 'checkout', ['default']],
			['payment-failure', 'Payment failed', 'payment-failure', ['error']],
			['order-confirmation', 'Confirmed', 'order-confirmation', ['success']],
		],
		connections: [
			['cart', 'checkout', 'Checkout'],
			['checkout', 'order-confirmation', 'Place order'],
			['checkout', 'payment-failure', 'Pay now'],
			['payment-failure', 'checkout', 'Try again'],
		],
	},
	{
		id: 'order-returns',
		category: 'commerce',
		title: 'Orders and returns',
		description: 'History and return flow',
		screens: [
			['order-history', 'Orders', 'order-history', ['default']],
			['order-confirmation', 'Order detail', 'order-confirmation', ['default']],
			['returns', 'Return', 'returns', ['default']],
		],
		connections: [
			['order-history', 'order-confirmation', 'View order'],
			['order-confirmation', 'returns', 'Start return'],
		],
	},
	{
		id: 'wishlist-shop',
		category: 'commerce',
		title: 'Wishlist',
		description: 'Save items and buy',
		screens: [
			['wishlist', 'Wishlist', 'wishlist', ['default', 'empty']],
			['product-detail', 'Product', 'product-detail', ['default']],
			['cart', 'Cart', 'cart', ['default']],
		],
		connections: [
			['wishlist', 'product-detail', 'Open product'],
			['product-detail', 'cart', 'Add to basket'],
		],
	},
	{
		id: 'saas-crud',
		category: 'app',
		title: 'List, detail, edit',
		description: 'Core SaaS CRUD journey',
		screens: [
			['dashboard', 'Dashboard', 'dashboard', ['default']],
			['list', 'List', 'list', ['default', 'empty']],
			['record-detail', 'Detail', 'record-detail', ['default']],
			['form-create', 'Edit', 'form-create', ['default', 'error']],
		],
		connections: [
			['dashboard', 'list', 'View all'],
			['list', 'record-detail', 'Open'],
			['record-detail', 'form-create', 'Edit'],
			['form-create', 'list', 'Save'],
		],
	},
	{
		id: 'upgrade-paywall',
		category: 'app',
		title: 'Upgrade flow',
		description: 'Hit paywall and upgrade',
		screens: [
			['dashboard', 'Dashboard', 'dashboard', ['default']],
			['upgrade-paywall', 'Upgrade', 'upgrade-paywall', ['default']],
			['pricing', 'Pricing', 'pricing', ['default']],
			['checkout', 'Checkout', 'checkout', ['default']],
		],
		connections: [
			['dashboard', 'upgrade-paywall', 'Upgrade'],
			['upgrade-paywall', 'pricing', 'See plans'],
			['pricing', 'checkout', 'Choose plan'],
		],
	},
	{
		id: 'cancel-subscription',
		category: 'app',
		title: 'Cancel subscription',
		description: 'Leave paid plan',
		screens: [
			['settings-billing', 'Billing', 'settings-billing', ['default']],
			['subscription-cancel', 'Cancel', 'subscription-cancel', ['default']],
			['dashboard', 'Dashboard', 'dashboard', ['default']],
		],
		connections: [
			['settings-billing', 'subscription-cancel', 'Cancel plan'],
			['subscription-cancel', 'dashboard', 'Confirm cancellation'],
		],
	},
	{
		id: 'social-feed',
		category: 'content',
		title: 'Social feed',
		description: 'Feed, post, comments, profile',
		screens: [
			['feed', 'Feed', 'feed', ['default']],
			['compose-post', 'Compose', 'compose-post', ['default']],
			['post-detail', 'Post', 'post-detail', ['default']],
			['comments', 'Comments', 'comments', ['default']],
			['user-profile', 'Profile', 'user-profile', ['default']],
		],
		connections: [
			['feed', 'compose-post', 'New post'],
			['feed', 'post-detail', 'Open post'],
			['post-detail', 'comments', 'View comments'],
			['post-detail', 'user-profile', 'View profile'],
		],
	},
	{
		id: 'messages-chat',
		category: 'content',
		title: 'Messages',
		description: 'Inbox and thread',
		screens: [
			['messages', 'Inbox', 'messages', ['default', 'empty']],
			['user-profile', 'Contact', 'user-profile', ['default']],
		],
		connections: [['messages', 'user-profile', 'Open contact']],
	},
	{
		id: 'booking',
		category: 'commerce',
		title: 'Book appointment',
		description: 'Search, slot, details, confirm',
		screens: [
			['booking-search', 'Services', 'booking-search', ['default']],
			['booking-slot', 'Pick time', 'booking-slot', ['default', 'empty']],
			['booking-details', 'Details', 'booking-details', ['default']],
			['booking-confirm', 'Confirm', 'booking-confirm', ['default', 'success']],
		],
		connections: [
			['booking-search', 'booking-slot', 'Continue'],
			['booking-slot', 'booking-details', 'Select time'],
			['booking-details', 'booking-confirm', 'Continue'],
		],
	},
	{
		id: 'booking-reschedule',
		category: 'commerce',
		title: 'Reschedule booking',
		description: 'Change an appointment',
		screens: [
			['booking-confirm', 'Booking', 'booking-confirm', ['default']],
			['booking-reschedule', 'Reschedule', 'booking-reschedule', ['default']],
			['booking-slot', 'New time', 'booking-slot', ['default']],
		],
		connections: [
			['booking-confirm', 'booking-reschedule', 'Reschedule'],
			['booking-reschedule', 'booking-slot', 'Choose new time'],
			['booking-slot', 'booking-confirm', 'Confirm'],
		],
	},
	{
		id: 'support-ticket',
		category: 'utility',
		title: 'Support request',
		description: 'Help centre to ticket',
		screens: [
			['help-center', 'Help', 'help-center', ['default']],
			['help-article', 'Article', 'help-article', ['default']],
			['contact-support', 'Contact', 'contact-support', ['default']],
			['ticket-submitted', 'Sent', 'ticket-submitted', ['success']],
			['my-tickets', 'My tickets', 'my-tickets', ['default']],
		],
		connections: [
			['help-center', 'help-article', 'Open article'],
			['help-article', 'contact-support', 'Still need help'],
			['contact-support', 'ticket-submitted', 'Send'],
			['ticket-submitted', 'my-tickets', 'View my requests'],
		],
	},
	{
		id: 'marketing-site',
		category: 'utility',
		title: 'Marketing site',
		description: 'Home, features, pricing, contact',
		screens: [
			['marketing-home', 'Home', 'marketing-home', ['default']],
			['features', 'Features', 'features', ['default']],
			['pricing', 'Pricing', 'pricing', ['default']],
			['contact', 'Contact', 'contact', ['default']],
			['legal-terms', 'Terms', 'legal-terms', ['default']],
		],
		connections: [
			['marketing-home', 'features', 'See features'],
			['marketing-home', 'pricing', 'See pricing'],
			['features', 'contact', 'Contact'],
			['pricing', 'marketing-home', 'Get started'],
		],
	},
	{
		id: 'blog',
		category: 'utility',
		title: 'Blog',
		description: 'List and read articles',
		screens: [
			['blog-list', 'Blog', 'blog-list', ['default']],
			['blog-post', 'Article', 'blog-post', ['default']],
		],
		connections: [['blog-list', 'blog-post', 'Read more']],
	},
	{
		id: 'mobile-shell',
		category: 'utility',
		title: 'Mobile app shell',
		description: 'Splash and tab shell',
		screens: [
			['splash', 'Splash', 'splash', ['default']],
			['tab-shell', 'Home', 'tab-shell', ['default']],
			['pull-refresh-list', 'List', 'pull-refresh-list', ['default']],
		],
		connections: [
			['splash', 'tab-shell', 'Continue'],
			['tab-shell', 'pull-refresh-list', 'Open list'],
		],
	},
];

for (const flow of flows) {
	const spec = {
		screens: flow.screens.map(([id, name, templateId, states]) => ({
			id,
			name,
			purpose: `Template: ${templateId}`,
			keyContent: [`${name} content`],
			states,
		})),
		connections: flow.connections.map(([from, to, trigger]) => ({ from, to, trigger })),
	};
	const defaults = Object.fromEntries(flow.screens.map(([, , templateId]) => [templateId, 'classic']));
	const body = `import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: '${flow.id}',
	category: '${flow.category}',
	title: '${flow.title.replace(/'/g, "\\'")}',
	description: '${flow.description.replace(/'/g, "\\'")}',
	spec: ${JSON.stringify(spec, null, '\t')},
	defaultScreenVariants: ${JSON.stringify(defaults, null, '\t')},
};

export default FLOW;
`;
	fs.writeFileSync(path.join(root, `${flow.id}.ts`), body);
}

console.log(`Wrote ${flows.length} flow templates`);