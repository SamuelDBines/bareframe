import {
	getFlowTemplate,
	type FlowDevice,
	type FlowPlatform,
	type FlowSpec,
	slugifyScreenId,
} from '@bareframe/designer-core';
import type { FlowGenerationInput } from './llm.js';

const KEYWORD_FLOWS: { pattern: RegExp; id: import('@bareframe/designer-core').FlowTemplateId }[] = [
	{ pattern: /\b(shop|store|checkout|cart|ecommerce|commerce)\b/i, id: 'checkout' },
	{ pattern: /\b(book|appointment|schedule)\b/i, id: 'booking' },
	{ pattern: /\b(support|help|ticket)\b/i, id: 'support-ticket' },
	{ pattern: /\b(marketing|landing|website)\b/i, id: 'marketing-site' },
	{ pattern: /\b(social|feed|post)\b/i, id: 'social-feed' },
	{ pattern: /\b(sign\s*up|signup|register|onboard)\b/i, id: 'sign-up' },
	{ pattern: /\b(sign\s*in|login|auth)\b/i, id: 'sign-in' },
];

function pickFlowId(description: string): import('@bareframe/designer-core').FlowTemplateId {
	const lower = description.toLowerCase();
	for (const row of KEYWORD_FLOWS) {
		if (row.pattern.test(lower)) return row.id;
	}
	return 'saas-crud';
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
	return getFlowTemplate(pickFlowId(input.description)).spec;
}

export function ruleFlowPlatforms(_platform: FlowPlatform, platforms?: FlowDevice[]) {
	return platforms?.length ? platforms : ['mobile'];
}