import { createOpenAiCompatibleAdapter } from '@bareframe/package-generator';
import {
	FLOW_SPEC_SCHEMA_HINT,
	slugifyScreenId,
	type FlowPlatform,
	type FlowSpec,
} from '@bareframe/designer-core';
import type { Config } from '../config.js';

export type FlowGenerationInput = {
	description: string;
	platform: FlowPlatform;
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
- Every screen needs a short name (2–4 words), one-sentence purpose and 2–6 keyContent items.
- states: always "default"; add "empty", "loading", "error" or "success" where that screen has them.
- Connections use screen ids; trigger is the visible button or action label (1–4 words).
- Ids are short kebab-case and unique. Keep the ids of screens you keep when refining.
- Do not invent features the description does not imply.`;

function platformText(platform: FlowPlatform) {
	return platform === 'all' ? 'mobile, tablet and desktop' : platform;
}

export function buildFlowUserPrompt(input: FlowGenerationInput): string {
	const parts = [`Product description:\n${input.description}`, `Platform: ${platformText(input.platform)}`];
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
			if (input.current && input.instruction) {
				const match = /add (?:an? )?(.+?)(?: screen| page)?$/i.exec(input.instruction.trim());
				const name = (match?.[1] ?? 'New screen').replace(/^\w/, (c) => c.toUpperCase()).slice(0, 40);
				const id = slugifyScreenId(name);
				const last = input.current.screens[input.current.screens.length - 1];
				return {
					screens: [...input.current.screens, { id, name, purpose: `Added: ${input.instruction}`, keyContent: [name], states: ['default'] }],
					connections: [
						...input.current.connections,
						...(last ? [{ from: last.id, to: id, trigger: `Open ${name.toLowerCase()}` }] : []),
					],
				};
			}
			const product = input.description.split(/[.\n]/)[0]!.trim().slice(0, 60) || 'your product';
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
		},
	};
}

let testOverride: FlowLlm | null = null;

/** Tests only: replace the adapter (e.g. with one that returns malformed output). */
export function setFlowLlmForTests(llm: FlowLlm | null) {
	testOverride = llm;
}

export function flowLlmForConfig(config: Config): FlowLlm | null {
	if (testOverride) return testOverride;
	if (config.llmAdapter === 'disabled') return null;
	if (config.llmAdapter === 'openai_compatible') return createOpenAiCompatibleFlowLlm(config);
	return createFixtureFlowLlm();
}
