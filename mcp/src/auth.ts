import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import type { Config } from './config.js';
import type { McpScope } from './types.js';

function hashToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
	const ab = Buffer.from(a);
	const bb = Buffer.from(b);
	if (ab.length !== bb.length) return false;
	return timingSafeEqual(ab, bb);
}

export type AuthResult =
	| { ok: true; scopes: McpScope[]; tokenId: string }
	| { ok: false; status: number; message: string };

export function authenticateRequest(req: Request, config: Config): AuthResult {
	if (config.tokens.length === 0) {
		return {
			ok: false,
			status: 503,
			message: 'MCP tokens are not configured on this server',
		};
	}

	const header = req.headers.authorization;
	if (!header?.startsWith('Bearer ')) {
		return { ok: false, status: 401, message: 'Missing Bearer token' };
	}

	const presented = header.slice('Bearer '.length).trim();
	if (!presented) {
		return { ok: false, status: 401, message: 'Missing Bearer token' };
	}

	const presentedHash = hashToken(presented);
	for (const record of config.tokens) {
		if (safeEqual(hashToken(record.token), presentedHash)) {
			return { ok: true, scopes: record.scopes, tokenId: record.id };
		}
	}

	return { ok: false, status: 403, message: 'Invalid token' };
}

export function requireScopes(scopes: McpScope[], required: McpScope[]): boolean {
	return required.every((scope) => scopes.includes(scope));
}
