import { Hono } from 'hono';
import type pg from 'pg';
import { randomToken } from '../auth/crypto.js';
import {
	createAccountToken,
	listAccountTokens,
	revokeAccountToken,
} from '../db/accountTokens.js';
import type { Config } from '../config.js';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';

const DEFAULT_ACCOUNT_SCOPES = ['projects:create', 'projects:write', 'share:create'];

export function createAccountRouter(pool: pg.Pool, config: Config) {
	const auth = createProjectAuthMiddleware(pool, config);
	const router = new Hono();

	router.use('/account/*', auth);

	router.get('/account/tokens', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind !== 'user') return c.json({ error: 'Forbidden' }, 403);
			const tokens = await listAccountTokens(pool, actor.userId);
			return c.json({ tokens });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.post('/account/tokens', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind !== 'user') return c.json({ error: 'Forbidden' }, 403);
			const body = (await c.req
				.json<{ name?: string; scopes?: string[] }>()
				.catch(() => ({ name: undefined, scopes: undefined as string[] | undefined }))) as {
				name?: string;
				scopes?: string[];
			};
			const name = body.name?.trim() || 'MCP assistant';
			const scopes = body.scopes?.length ? body.scopes : DEFAULT_ACCOUNT_SCOPES;
			const plaintext = `bf_acc_${randomToken(32)}`;
			const id = await createAccountToken(pool, actor.userId, name, scopes, plaintext);
			return c.json({ id, token: plaintext, tokenPrefix: `${plaintext.slice(0, 16)}…`, scopes }, 201);
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	router.delete('/account/tokens/:tokenId', async (c) => {
		try {
			const actor = getActor(c);
			if (actor.kind !== 'user') return c.json({ error: 'Forbidden' }, 403);
			await revokeAccountToken(pool, actor.userId, c.req.param('tokenId'));
			return c.json({ ok: true });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	return router;
}