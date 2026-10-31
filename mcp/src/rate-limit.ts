import type { NextFunction, Request, Response } from 'express';
import type { Config } from './config.js';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function clientIp(req: Request): string {
	const forwarded = req.headers['x-forwarded-for'];
	if (typeof forwarded === 'string' && forwarded.length > 0) {
		return forwarded.split(',')[0]?.trim() ?? req.ip ?? 'unknown';
	}
	return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}

export function createRateLimiter(config: Config) {
	return (req: Request, res: Response, next: NextFunction) => {
		const ip = clientIp(req);
		const now = Date.now();
		let bucket = buckets.get(ip);
		if (!bucket || now >= bucket.resetAt) {
			bucket = { count: 0, resetAt: now + config.rateLimitWindowMs };
			buckets.set(ip, bucket);
		}
		bucket.count += 1;
		res.setHeader('X-RateLimit-Limit', String(config.rateLimitMax));
		res.setHeader('X-RateLimit-Remaining', String(Math.max(0, config.rateLimitMax - bucket.count)));
		res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));
		if (bucket.count > config.rateLimitMax) {
			res.status(429).json({ error: 'Too many requests — try again later.' });
			return;
		}
		next();
	};
}

/** @internal test helper */
export function resetRateLimitBucketsForTests() {
	buckets.clear();
}
