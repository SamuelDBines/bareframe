import pg from 'pg';
import type { Config } from '../config.js';

export type UserRow = {
	id: number;
	github_id: string;
	login: string;
	name: string | null;
	avatar_url: string | null;
	email: string | null;
	created_at: Date;
	updated_at: Date;
};

export function createPool(config: Config): pg.Pool {
	return new pg.Pool({ connectionString: config.databaseUrl });
}

export async function upsertUser(
	pool: pg.Pool,
	data: {
		githubId: number;
		login: string;
		name: string | null;
		avatarUrl: string | null;
		email: string | null;
	},
): Promise<UserRow> {
	const { rows } = await pool.query<UserRow>(
		`
    INSERT INTO users (github_id, login, name, avatar_url, email, updated_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (github_id) DO UPDATE SET
      login = EXCLUDED.login,
      name = EXCLUDED.name,
      avatar_url = EXCLUDED.avatar_url,
      email = COALESCE(EXCLUDED.email, users.email),
      updated_at = NOW()
    RETURNING *
    `,
		[data.githubId, data.login, data.name, data.avatarUrl, data.email],
	);
	return rows[0]!;
}

export async function createSession(
	pool: pg.Pool,
	userId: number,
	tokenHash: string,
	expiresAt: Date,
): Promise<void> {
	await pool.query(
		`INSERT INTO sessions (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
		[userId, tokenHash, expiresAt],
	);
}

export async function deleteSessionByTokenHash(
	pool: pg.Pool,
	tokenHash: string,
): Promise<void> {
	await pool.query('DELETE FROM sessions WHERE token_hash = $1', [tokenHash]);
}

export async function findUserBySessionToken(
	pool: pg.Pool,
	tokenHash: string,
): Promise<UserRow | null> {
	const { rows } = await pool.query<UserRow>(
		`
    SELECT u.*
    FROM users u
    INNER JOIN sessions s ON s.user_id = u.id
    WHERE s.token_hash = $1 AND s.expires_at > NOW()
    `,
		[tokenHash],
	);
	return rows[0] ?? null;
}

export function toPublicUser(row: UserRow) {
	return {
		id: row.id,
		login: row.login,
		name: row.name,
		avatarUrl: row.avatar_url,
		email: row.email,
	};
}
