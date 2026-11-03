import type { LlmAdapter, LlmRequest } from '../types.js';

export type OpenAiCompatibleConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  maxAttempts?: number;
};

export function createOpenAiCompatibleAdapter(config: OpenAiCompatibleConfig): LlmAdapter {
  const maxAttempts = config.maxAttempts ?? 3;
  const base = config.baseUrl.replace(/\/$/, '');

  return {
    kind: 'openai_compatible',
    async completeJson<T>(request: LlmRequest): Promise<T> {
      let lastError = 'Unknown error';
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const body = {
          model: config.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: `${request.system}\nReturn ONLY valid JSON matching: ${request.schemaHint}` },
            { role: 'user', content: request.user },
          ],
        };
        const res = await fetch(`${base}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${config.apiKey}`,
          },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          lastError = await res.text();
          continue;
        }
        const data = (await res.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        const content = data.choices?.[0]?.message?.content;
        if (!content) {
          lastError = 'Empty model response';
          continue;
        }
        try {
          return JSON.parse(content) as T;
        } catch {
          lastError = 'Invalid JSON from model';
        }
      }
      throw new Error(`LLM stage ${request.stage} failed after ${maxAttempts} attempts: ${lastError}`);
    },
  };
}
