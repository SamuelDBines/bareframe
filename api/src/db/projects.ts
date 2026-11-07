import type pg from 'pg';
import {
	applyImportScreenshots,
	applyProjectCommand,
	CommandError,
	createDefaultCommandContext,
	createEmptyProjectDocument,
	defaultNewId,
	parseProjectCommand,
	type ProjectDocument,
} from '@bareframe/designer-core';
import { hashToken } from '../auth/crypto.js';
import { assertScreenCountForUser } from '../plans/limits.js';
import { mapProjectRow, normalizeUserId } from './normalize.js';

export type ProjectRow = {
	id: string;
	owner_user_id: number;
	name: string;
	document: ProjectDocument;
	version: number;
	created_at: Date;
	updated_at: Date;
};

export type ProjectTokenRow = {
	id: string;
	project_id: string;
	name: string;
	token_prefix: string;
	token_hash: string;
	scopes: string[];
	allowed_origins: string[];
	created_at: Date;
	revoked_at: Date | null;
	last_used_at: Date | null;
};

export type ProjectAssetRow = {
	id: string;
	project_id: string;
	content_type: string;
	bytes: Buffer;
	byte_size: number;
	created_at: Date;
};

export type AuthActor =
	| { kind: 'user'; userId: number }
	| { kind: 'token'; userId: number; tokenId: string; projectId: string; scopes: string[] };

const MAX_ASSET_BYTES = 5 * 1024 * 1024;

export function normalizeDocument(raw: unknown, projectId: string, name: string): ProjectDocument {
	const parsed = raw as ProjectDocument;
	if (parsed?.schemaVersion === 1 && parsed.project) {
		parsed.project.id = projectId;
		parsed.project.name = name;
		if (!parsed.project.connectors) parsed.project.connectors = [];
		if (!parsed.project.annotations) parsed.project.annotations = [];
		return parsed;
	}
	return createEmptyProjectDocument(projectId, name, 'light', { newId: defaultNewId });
}

export async function listProjectsForUser(pool: pg.Pool, userId: number) {
	const { rows } = await pool.query<{
		id: string;
		name: string;
		version: number;
		updated_at: Date;
	}>(
		`SELECT id, name, version, updated_at FROM projects WHERE owner_user_id = $1 ORDER BY updated_at DESC`,
		[userId],
	);
	return rows;
}

