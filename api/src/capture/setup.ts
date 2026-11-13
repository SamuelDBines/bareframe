import type pg from 'pg';
import { randomToken } from '../auth/crypto.js';
import { createProjectToken, getProjectById, ProjectAccessError } from '../db/projects.js';
import { normalizeUserId } from '../db/normalize.js';
import { normalizeOrigin } from './domain.js';
import { isAllowedPublicUrl } from '../render/ssrf.js';

const CAPTURE_SCOPES = ['capture:write', 'assets:upload', 'projects:read'];

export type WebsiteCaptureSetupResult = {
	tokenId: string;
	token: string;
	tokenPrefix: string;
	allowedOrigin: string;
	websiteUrl: string;
	ingestUrl: string;
	scopes: string[];
};

export async function setupWebsiteCapture(
	pool: pg.Pool,
	projectId: string,
	userId: number,
	websiteUrl: string,
	publicApiUrl: string,
): Promise<WebsiteCaptureSetupResult> {
	const project = await getProjectById(pool, projectId);
	if (!project || project.owner_user_id !== normalizeUserId(userId)) {
		throw new ProjectAccessError('Project not found', 404);
	}
	const trimmed = websiteUrl.trim();
	if (!trimmed) throw new ProjectAccessError('Website URL is required', 400);
	if (!isAllowedPublicUrl(trimmed)) {
		throw new ProjectAccessError('That URL cannot be used for capture (blocked or private).', 400);
	}
	const origin = normalizeOrigin(trimmed);
	if (!origin) throw new ProjectAccessError('Enter a valid http(s) website URL.', 400);

	const plaintext = `bf_proj_${randomToken(32)}`;
	const tokenId = await createProjectToken(
		pool,
		projectId,
		userId,
		'Website capture',
		CAPTURE_SCOPES,
		plaintext,
		[origin],
	);

	await pool.query(
		`INSERT INTO capture_flow_state (project_id, setup_origin, setup_url, updated_at)
     VALUES ($1, $2, $3, NOW())
     ON CONFLICT (project_id) DO UPDATE SET setup_origin = EXCLUDED.setup_origin, setup_url = EXCLUDED.setup_url, updated_at = NOW()`,
		[projectId, origin, trimmed],
	);

	return {
		tokenId,
		token: plaintext,
		tokenPrefix: `${plaintext.slice(0, 16)}…`,
		allowedOrigin: origin,
		websiteUrl: trimmed,
		ingestUrl: `${publicApiUrl}/api/v1/capture/events`,
		scopes: CAPTURE_SCOPES,
	};
}

export async function getWebsiteCaptureStatus(pool: pg.Pool, projectId: string) {
	const { rows: state } = await pool.query<{
		setup_origin: string | null;
		setup_url: string | null;
		page_id: string | null;
		updated_at: Date;
	}>(`SELECT setup_origin, setup_url, page_id, updated_at FROM capture_flow_state WHERE project_id = $1`, [
		projectId,
	]);
	const { rows: stats } = await pool.query<{
		total_events: string;
		distinct_urls: string;
		with_screenshots: string;
		last_captured_at: Date | null;
	}>(
		`SELECT
       COUNT(*)::text AS total_events,
       COUNT(DISTINCT url)::text AS distinct_urls,
       COUNT(*) FILTER (WHERE asset_id IS NOT NULL)::text AS with_screenshots,
       MAX(captured_at) AS last_captured_at
     FROM capture_events WHERE project_id = $1`,
		[projectId],
	);
	const { rows: tokens } = await pool.query<{ id: string; token_prefix: string; revoked_at: Date | null }>(
		`SELECT id, token_prefix, revoked_at FROM project_api_tokens
     WHERE project_id = $1 AND 'capture:write' = ANY(scopes) ORDER BY created_at DESC LIMIT 3`,
		[projectId],
	);
	return {
		setupOrigin: state[0]?.setup_origin ?? null,
		setupUrl: state[0]?.setup_url ?? null,
		flowPageId: state[0]?.page_id ?? null,
		updatedAt: state[0]?.updated_at ?? null,
		eventCount: Number(stats[0]?.total_events ?? 0),
		distinctUrlCount: Number(stats[0]?.distinct_urls ?? 0),
		screenshotCount: Number(stats[0]?.with_screenshots ?? 0),
		lastCapturedAt: stats[0]?.last_captured_at ?? null,
		captureTokens: tokens.map((t) => ({
			id: t.id,
			prefix: t.token_prefix,
			revoked: Boolean(t.revoked_at),
		})),
	};
}

export type InstallPrPreviewInput = {
	repo: string;
	branch: string;
	filePath?: string;
	snippetHtml: string;
};

export function buildInstallPrPreview(
	input: InstallPrPreviewInput,
	opts?: { githubAppConnected?: boolean },
) {
	const filePath = input.filePath?.trim() || 'index.html';
	const repo = input.repo.trim();
	const branch = input.branch.trim();
	if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
		throw new ProjectAccessError('Repo must look like owner/name', 400);
	}
	if (!branch) throw new ProjectAccessError('Branch is required', 400);

	const githubAppConnected = Boolean(opts?.githubAppConnected);

	return {
		simulated: !githubAppConnected,
		message: githubAppConnected
			? 'Pull request creation is available when the Bareframe GitHub App is installed on this repository with contents and pull request write access.'
			: 'Preview only — listing repos uses GitHub OAuth (repo scope). Opening a real pull request needs the Bareframe GitHub App (contents:write, pull_requests:write) installed on the target repository.',
		repo,
		baseBranch: branch,
		files: [
			{
				path: filePath,
				changeType: 'modify',
				patch: `@@ Bareframe capture snippet\n+${input.snippetHtml.split('\n').join('\n+')}`,
			},
		],
		requiredGitHubScopes: ['contents:write', 'pull_requests:write'],
		githubAppConnected,
	};
}
