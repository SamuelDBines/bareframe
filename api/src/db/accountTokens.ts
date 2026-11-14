import type pg from 'pg';
import { hashToken } from '../auth/crypto.js';
import { normalizeUserId } from './normalize.js';
import { ProjectAccessError } from './projects.js';

export type AccountTokenRow = {
	id: string;
	owner_user_id: number;
	name: string;
	token_prefix: string;
	token_hash: string;
	scopes: string[];
	created_at: Date;
	revoked_at: Date | null;
	last_used_at: Date | null;
};

export async function findAccountToken(pool: pg.Pool, bearerToken: string): Promise<AccountTokenRow | null> {
	if (!bearerToken.startsWith('bf_acc_')) return null;
	const { rows } = await pool.query<AccountTokenRow>(
		`
    SELECT * FROM user_api_tokens
    WHERE token_hash = $1 AND revoked_at IS NULL
    `,
		[hashToken(bearerToken)],
	);
	const row = rows[0];
	if (!row) return null;
	return { ...row, owner_user_id: normalizeUserId(row.owner_user_id) };
}

export async function touchAccountToken(pool: pg.Pool, tokenId: string) {
	await pool.query(`UPDATE user_api_tokens SET last_used_at = NOW() WHERE id = $1`, [tokenId]);
}

export async function listAccountTokens(pool: pg.Pool, userId: number) {
	const { rows } = await pool.query<{
		id: string;
		name: string;
		token_prefix: string;
		scopes: string[];
		created_at: Date;
		revoked_at: Date | null;
		last_used_at: Date | null;
	}>(
		`SELECT id, name, token_prefix, scopes, created_at, revoked_at, last_used_at
     FROM user_api_tokens WHERE owner_user_id = $1 ORDER BY created_at DESC`,
		[userId],
	);
	return rows;
}

export async function createAccountToken(
	pool: pg.Pool,
	userId: number,
	name: string,
	scopes: string[],
	plaintextToken: string,
) {
	const tokenHash = hashToken(plaintextToken);
	const prefix = `${plaintextToken.slice(0, 16)}…`;
	const { rows } = await pool.query<{ id: string }>(
		`INSERT INTO user_api_tokens (owner_user_id, name, token_prefix, token_hash, scopes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
		[userId, name, prefix, tokenHash, scopes],
	);
	return rows[0]!.id;
}

export async function revokeAccountToken(pool: pg.Pool, userId: number, tokenId: string) {
	const { rowCount } = await pool.query(
		`UPDATE user_api_tokens SET revoked_at = NOW()
     WHERE id = $1 AND owner_user_id = $2 AND revoked_at IS NULL`,
		[tokenId, userId],
	);
	if (!rowCount) throw new ProjectAccessError('Token not found', 404);
}