export async function createProject(pool: pg.Pool, userId: number, name: string, themeId = 'light') {
	const doc = createEmptyProjectDocument('pending', name, themeId, { newId: defaultNewId });
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const { rows } = await client.query<ProjectRow>(
			`INSERT INTO projects (owner_user_id, name, document, version)
       VALUES ($1, $2, $3, 1)
       RETURNING *`,
			[userId, name, doc],
		);
		const row = rows[0]!;
		const document = normalizeDocument(row.document, row.id, name);
		document.project.id = row.id;
		await client.query(`UPDATE projects SET document = $2 WHERE id = $1`, [row.id, document]);
		await client.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, 1, $2, 'user', $3)`,
			[row.id, { type: 'bootstrap' }, String(userId)],
		);
		await client.query('COMMIT');
		return mapProjectRow({ ...row, document, version: 1 });
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export async function getProjectById(pool: pg.Pool, projectId: string): Promise<ProjectRow | null> {
	const { rows } = await pool.query<ProjectRow>(`SELECT * FROM projects WHERE id = $1`, [projectId]);
	const row = rows[0];
	if (!row) return null;
	const mapped = mapProjectRow(row);
	mapped.document = normalizeDocument(mapped.document, mapped.id, mapped.name);
	return mapped;
}

export async function assertProjectAccess(
	pool: pg.Pool,
	projectId: string,
	actor: AuthActor,
	requiredScope?: string,
): Promise<ProjectRow> {
	const project = await getProjectById(pool, projectId);
	if (!project) throw new ProjectAccessError('Project not found', 404);

	if (actor.kind === 'user') {
		if (project.owner_user_id !== normalizeUserId(actor.userId)) {
			throw new ProjectAccessError('Forbidden', 403);
		}
		return project;
	}

	if (actor.projectId !== projectId) {
		throw new ProjectAccessError('Token project mismatch', 403);
	}
	if (project.owner_user_id !== normalizeUserId(actor.userId)) {
		throw new ProjectAccessError('Forbidden', 403);
	}
	if (requiredScope && !tokenHasScope(actor.scopes, requiredScope)) {
		throw new ProjectAccessError('Insufficient scope', 403);
	}
	return project;
}

function tokenHasScope(scopes: string[], required: string): boolean {
	if (scopes.includes('projects:write')) return true;
	if (required === 'projects:read' && scopes.includes('projects:read')) return true;
	if (required === 'assets:upload' && scopes.includes('assets:upload')) return true;
	if (required === 'flowmap:write' && scopes.includes('flowmap:write')) return true;
	if (required === 'render' && scopes.includes('render')) return true;
	if (required === 'recordings:upload' && scopes.includes('recordings:upload')) return true;
	if (required === 'capture:write' && scopes.includes('capture:write')) return true;
	if (required === 'reviews:write' && scopes.includes('projects:write')) return true;
	return scopes.includes(required);
}

export class ProjectAccessError extends Error {
	constructor(
		message: string,
		public status: number,
	) {
		super(message);
	}
}

export class VersionConflictError extends Error {
	constructor(public currentVersion: number) {
		super('Version conflict');
		this.name = 'VersionConflictError';
	}
}

export type ApplyCommandInput = {
	projectId: string;
	baseVersion: number;
	command: unknown;
	actor: AuthActor;
	isValidComponentSlug: (slug: string) => boolean;
};

export async function applyProjectCommandTx(pool: pg.Pool, input: ApplyCommandInput) {
	await assertProjectAccess(pool, input.projectId, input.actor, 'projects:write');
	const command = parseProjectCommand(input.command);
	const ctx = createDefaultCommandContext(input.isValidComponentSlug);
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const { rows } = await client.query<ProjectRow>(
			`SELECT * FROM projects WHERE id = $1 FOR UPDATE`,
			[input.projectId],
		);
		const row = rows[0];
		if (!row) throw new ProjectAccessError('Project not found', 404);
		if (row.version !== input.baseVersion) {
			throw new VersionConflictError(row.version);
		}
		const document = normalizeDocument(row.document, row.id, row.name);
		let result;
		try {
			result = applyProjectCommand(document, command, ctx);
		} catch (err) {
			if (err instanceof CommandError) {
				throw new ProjectAccessError(err.message, 400);
			}
			throw err;
		}
		const nextVersion = row.version + 1;
		result.document.project.id = row.id;
		result.document.project.name = row.name;
		const ownerId = input.actor.userId;
		await assertScreenCountForUser(pool, ownerId, result.document);
		await client.query(
			`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`,
			[row.id, result.document, nextVersion],
		);
		const actorType = input.actor.kind === 'user' ? 'user' : 'token';
		const actorRef = input.actor.kind === 'user' ? String(input.actor.userId) : input.actor.tokenId;
		await client.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, $2, $3, $4, $5)`,
			[row.id, nextVersion, command, actorType, actorRef],
		);
		await client.query('COMMIT');
		return { version: nextVersion, document: result.document, effects: result.effects };
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export async function applyImportScreenshotsTx(
	pool: pg.Pool,
	input: {
		projectId: string;
		baseVersion: number;
		shots: { assetId: string; title?: string; url?: string }[];
		links: { fromAssetId: string; toAssetId: string; label?: string; trigger?: string }[];
		actor: AuthActor;
	},
) {
	await assertProjectAccess(pool, input.projectId, input.actor, 'projects:write');
	const ctx = createDefaultCommandContext(() => true);
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const { rows } = await client.query<ProjectRow>(
			`SELECT * FROM projects WHERE id = $1 FOR UPDATE`,
			[input.projectId],
		);
		const row = rows[0];
		if (!row) throw new ProjectAccessError('Project not found', 404);
		if (row.version !== input.baseVersion) throw new VersionConflictError(row.version);
		const document = normalizeDocument(row.document, row.id, row.name);
		const result = applyImportScreenshots(document, input.shots, input.links, ctx);
		const ownerId = input.actor.kind === 'user' ? input.actor.userId : input.actor.userId;
		await assertScreenCountForUser(pool, ownerId, result.document);
		const nextVersion = row.version + 1;
		await client.query(
			`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`,
			[row.id, result.document, nextVersion],
		);
		await client.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, $2, $3, 'import', $4)`,
			[
				row.id,
				nextVersion,
				{ type: 'import_screenshots', count: input.shots.length },
				input.actor.kind === 'user' ? String(input.actor.userId) : input.actor.tokenId,
			],
		);
		await client.query('COMMIT');
		return { version: nextVersion, document: result.document, effects: result.effects };
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export async function replaceProjectDocument(
	pool: pg.Pool,
	projectId: string,
	userId: number,
	document: ProjectDocument,
	baseVersion?: number,
) {
	const client = await pool.connect();
	try {
		await client.query('BEGIN');
		const { rows } = await client.query<ProjectRow>(
			`SELECT * FROM projects WHERE id = $1 AND owner_user_id = $2 FOR UPDATE`,
			[projectId, userId],
		);
		const row = rows[0];
		if (!row) throw new ProjectAccessError('Project not found', 404);
		if (baseVersion != null && row.version !== baseVersion) {
			throw new VersionConflictError(row.version);
		}
		document.project.id = row.id;
		document.project.name = row.name;
		await assertScreenCountForUser(pool, userId, document);
		const nextVersion = row.version + 1;
		await client.query(
			`UPDATE projects SET document = $2, version = $3, updated_at = NOW() WHERE id = $1`,
			[projectId, document, nextVersion],
		);
		await client.query(
			`INSERT INTO project_revisions (project_id, version, command, actor_type, actor_ref)
       VALUES ($1, $2, $3, 'user', $4)`,
			[projectId, nextVersion, { type: 'replace_document' }, String(userId)],
		);
		await client.query('COMMIT');
		return nextVersion;
	} catch (e) {
		await client.query('ROLLBACK');
		throw e;
	} finally {
		client.release();
	}
}

export async function findProjectToken(pool: pg.Pool, bearerToken: string) {
	if (!bearerToken.startsWith('bf_proj_')) return null;
	const { rows } = await pool.query<ProjectTokenRow & { owner_user_id: number }>(
		`
    SELECT t.*, p.owner_user_id
    FROM project_api_tokens t
    INNER JOIN projects p ON p.id = t.project_id
    WHERE t.token_hash = $1 AND t.revoked_at IS NULL
    `,
		[hashToken(bearerToken)],
	);
	const row = rows[0];
	if (!row) return null;
	return { ...row, owner_user_id: normalizeUserId(row.owner_user_id) };
}

export async function touchProjectToken(pool: pg.Pool, tokenId: string) {
	await pool.query(`UPDATE project_api_tokens SET last_used_at = NOW() WHERE id = $1`, [tokenId]);
}

export async function listProjectTokens(pool: pg.Pool, projectId: string, userId: number) {
	const project = await getProjectById(pool, projectId);
	if (!project || project.owner_user_id !== normalizeUserId(userId)) {
		throw new ProjectAccessError('Project not found', 404);
	}
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
     FROM project_api_tokens WHERE project_id = $1 ORDER BY created_at DESC`,
		[projectId],
	);
	return rows;
}

