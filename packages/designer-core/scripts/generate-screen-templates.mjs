#!/usr/bin/env node
/**
 * Generates one screen template file per screen under src/templateLibrary/screens/.
 * Run: node packages/designer-core/scripts/generate-screen-templates.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..', 'src', 'templateLibrary', 'screens');
fs.mkdirSync(root, { recursive: true });

const screens = [
	// auth
	['login', 'auth', 'Log in', 'Sign in to an existing account', 5],
	['register', 'auth', 'Register', 'Create a new account', 4],
	['forgot-password', 'auth', 'Forgot password', 'Request a password reset', 3],
	['reset-password', 'auth', 'Reset password', 'Choose a new password', 3],
	['verify-email', 'auth', 'Verify email', 'Confirm email or phone', 3],
	['two-factor', 'auth', 'Two-factor auth', 'Enter a second factor code', 3],
	['delete-account', 'auth', 'Delete account', 'Confirm account deletion', 2],
	['change-credentials', 'auth', 'Change credentials', 'Update email or password', 2],
	['logout', 'auth', 'Log out', 'Sign out confirmation', 2],
	// onboarding
	['onboarding', 'onboarding', 'Onboarding', 'Welcome and first steps', 3],
	['profile-setup', 'onboarding', 'Profile setup', 'Collect name and role', 3],
	['permissions-prompt', 'onboarding', 'Permissions', 'Notifications or location access', 2],
	['workspace-create', 'onboarding', 'Create workspace', 'Name a team workspace', 2],
	['invite-teammates', 'onboarding', 'Invite teammates', 'Send invites by email', 2],
	['plan-select', 'onboarding', 'Choose plan', 'Pick a subscription tier', 3],
	// commerce
	['product-catalog', 'commerce', 'Product catalog', 'Browse all products', 3],
	['category-browse', 'commerce', 'Category', 'Products in one category', 2],
	['search', 'commerce', 'Search', 'Find products or content', 3],
	['product-detail', 'commerce', 'Product detail', 'One item to buy', 3],
	['cart', 'commerce', 'Cart', 'Review basket before checkout', 3],
	['checkout', 'commerce', 'Checkout', 'Shipping and payment', 3],
	['payment', 'commerce', 'Payment', 'Pay with card or wallet', 2],
	['payment-failure', 'commerce', 'Payment failed', 'Retry or change method', 2],
	['order-confirmation', 'commerce', 'Order confirmed', 'Receipt and next steps', 2],
	['order-history', 'commerce', 'Order history', 'Past purchases', 2],
	['returns', 'commerce', 'Returns', 'Start a return request', 2],
	['wishlist', 'commerce', 'Wishlist', 'Saved items', 2],
	// app / saas
	['dashboard', 'app', 'Dashboard', 'Summary and shortcuts', 3],
	['list', 'app', 'List', 'Rows of items', 3],
	['record-detail', 'app', 'Detail', 'View one record', 3],
	['form-create', 'app', 'Create form', 'Add or edit a record', 3],
	['bulk-actions', 'app', 'Bulk actions', 'Select many rows', 2],
	['empty-state', 'utility', 'Empty state', 'No data yet', 4],
	['settings', 'app', 'Settings', 'Account preferences', 3],
	['settings-billing', 'app', 'Billing', 'Plan and invoices', 2],
	['settings-team', 'app', 'Team', 'Members and roles', 2],
	['settings-security', 'app', 'Security', 'Password and 2FA', 2],
	['api-keys', 'app', 'API keys', 'Tokens for integrations', 2],
	['upgrade-paywall', 'app', 'Upgrade', 'Pro feature gate', 2],
	['subscription-cancel', 'app', 'Cancel subscription', 'Offboarding from paid plan', 2],
	// content
	['feed', 'content', 'Feed', 'Timeline of posts', 2],
	['post-detail', 'content', 'Post', 'Single post thread', 2],
	['compose-post', 'content', 'Compose', 'Write a new post', 2],
	['comments', 'content', 'Comments', 'Thread under a post', 2],
	['user-profile', 'content', 'Profile', 'Public user page', 2],
	['follow-suggestions', 'content', 'Discover people', 'Who to follow', 2],
	['notifications', 'content', 'Notifications', 'Activity alerts', 2],
	['messages', 'content', 'Messages', 'Chat inbox', 2],
	['search-results', 'content', 'Search results', 'Query matches', 2],
	// booking
	['booking-search', 'commerce', 'Find availability', 'Pick service and date', 2],
	['booking-slot', 'commerce', 'Pick a slot', 'Choose time', 2],
	['booking-details', 'commerce', 'Your details', 'Contact for booking', 2],
	['booking-confirm', 'commerce', 'Confirm booking', 'Review and pay', 2],
	['booking-reschedule', 'commerce', 'Reschedule', 'Change appointment', 2],
	// support
	['help-center', 'utility', 'Help center', 'Search help articles', 2],
	['help-article', 'utility', 'Help article', 'Read an answer', 2],
	['contact-support', 'utility', 'Contact support', 'Send a message', 2],
	['ticket-submitted', 'utility', 'Ticket sent', 'Confirmation', 2],
	['my-tickets', 'utility', 'My tickets', 'Open requests', 2],
	// marketing
	['marketing-home', 'utility', 'Marketing home', 'Landing hero and CTA', 3],
	['features', 'utility', 'Features', 'Product capabilities', 2],
	['pricing', 'utility', 'Pricing', 'Plans and tiers', 3],
	['about', 'utility', 'About', 'Company story', 2],
	['contact', 'utility', 'Contact', 'Get in touch', 2],
	['blog-list', 'utility', 'Blog', 'Article index', 2],
	['blog-post', 'utility', 'Blog post', 'One article', 2],
	['legal-terms', 'utility', 'Terms of service', 'Legal terms', 1],
	['legal-privacy', 'utility', 'Privacy policy', 'Data use', 1],
	['cookies-banner', 'utility', 'Cookies', 'Consent banner', 1],
	['error-404', 'utility', 'Not found', '404 page', 2],
	['error-500', 'utility', 'Server error', '500 page', 2],
	['maintenance', 'utility', 'Maintenance', 'Downtime notice', 2],
	// mobile
	['splash', 'utility', 'Splash', 'App launch screen', 2],
	['tab-shell', 'utility', 'App shell', 'Tab bar navigation', 2],
	['pull-refresh-list', 'utility', 'Refresh list', 'Pull to refresh pattern', 2],
	['bottom-sheet', 'utility', 'Bottom sheet', 'Sheet over content', 2],
	['offline-state', 'utility', 'Offline', 'No network', 2],
	['generic-form', 'utility', 'Generic form', 'Fallback form layout', 2],
];

const variantNames = [
	['classic', 'Classic', 'Standard layout'],
	['compact', 'Compact', 'Tighter spacing'],
	['split', 'Split view', 'Hero beside form on large screens'],
	['social-first', 'Social first', 'SSO buttons prominent'],
	['minimal', 'Minimal', 'Fewest elements'],
];

function hotspotsFor(id, v, i) {
	const base = {
		login: ['Sign in', 'Forgot password?', 'Create account'],
		register: ['Create account', 'Sign in', 'Continue with Google'],
		'forgot-password': ['Send reset link', 'Back to sign in'],
		'reset-password': ['Save password', 'Back to sign in'],
		checkout: ['Continue', 'Place order', 'Pay now'],
		cart: ['Checkout', 'Keep shopping'],
		pricing: ['Choose plan', 'Contact sales'],
		'help-center': ['Search', 'Contact us'],
		'marketing-home': ['Get started', 'Sign in', 'See pricing'],
	};
	const h = base[id] ?? ['Continue', 'Back', 'Save'];
	if (v === 'social-first' && (id === 'login' || id === 'register')) {
		return ['Continue with Google', 'Continue with Apple', ...(id === 'login' ? ['Sign in'] : ['Create account'])];
	}
	if (v === 'minimal') return [h[0]];
	return i === 0 ? h : [h[0], h[1] ?? 'Back'];
}

for (const [id, category, title, description, variantCount] of screens) {
	const variants = [];
	for (let i = 0; i < variantCount; i++) {
		const [vid, vtitle, vsummary] = variantNames[i] ?? variantNames[0];
		const hotspots = hotspotsFor(id, vid, i);
		variants.push({ vid, vtitle, vsummary, hotspots, i });
	}
	const body = `import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: '${id}',
	category: '${category}',
	title: '${title}',
	description: '${description.replace(/'/g, "\\'")}',
	variants: [
${variants
	.map(
		(v) => `		variant(
			'${v.vid}',
			'${v.vtitle}',
			'${v.vsummary}',
			${JSON.stringify(v.hotspots)},
			(device: DesignDevice) =>
				n.stack([
					n.h1('${title.replace(/'/g, "\\'")}'),
					n.copy('${description.replace(/'/g, "\\'")}'),
					...(device !== 'phone' && '${v.vid}' === 'split'
						? [n.card('Highlight', 'Visual or summary for ${title.replace(/'/g, "\\'")}.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('${id}')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('${id}') ? [n.field('Search')] : []),
					${v.hotspots.map((h, hi) => `n.btn('${h.replace(/'/g, "\\'")}', '${hi === 0 ? 'primary' : 'secondary'}')`).join(',\n\t\t\t\t\t')},
				]),
		)`,
	)
	.join(',\n')}
	],
});
`;
	const legalOnly = variantCount === 1;
	const legalBody = `import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: '${id}',
	category: '${category}',
	title: '${title}',
	description: '${description.replace(/'/g, "\\'")}',
	variants: [
		variant('default', 'Default', 'Standard', ['Accept', 'Manage preferences'], () =>
			n.stack([n.h1('${title.replace(/'/g, "\\'")}'), n.copy('${description.replace(/'/g, "\\'")}.'), n.btn('Accept', 'primary')]),
		),
		variant('detailed', 'Detailed', 'More copy', ['Accept all', 'Reject non-essential'], () =>
			n.stack([
				n.h1('${title.replace(/'/g, "\\'")}'),
				n.card('Summary', 'Plain language summary of how we use data.'),
				n.btn('Accept all', 'primary'),
				n.btn('Reject non-essential', 'ghost'),
			]),
		),
	],
});
`;
	fs.writeFileSync(path.join(root, `${id}.ts`), legalOnly ? legalBody : body);
}

console.log(`Wrote ${screens.length} screen templates to ${root}`);