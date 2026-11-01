const buckets = new Map<string, { count: number; resetAt: number }>();

export type TokenRateLimitConfig = {
	max: number;
	windowMs: number;
};

export function createTokenRateLimiter(config: TokenRateLimitConfig) {
	return (tokenKey: string) => {
		const now = Date.now();
		let bucket = buckets.get(tokenKey);
		if (!bucket || now >= bucket.resetAt) {
			bucket = { count: 0, resetAt: now + config.windowMs };
			buckets.set(tokenKey, bucket);
		}
		bucket.count += 1;
		if (bucket.count > config.max) {
			return { allowed: false, retryAfterMs: bucket.resetAt - now };
		}
		return { allowed: true, remaining: config.max - bucket.count };
	};
}

export function resetTokenRateLimitBucketsForTests() {
	buckets.clear();
}
