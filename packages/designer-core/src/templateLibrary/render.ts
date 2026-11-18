import type { DesignDevice, DesignTreeNode } from '../designSpec.js';
import type { ScreenBrief } from '../types.js';
import { getScreenTemplate, listScreenTemplates } from './registry.js';
import type { ScreenTemplateId } from './types.js';

const NAME_TO_SCREEN: { pattern: RegExp; id: ScreenTemplateId }[] = [
	{ pattern: /\b(log\s*in|sign\s*in)\b/i, id: 'login' },
	{ pattern: /\b(sign\s*up|register|create account)\b/i, id: 'register' },
	{ pattern: /\b(forgot|reset)\s*password\b/i, id: 'forgot-password' },
	{ pattern: /\breset\b.*\bpassword\b/i, id: 'reset-password' },
	{ pattern: /\b(verify|confirm)\s*(email|phone|otp)\b/i, id: 'verify-email' },
	{ pattern: /\bonboarding|welcome tour|get started\b/i, id: 'onboarding' },
	{ pattern: /\bdashboard|overview\b/i, id: 'dashboard' },
	{ pattern: /\bsettings|preferences\b/i, id: 'settings' },
	{ pattern: /\bprofile\b/i, id: 'user-profile' },
	{ pattern: /\b(cart|basket)\b/i, id: 'cart' },
	{ pattern: /\bcheckout\b/i, id: 'checkout' },
	{ pattern: /\b(order|confirmation|receipt)\b/i, id: 'order-confirmation' },
	{ pattern: /\bpricing|plans\b/i, id: 'pricing' },
	{ pattern: /\b(search results|results for)\b/i, id: 'search-results' },
	{ pattern: /\b(search|find)\b/i, id: 'search' },
	{ pattern: /\b(product)\s*detail\b/i, id: 'product-detail' },
	{ pattern: /\b(item|record)\s*detail\b/i, id: 'record-detail' },
	{ pattern: /\b(list|catalog|browse|feed|inbox)\b/i, id: 'list' },
	{ pattern: /\bempty\b/i, id: 'empty-state' },
	{ pattern: /\b404|not found\b/i, id: 'error-404' },
	{ pattern: /\bnotification/i, id: 'notifications' },
	{ pattern: /\bhelp|support|ticket/i, id: 'help-center' },
	{ pattern: /\bmessage|chat\b/i, id: 'messages' },
	{ pattern: /\bpayment\b/i, id: 'payment' },
	{ pattern: /\bsplash\b/i, id: 'splash' },
];

export function inferScreenTemplateId(screenName: string, purpose: string): ScreenTemplateId | null {
	const hay = `${screenName} ${purpose}`;
	for (const row of NAME_TO_SCREEN) {
		if (row.pattern.test(hay)) return row.id;
	}
	return null;
}

export function pickVariantId(
	templateId: ScreenTemplateId,
	brief: ScreenBrief,
	outgoingActions: string[],
	variantId?: string,
): string {
	const tpl = getScreenTemplate(templateId);
	if (variantId && tpl.variants.some((v) => v.id === variantId)) return variantId;
	const labels = new Set(outgoingActions.map((l) => l.toLowerCase()));
	for (const v of tpl.variants) {
		if (v.hotspots.some((h) => labels.has(h.toLowerCase()))) return v.id;
	}
	if (brief.keyContent.some((k) => /magic|sso|social|google|apple/i.test(k))) {
		const social = tpl.variants.find((v) => /social|sso|magic/i.test(v.id));
		if (social) return social.id;
	}
	return tpl.variants[0]!.id;
}

export function buildScreenVariantTree(
	templateId: ScreenTemplateId,
	variantId: string,
	device: DesignDevice,
): DesignTreeNode {
	const tpl = getScreenTemplate(templateId);
	const variant = tpl.variants.find((v) => v.id === variantId) ?? tpl.variants[0]!;
	return variant.build(device);
}

export function templateDesignStatesForBrief(
	screenName: string,
	brief: ScreenBrief,
	outgoingActions: string[],
	device: DesignDevice,
	variantId?: string,
): Record<string, DesignTreeNode> {
	const id = inferScreenTemplateId(screenName, brief.purpose) ?? inferScreenTemplateId(screenName, screenName);
	const templateId = id ?? 'generic-form';
	const vid = pickVariantId(templateId, brief, outgoingActions, variantId);
	const defaultTree = buildScreenVariantTree(templateId, vid, device);
	const states: Record<string, DesignTreeNode> = { default: defaultTree };
	if (brief.states.includes('empty')) {
		states.empty = buildScreenVariantTree('empty-state', 'classic', device);
	}
	if (brief.states.includes('loading')) {
		states.loading = buildScreenVariantTree('empty-state', 'compact', device);
	}
	if (brief.states.includes('error')) {
		states.error = buildScreenVariantTree('error-500', 'classic', device);
	}
	if (brief.states.includes('success')) {
		states.success = buildScreenVariantTree('order-confirmation', 'classic', device);
	}
	return states;
}

export function listTemplateScreensForApi() {
	return listScreenTemplates();
}