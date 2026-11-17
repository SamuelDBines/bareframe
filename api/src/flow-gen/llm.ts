import { createOpenAiCompatibleAdapter } from '@bareframe/package-generator';
import {
	FLOW_SPEC_SCHEMA_HINT,
	type FlowDevice,
	type FlowPlatform,
	type FlowSpec,
} from '@bareframe/designer-core';
import type { Config } from '../config.js';
import { NO_EMDASH_INSTRUCTION } from '../llm/copy-style.js';
import { ruleBasedFlowSpec } from './rule-flow.js';

export type FlowGenerationInput = {
	description: string;
	platform: FlowPlatform;
	/** Exact devices chosen, when more specific than `platform`. */
	platforms?: FlowDevice[];
	/** Follow-up such as "add a settings screen"; `current` is the flow to change. */
	instruction?: string;
	current?: FlowSpec;
	/** Validation problems from a previous attempt, for the retry. */
	feedback?: string[];
};

export type FlowLlm = {
	/** Returns the model's raw JSON; the caller validates and repairs it. */
	generateFlow(input: FlowGenerationInput): Promise<unknown>;
};

const FLOW_SYSTEM = `You are a senior product designer mapping the screens of a digital product.
From the product description, produce the user flow: the screens a user moves through and the
actions that take them from one screen to the next.
Rules:
- 4 to 14 screens; cover onboarding or sign-in only if the product needs it.
- Every screen needs a short name (2-4 words), one-sentence purpose and 2-6 keyContent items.
- states: always "default"; add "empty", "loading", "error" or "success" where that screen has them.
- Connections use screen ids; trigger is the visible button or action label (1-4 words).
- Ids are short kebab-case and unique. Keep the ids of screens you keep when refining.
- Do not invent features the description does not imply.
${NO_EMDASH_INSTRUCTION}`;

function platformText(platform: FlowPlatform, platforms?: FlowDevice[]) {
	const devices = platforms?.length ? platforms : platform === 'all' ? ['mobile', 'tablet', 'desktop'] : [platform];
	return devices.length > 1 ? `${devices.slice(0, -1).join(', ')} and ${devices.at(-1)}` : devices[0]!;
}

export function buildFlowUserPrompt(input: FlowGenerationInput): string {
	const parts = [`Product description:\n${input.description}`, `Platform: ${platformText(input.platform, input.platforms)}`];
	if (input.current && input.instruction) {
		parts.push(`Current flow (JSON):\n${JSON.stringify(input.current)}`);
		parts.push(
			`Change request:\n${input.instruction}\nReturn the complete updated flow, keeping unchanged screens and their ids.`,
		);
	}
	if (input.feedback?.length) {
		parts.push(`Your previous answer was invalid:\n- ${input.feedback.slice(0, 10).join('\n- ')}\nReturn corrected JSON.`);
	}
	return parts.join('\n\n');
}

export function createOpenAiCompatibleFlowLlm(config: Config): FlowLlm {
	if (!config.llmApiKey || !config.llmBaseUrl || !config.llmModel) {
		throw new Error('LLM is not configured. Set LLM_API_BASE_URL, LLM_API_KEY, and LLM_MODEL.');
	}
	const adapter = createOpenAiCompatibleAdapter({
		baseUrl: config.llmBaseUrl,
		apiKey: config.llmApiKey,
		model: config.llmModel,
	});
	return {
		generateFlow: (input) =>
			adapter.completeJson<unknown>({
				stage: 'prototype',
				system: FLOW_SYSTEM,
				user: buildFlowUserPrompt(input),
				schemaHint: FLOW_SPEC_SCHEMA_HINT,
			}),
	};
}

/**
 * Deterministic stand-in for development and tests (LLM_ADAPTER=fixture): a generic sign-up →
 * home → detail flow, and refine requests of the form "add a <name> screen".
 */
export function createFixtureFlowLlm(): FlowLlm {
	return {
		async generateFlow(input) {
			return ruleBasedFlowSpec(input);
		},
	};
}

let testOverride: FlowLlm | null = null;

/** Tests only: replace the adapter (e.g. with one that returns malformed output). */
export function setFlowLlmForTests(llm: FlowLlm | null) {
	testOverride = llm;
}

export function flowLlmForConfig(config: Config): FlowLlm {
	if (testOverride) return testOverride;
	if (config.llmAdapter === 'openai_compatible') {
		try {
			return createOpenAiCompatibleFlowLlm(config);
		} catch {
			return createFixtureFlowLlm();
		}
	}
	return createFixtureFlowLlm();
}

export function flowUsesLlm(config: Config): boolean {
	return config.llmAdapter === 'openai_compatible' && Boolean(config.llmApiKey && config.llmBaseUrl && config.llmModel);
}
