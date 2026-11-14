/** Error thrown by API helpers; carries HTTP status and the server's error code. */
export class ApiError extends Error {
	readonly status: number;
	readonly code: string | null;
	readonly serverMessage: string | null;

	constructor(status: number, code: string | null, serverMessage: string | null, fallback: string) {
		super(serverMessage ?? fallback);
		this.name = 'ApiError';
		this.status = status;
		this.code = code;
		this.serverMessage = serverMessage;
	}
}

export async function apiFail(res: Response, fallback: string): Promise<never> {
	const text = await res.text().catch(() => '');
	let code: string | null = null;
	let message: string | null = null;
	try {
		const data = JSON.parse(text) as { error?: string; message?: string; code?: string };
		code = data.error ?? data.code ?? null;
		message = data.message ?? null;
	} catch {
		/* HTML error page or empty body — never shown to people */
	}
	throw new ApiError(res.status, code, message, fallback);
}

export function isAiUnavailable(e: unknown): boolean {
	return e instanceof ApiError && (e.code === 'llm_not_configured' || (e.status === 503 && !e.code));
}

const PLAN_CODES = new Set([
	'project_limit',
	'review_limit',
	'upgrade_required',
	'flow_generation_limit',
	'screen_design_limit',
]);

/**
 * Copy people see when something fails. Raw server text, stack traces and config
 * hints never reach the UI; plan-limit messages are already written for people.
 */
export function friendlyError(e: unknown, fallback = 'Something went wrong. Please try again.'): string {
	if (e instanceof ApiError) {
		if (isAiUnavailable(e)) return 'AI features are taking a break on this workspace. Everything else still works.';
		if (e.status === 401) return 'Please sign in to continue.';
		if (e.status === 403 && e.code && PLAN_CODES.has(e.code) && e.serverMessage) return e.serverMessage;
		if (e.status === 429 || (e.code && PLAN_CODES.has(e.code))) {
			return e.serverMessage ?? 'You’ve reached your plan’s limit. Upgrade to keep going.';
		}
		if (e.status === 404) return 'We couldn’t find that. It may have been moved or deleted.';
		if (e.status >= 500) return 'We can’t reach Bareframe right now. Please try again in a moment.';
		return fallback;
	}
	if (e instanceof TypeError) return 'We can’t reach Bareframe right now. Check your connection and try again.';
	return fallback;
}
