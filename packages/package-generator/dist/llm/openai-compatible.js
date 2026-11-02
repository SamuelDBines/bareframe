export function createOpenAiCompatibleAdapter(config) {
    const maxAttempts = config.maxAttempts ?? 3;
    const base = config.baseUrl.replace(/\/$/, '');
    return {
        kind: 'openai_compatible',
        async completeJson(request) {
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
                const data = (await res.json());
                const content = data.choices?.[0]?.message?.content;
                if (!content) {
                    lastError = 'Empty model response';
                    continue;
                }
                try {
                    return JSON.parse(content);
                }
                catch {
                    lastError = 'Invalid JSON from model';
                }
            }
            throw new Error(`LLM stage ${request.stage} failed after ${maxAttempts} attempts: ${lastError}`);
        },
    };
}
