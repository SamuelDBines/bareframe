import { createOpenAiCompatibleAdapter } from '@bareframe/package-generator';
import {
	DESIGN_SPEC_SCHEMA_HINT,
	type DesignDevice,
	type DesignTreeNode,
	type ScreenBrief,
} from '@bareframe/designer-core';
import type { Config } from '../config.js';

export type DesignGenerationInput = {
	productDescription: string;
	screenName: string;
	brief: ScreenBrief;
	device: DesignDevice;
	/** Trigger labels of links leaving this screen; buttons should use them so the prototype reads well. */
	outgoingActions: string[];
	feedback?: string[];
};

export type DesignLlm = {
	generateDesign(input: DesignGenerationInput): Promise<unknown>;
};

const DESIGN_SYSTEM = `You design one screen of a product using ONLY the Bareframe component set.
Write real, specific copy for this product (no lorem ipsum). Keep it accessible: every input has a
label, buttons say what they do, headings are in order (one level-1 heading).
Design the default state, plus each extra state listed for the screen (empty, loading, error, success).
Use the outgoing actions as button labels where they fit. Phone layouts are a single column; tablet
and desktop may use "row" for side-by-side content.`;

export function buildDesignUserPrompt(input: DesignGenerationInput): string {
	const parts = [
		`Product: ${input.productDescription}`,
		`Screen: ${input.screenName}`,
		`Purpose: ${input.brief.purpose || '(not given)'}`,
		`Key content: ${input.brief.keyContent.join('; ') || '(not given)'}`,
		`States to design: ${input.brief.states.join(', ')}`,
		`Device: ${input.device}`,
		`Outgoing actions: ${input.outgoingActions.join(', ') || '(none)'}`,
	];
	if (input.feedback?.length) {
		parts.push(`Your previous answer was invalid:\n- ${input.feedback.slice(0, 10).join('\n- ')}\nReturn corrected JSON.`);
	}
	return parts.join('\n');
}

export function createOpenAiCompatibleDesignLlm(config: Config): DesignLlm {
	if (!config.llmApiKey || !config.llmBaseUrl || !config.llmModel) {
		throw new Error('LLM is not configured. Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL.');
	}
	const adapter = createOpenAiCompatibleAdapter({ baseUrl: config.llmBaseUrl, apiKey: config.llmApiKey, model: config.llmModel });
	return {
		generateDesign: (input) =>
			adapter.completeJson<unknown>({
				stage: 'prototype',
				system: DESIGN_SYSTEM,
				user: buildDesignUserPrompt(input),
				schemaHint: DESIGN_SPEC_SCHEMA_HINT,
			}),
	};
}

/** Deterministic stand-in (LLM_ADAPTER=fixture): builds a plausible screen from the brief. */
export function createFixtureDesignLlm(): DesignLlm {
	return {
		async generateDesign(input) {
			const content = input.brief.keyContent
				.map((item): DesignTreeNode | null => {
				const lower = item.toLowerCase();
				if (/field|email|password|name|search/.test(lower) && !/button/.test(lower)) {
					const label = item.replace(/\s*field$/i, '');
					return { type: 'input', props: { label, placeholder: label } };
				}
				if (/button|link/.test(lower)) {
					const label = item.replace(/\s*(button|link)$/i, '');
					if (input.outgoingActions.some((a) => a.toLowerCase() === label.toLowerCase())) return null;
					return { type: 'button', props: { label, variant: 'secondary' } };
				}
				return { type: 'card', props: { title: item, body: `${item} for ${input.screenName.toLowerCase()}.` } };
				})
				.filter((node): node is DesignTreeNode => node !== null);
			const actions: DesignTreeNode[] = input.outgoingActions.map((label, i) => ({
				type: 'button',
				props: { label, variant: i === 0 ? 'primary' : 'secondary' },
			}));
			const states: Record<string, DesignTreeNode> = {
				default: {
					type: 'stack',
					gap: 16,
					padding: 24,
					children: [
						{ type: 'heading', level: 1, text: input.screenName },
						{ type: 'text', text: input.brief.purpose || input.screenName },
						...content,
						...(actions.length ? [{ type: 'row' as const, gap: 12, padding: 0, children: actions }] : []),
					],
				},
			};
			if (input.brief.states.includes('empty')) {
				states.empty = { type: 'stack', gap: 12, padding: 24, children: [{ type: 'heading', level: 1, text: input.screenName }, { type: 'text', text: 'Nothing here yet.' }] };
			}
			if (input.brief.states.includes('loading')) {
				states.loading = { type: 'stack', gap: 12, padding: 24, children: [{ type: 'text', text: 'Loading…' }] };
			}
			if (input.brief.states.includes('error')) {
				states.error = { type: 'stack', gap: 12, padding: 24, children: [{ type: 'alert', props: { text: 'Something went wrong. Try again.', variant: 'danger' } }] };
			}
			if (input.brief.states.includes('success')) {
				states.success = { type: 'stack', gap: 12, padding: 24, children: [{ type: 'alert', props: { text: 'Saved.', variant: 'success' } }] };
			}
			return { states };
		},
	};
}

let testOverride: DesignLlm | null = null;

/** Tests only: replace the adapter. */
export function setDesignLlmForTests(llm: DesignLlm | null) {
	testOverride = llm;
}

export function designLlmForConfig(config: Config): DesignLlm | null {
	if (testOverride) return testOverride;
	if (config.llmAdapter === 'disabled') return null;
	if (config.llmAdapter === 'openai_compatible') return createOpenAiCompatibleDesignLlm(config);
	return createFixtureDesignLlm();
}
