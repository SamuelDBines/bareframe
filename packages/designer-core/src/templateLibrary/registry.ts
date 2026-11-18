// AUTO screen ids: 78, flows: 23
import type { FlowTemplateId, FlowTemplateMeta, ScreenTemplateId, ScreenTemplateMeta } from './types.js';
import screen_about from './screens/about.js';
import screen_api_keys from './screens/api-keys.js';
import screen_blog_list from './screens/blog-list.js';
import screen_blog_post from './screens/blog-post.js';
import screen_booking_confirm from './screens/booking-confirm.js';
import screen_booking_details from './screens/booking-details.js';
import screen_booking_reschedule from './screens/booking-reschedule.js';
import screen_booking_search from './screens/booking-search.js';
import screen_booking_slot from './screens/booking-slot.js';
import screen_bottom_sheet from './screens/bottom-sheet.js';
import screen_bulk_actions from './screens/bulk-actions.js';
import screen_cart from './screens/cart.js';
import screen_category_browse from './screens/category-browse.js';
import screen_change_credentials from './screens/change-credentials.js';
import screen_checkout from './screens/checkout.js';
import screen_comments from './screens/comments.js';
import screen_compose_post from './screens/compose-post.js';
import screen_contact from './screens/contact.js';
import screen_contact_support from './screens/contact-support.js';
import screen_cookies_banner from './screens/cookies-banner.js';
import screen_dashboard from './screens/dashboard.js';
import screen_delete_account from './screens/delete-account.js';
import screen_empty_state from './screens/empty-state.js';
import screen_error_404 from './screens/error-404.js';
import screen_error_500 from './screens/error-500.js';
import screen_features from './screens/features.js';
import screen_feed from './screens/feed.js';
import screen_follow_suggestions from './screens/follow-suggestions.js';
import screen_forgot_password from './screens/forgot-password.js';
import screen_form_create from './screens/form-create.js';
import screen_generic_form from './screens/generic-form.js';
import screen_help_article from './screens/help-article.js';
import screen_help_center from './screens/help-center.js';
import screen_invite_teammates from './screens/invite-teammates.js';
import screen_legal_privacy from './screens/legal-privacy.js';
import screen_legal_terms from './screens/legal-terms.js';
import screen_list from './screens/list.js';
import screen_login from './screens/login.js';
import screen_logout from './screens/logout.js';
import screen_maintenance from './screens/maintenance.js';
import screen_marketing_home from './screens/marketing-home.js';
import screen_messages from './screens/messages.js';
import screen_my_tickets from './screens/my-tickets.js';
import screen_notifications from './screens/notifications.js';
import screen_offline_state from './screens/offline-state.js';
import screen_onboarding from './screens/onboarding.js';
import screen_order_confirmation from './screens/order-confirmation.js';
import screen_order_history from './screens/order-history.js';
import screen_payment from './screens/payment.js';
import screen_payment_failure from './screens/payment-failure.js';
import screen_permissions_prompt from './screens/permissions-prompt.js';
import screen_plan_select from './screens/plan-select.js';
import screen_post_detail from './screens/post-detail.js';
import screen_pricing from './screens/pricing.js';
import screen_product_catalog from './screens/product-catalog.js';
import screen_product_detail from './screens/product-detail.js';
import screen_profile_setup from './screens/profile-setup.js';
import screen_pull_refresh_list from './screens/pull-refresh-list.js';
import screen_record_detail from './screens/record-detail.js';
import screen_register from './screens/register.js';
import screen_reset_password from './screens/reset-password.js';
import screen_returns from './screens/returns.js';
import screen_search from './screens/search.js';
import screen_search_results from './screens/search-results.js';
import screen_settings from './screens/settings.js';
import screen_settings_billing from './screens/settings-billing.js';
import screen_settings_security from './screens/settings-security.js';
import screen_settings_team from './screens/settings-team.js';
import screen_splash from './screens/splash.js';
import screen_subscription_cancel from './screens/subscription-cancel.js';
import screen_tab_shell from './screens/tab-shell.js';
import screen_ticket_submitted from './screens/ticket-submitted.js';
import screen_two_factor from './screens/two-factor.js';
import screen_upgrade_paywall from './screens/upgrade-paywall.js';
import screen_user_profile from './screens/user-profile.js';
import screen_verify_email from './screens/verify-email.js';
import screen_wishlist from './screens/wishlist.js';
import screen_workspace_create from './screens/workspace-create.js';
import flow_blog from './flows/blog.js';
import flow_booking from './flows/booking.js';
import flow_booking_reschedule from './flows/booking-reschedule.js';
import flow_cancel_subscription from './flows/cancel-subscription.js';
import flow_checkout from './flows/checkout.js';
import flow_guest_checkout from './flows/guest-checkout.js';
import flow_invite_sign_up from './flows/invite-sign-up.js';
import flow_magic_link_sign_in from './flows/magic-link-sign-in.js';
import flow_marketing_site from './flows/marketing-site.js';
import flow_messages_chat from './flows/messages-chat.js';
import flow_mobile_shell from './flows/mobile-shell.js';
import flow_order_returns from './flows/order-returns.js';
import flow_plan_onboarding from './flows/plan-onboarding.js';
import flow_saas_crud from './flows/saas-crud.js';
import flow_search_detail from './flows/search-detail.js';
import flow_settings_account from './flows/settings-account.js';
import flow_sign_in from './flows/sign-in.js';
import flow_sign_up from './flows/sign-up.js';
import flow_social_feed from './flows/social-feed.js';
import flow_sso_sign_in from './flows/sso-sign-in.js';
import flow_support_ticket from './flows/support-ticket.js';
import flow_upgrade_paywall from './flows/upgrade-paywall.js';
import flow_wishlist_shop from './flows/wishlist-shop.js';

