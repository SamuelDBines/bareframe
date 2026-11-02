import type { LlmAdapter } from '../types.js';
export type OpenAiCompatibleConfig = {
    baseUrl: string;
    apiKey: string;
    model: string;
    maxAttempts?: number;
};
export declare function createOpenAiCompatibleAdapter(config: OpenAiCompatibleConfig): LlmAdapter;
