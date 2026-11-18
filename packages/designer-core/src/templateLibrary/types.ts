import type { DesignDevice, DesignTreeNode } from '../designSpec.js';
import type { FlowSpec } from '../flowSpec.js';

/** Library version bumps when variants or hotspot names change. */
export const TEMPLATE_LIBRARY_VERSION = 1;

export const TEMPLATE_CATEGORIES = [
	'auth',
	'onboarding',
	'app',
	'content',
	'commerce',
	'utility',
] as const;
export type TemplateCategory = (typeof TEMPLATE_CATEGORIES)[number];

export type ScreenTemplateId =
	| 'about'
	| 'api-keys'
	| 'blog-list'
	| 'blog-post'
	| 'booking-confirm'
	| 'booking-details'
	| 'booking-reschedule'
	| 'booking-search'
	| 'booking-slot'
	| 'bottom-sheet'
	| 'bulk-actions'
	| 'cart'
	| 'category-browse'
	| 'change-credentials'
	| 'checkout'
	| 'comments'
	| 'compose-post'
	| 'contact'
	| 'contact-support'
	| 'cookies-banner'
	| 'dashboard'
	| 'delete-account'
	| 'empty-state'
	| 'error-404'
	| 'error-500'
	| 'features'
	| 'feed'
	| 'follow-suggestions'
	| 'forgot-password'
	| 'form-create'
	| 'generic-form'
	| 'help-article'
	| 'help-center'
	| 'invite-teammates'
	| 'legal-privacy'
	| 'legal-terms'
	| 'list'
	| 'login'
	| 'logout'
	| 'maintenance'
	| 'marketing-home'
	| 'messages'
	| 'my-tickets'
	| 'notifications'
	| 'offline-state'
	| 'onboarding'
	| 'order-confirmation'
	| 'order-history'
	| 'payment'
	| 'payment-failure'
	| 'permissions-prompt'
	| 'plan-select'
	| 'post-detail'
	| 'pricing'
	| 'product-catalog'
	| 'product-detail'
	| 'profile-setup'
	| 'pull-refresh-list'
	| 'record-detail'
	| 'register'
	| 'reset-password'
	| 'returns'
	| 'search'
	| 'search-results'
	| 'settings'
	| 'settings-billing'
	| 'settings-security'
	| 'settings-team'
	| 'splash'
	| 'subscription-cancel'
	| 'tab-shell'
	| 'ticket-submitted'
	| 'two-factor'
	| 'upgrade-paywall'
	| 'user-profile'
	| 'verify-email'
	| 'wishlist'
	| 'workspace-create';

export type FlowTemplateId =
	| 'blog'
	| 'booking'
	| 'booking-reschedule'
	| 'cancel-subscription'
	| 'checkout'
	| 'guest-checkout'
	| 'invite-sign-up'
	| 'magic-link-sign-in'
	| 'marketing-site'
	| 'messages-chat'
	| 'mobile-shell'
	| 'order-returns'
	| 'plan-onboarding'
	| 'saas-crud'
	| 'search-detail'
	| 'settings-account'
	| 'sign-in'
	| 'sign-up'
	| 'social-feed'
	| 'sso-sign-in'
	| 'support-ticket'
	| 'upgrade-paywall'
	| 'wishlist-shop';

export type ScreenTemplateVariantMeta = {
	id: string;
	title: string;
	summary: string;
	/** Button labels that connectors can target. */
	hotspots: readonly string[];
	build: (device: DesignDevice) => DesignTreeNode;
};

export type ScreenTemplateMeta = {
	id: ScreenTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	variants: readonly ScreenTemplateVariantMeta[];
};

export type FlowTemplateMeta = {
	id: FlowTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	spec: FlowSpec;
	defaultScreenVariants: Partial<Record<ScreenTemplateId, string>>;
};

export type ScreenTemplateListItem = {
	libraryVersion: number;
	id: ScreenTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	variants: { id: string; title: string; summary: string; hotspots: string[] }[];
};

export type FlowTemplateListItem = {
	libraryVersion: number;
	id: FlowTemplateId;
	category: TemplateCategory;
	title: string;
	description: string;
	screenCount: number;
	connectionCount: number;
};