const SCREEN_TEMPLATES: ScreenTemplateMeta[] = [screen_about, screen_api_keys, screen_blog_list, screen_blog_post, screen_booking_confirm, screen_booking_details, screen_booking_reschedule, screen_booking_search, screen_booking_slot, screen_bottom_sheet, screen_bulk_actions, screen_cart, screen_category_browse, screen_change_credentials, screen_checkout, screen_comments, screen_compose_post, screen_contact, screen_contact_support, screen_cookies_banner, screen_dashboard, screen_delete_account, screen_empty_state, screen_error_404, screen_error_500, screen_features, screen_feed, screen_follow_suggestions, screen_forgot_password, screen_form_create, screen_generic_form, screen_help_article, screen_help_center, screen_invite_teammates, screen_legal_privacy, screen_legal_terms, screen_list, screen_login, screen_logout, screen_maintenance, screen_marketing_home, screen_messages, screen_my_tickets, screen_notifications, screen_offline_state, screen_onboarding, screen_order_confirmation, screen_order_history, screen_payment, screen_payment_failure, screen_permissions_prompt, screen_plan_select, screen_post_detail, screen_pricing, screen_product_catalog, screen_product_detail, screen_profile_setup, screen_pull_refresh_list, screen_record_detail, screen_register, screen_reset_password, screen_returns, screen_search, screen_search_results, screen_settings, screen_settings_billing, screen_settings_security, screen_settings_team, screen_splash, screen_subscription_cancel, screen_tab_shell, screen_ticket_submitted, screen_two_factor, screen_upgrade_paywall, screen_user_profile, screen_verify_email, screen_wishlist, screen_workspace_create];
const FLOW_TEMPLATES: FlowTemplateMeta[] = [flow_blog, flow_booking, flow_booking_reschedule, flow_cancel_subscription, flow_checkout, flow_guest_checkout, flow_invite_sign_up, flow_magic_link_sign_in, flow_marketing_site, flow_messages_chat, flow_mobile_shell, flow_order_returns, flow_plan_onboarding, flow_saas_crud, flow_search_detail, flow_settings_account, flow_sign_in, flow_sign_up, flow_social_feed, flow_sso_sign_in, flow_support_ticket, flow_upgrade_paywall, flow_wishlist_shop];

const screenById = new Map<ScreenTemplateId, ScreenTemplateMeta>(
	SCREEN_TEMPLATES.map((s) => [s.id, s]),
);
const flowById = new Map<FlowTemplateId, FlowTemplateMeta>(FLOW_TEMPLATES.map((f) => [f.id, f]));

export function listScreenTemplates(): ScreenTemplateMeta[] {
	return [...SCREEN_TEMPLATES];
}

export function getScreenTemplate(id: ScreenTemplateId): ScreenTemplateMeta {
	const tpl = screenById.get(id);
	if (!tpl) throw new Error(`Unknown screen template "${id}"`);
	return tpl;
}

export function listFlowTemplates(): FlowTemplateMeta[] {
	return [...FLOW_TEMPLATES];
}

export function getFlowTemplate(id: FlowTemplateId): FlowTemplateMeta {
	const tpl = flowById.get(id);
	if (!tpl) throw new Error(`Unknown flow template "${id}"`);
	return tpl;
}

export const SCREEN_TEMPLATE_IDS = ['about', 'api-keys', 'blog-list', 'blog-post', 'booking-confirm', 'booking-details', 'booking-reschedule', 'booking-search', 'booking-slot', 'bottom-sheet', 'bulk-actions', 'cart', 'category-browse', 'change-credentials', 'checkout', 'comments', 'compose-post', 'contact', 'contact-support', 'cookies-banner', 'dashboard', 'delete-account', 'empty-state', 'error-404', 'error-500', 'features', 'feed', 'follow-suggestions', 'forgot-password', 'form-create', 'generic-form', 'help-article', 'help-center', 'invite-teammates', 'legal-privacy', 'legal-terms', 'list', 'login', 'logout', 'maintenance', 'marketing-home', 'messages', 'my-tickets', 'notifications', 'offline-state', 'onboarding', 'order-confirmation', 'order-history', 'payment', 'payment-failure', 'permissions-prompt', 'plan-select', 'post-detail', 'pricing', 'product-catalog', 'product-detail', 'profile-setup', 'pull-refresh-list', 'record-detail', 'register', 'reset-password', 'returns', 'search', 'search-results', 'settings', 'settings-billing', 'settings-security', 'settings-team', 'splash', 'subscription-cancel', 'tab-shell', 'ticket-submitted', 'two-factor', 'upgrade-paywall', 'user-profile', 'verify-email', 'wishlist', 'workspace-create'] as const;
export const FLOW_TEMPLATE_IDS = ['blog', 'booking', 'booking-reschedule', 'cancel-subscription', 'checkout', 'guest-checkout', 'invite-sign-up', 'magic-link-sign-in', 'marketing-site', 'messages-chat', 'mobile-shell', 'order-returns', 'plan-onboarding', 'saas-crud', 'search-detail', 'settings-account', 'sign-in', 'sign-up', 'social-feed', 'sso-sign-in', 'support-ticket', 'upgrade-paywall', 'wishlist-shop'] as const;
