import type { Context, Next } from 'hono';
import type pg from 'pg';
import type { Config } from '../config.js';
import { readSignedCookie, SESSION_COOKIE } from '../auth/cookies.js';
import { hashToken } from '../auth/crypto.js';
import { findUserBySessionToken } from '../db/index.js';
import {
	findProjectToken,
	touchProjectToken,
	type AuthActor,
	ProjectAccessError,
} from '../db/projects.js';

export type ProjectAuthVariables = {
	actor: AuthActor;
};

export function createProjectAuthMiddleware(pool: pg.Pool, config: Config) {
	return async (c: Context, next: Next) => {
		const authHeader = c.req.header('authorization');
		if (authHeader?.startsWith('Bearer ')) {
			const token = authHeader.slice('Bearer '.length).trim();
			const row = await findProjectToken(pool, token);
			if (!row) return c.json({ error: 'Invalid token' }, 401);
			await touchProjectToken(pool, row.id);
			const actor: AuthActor = {
				kind: 'token',
				userId: row.owner_user_id,
				tokenId: row.id,
				projectId: row.project_id,
				scopes: row.scopes ?? [],
			};
			c.set('actor', actor);
			return next();
		}

		const session = readSignedCookie(c, SESSION_COOKIE, config.sessionSecret);
		if (!session) return c.json({ error: 'Unauthorized' }, 401);
		const user = await findUserBySessionToken(pool, hashToken(session));
		if (!user) return c.json({ error: 'Unauthorized' }, 401);
		c.set('actor', { kind: 'user', userId: user.id } satisfies AuthActor);
		return next();
	};
}

export function getActor(c: Context): AuthActor {
	return c.get('actor') as AuthActor;
}

export function handleProjectError(c: Context, err: unknown) {
	if (err instanceof ProjectAccessError) {
		return c.json({ error: err.message }, err.status as 400);
	}
	if (err && typeof err === 'object' && (err as { name?: string }).name === 'VersionConflictError') {
		return c.json(
			{ error: 'Version conflict', currentVersion: (err as { currentVersion: number }).currentVersion },
			409,
		);
	}
	console.error(err);
	return c.json({ error: 'Internal server error' }, 500);
}