export async function createProjectToken(
	pool: pg.Pool,
	projectId: string,
	userId: number,
	name: string,
	scopes: string[],
	plaintextToken: string,
	allowedOrigins: string[] = [],
) {
	const project = await getProjectById(pool, projectId);
	if (!project || project.owner_user_id !== normalizeUserId(userId)) {
		throw new ProjectAccessError('Project not found', 404);
	}
	const tokenHash = hashToken(plaintextToken);
	const prefix = `${plaintextToken.slice(0, 16)}…`;
	const { rows } = await pool.query<{ id: string }>(
		`INSERT INTO project_api_tokens (project_id, name, token_prefix, token_hash, scopes, created_by_user_id, allowed_origins)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
		[projectId, name, prefix, tokenHash, scopes, userId, allowedOrigins],
	);
	return rows[0]!.id;
}

export async function revokeProjectToken(pool: pg.Pool, projectId: string, userId: number, tokenId: string) {
	const project = await getProjectById(pool, projectId);
	if (!project || project.owner_user_id !== normalizeUserId(userId)) {
		throw new ProjectAccessError('Project not found', 404);
	}
	await pool.query(
		`UPDATE project_api_tokens SET revoked_at = NOW()
     WHERE id = $1 AND project_id = $2 AND revoked_at IS NULL`,
		[tokenId, projectId],
	);
}

export async function insertProjectAsset(
	pool: pg.Pool,
	projectId: string,
	contentType: string,
	bytes: Buffer,
) {
	if (bytes.byteLength > MAX_ASSET_BYTES) {
		throw new ProjectAccessError('Asset too large (max 5MB)', 413);
	}
	const { rows } = await pool.query<{ id: string }>(
		`INSERT INTO project_assets (project_id, content_type, bytes, byte_size)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
		[projectId, contentType, bytes, bytes.byteLength],
	);
	return rows[0]!.id;
}

export async function getProjectAsset(pool: pg.Pool, projectId: string, assetId: string) {
	const { rows } = await pool.query<ProjectAssetRow>(
		`SELECT * FROM project_assets WHERE id = $1 AND project_id = $2`,
		[assetId, projectId],
	);
	return rows[0] ?? null;
}
