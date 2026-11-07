import type pg from 'pg';
import { insertProjectAsset, ProjectAccessError, type AuthActor } from '../db/projects.js';
import { isAllowedPublicUrl } from '../render/ssrf.js';
import { syncCaptureFlowMap } from './sync-flow.js';
import { eventUrlAllowed } from './domain.js';

export type CaptureEventInput = {
	sessionId: string;
	url: string;
	title?: string;
	screenshot?: string;
	viewport?: { width: number; height: number };
	clickedSelector?: string;
	navigatedFrom?: string;
	ts?: string | number;
};

const MAX_BATCH = 50;
const MAX_EVENTS_PER_PROJECT = 5000;

function parseScreenshotPayload(raw: string): { bytes: Buffer; contentType: string } | null {
	const trimmed = raw.trim();
	if (trimmed.startsWith('data:')) {
		const m = /^data:([^;]+);base64,(.+)$/s.exec(trimmed);
		if (!m) return null;
		return { contentType: m[1]!, bytes: Buffer.from(m[2]!, 'base64') };
	}
	if (/^[A-Za-z0-9+/=\s]+$/.test(trimmed) && trimmed.length > 64) {
		return { contentType: 'image/png', bytes: Buffer.from(trimmed.replace(/\s/g, ''), 'base64') };
	}
	return null;
}

async function resolveScreenshotAsset(
	pool: pg.Pool,
	projectId: string,
	screenshot?: string,
): Promise<string | null> {
	if (!screenshot?.trim()) return null;
	const parsed = parseScreenshotPayload(screenshot);
	if (parsed) {
		return insertProjectAsset(pool, projectId, parsed.contentType, parsed.bytes);
	}
	if (screenshot.startsWith('http://') || screenshot.startsWith('https://')) {
		if (!isAllowedPublicUrl(screenshot)) return null;
		const res = await fetch(screenshot, { redirect: 'follow' });
		if (!res.ok) return null;
		const buf = Buffer.from(await res.arrayBuffer());
		if (buf.byteLength > 5 * 1024 * 1024) return null;
		const contentType = res.headers.get('content-type') ?? 'image/png';
		return insertProjectAsset(pool, projectId, contentType.split(';')[0]!.trim(), buf);
	}
	return null;
}

export async function ingestCaptureEvents(
	pool: pg.Pool,
	projectId: string,
	events: CaptureEventInput[],
	allowedOrigins: string[] = [],
): Promise<{ accepted: number; rejectedOrigin: number; synced: boolean; version?: number }> {
	if (events.length === 0) return { accepted: 0, rejectedOrigin: 0, synced: false };
	if (events.length > MAX_BATCH) {
		throw new Error(`Too many events (max ${MAX_BATCH})`);
	}

	const { rows: countRows } = await pool.query<{ count: string }>(
		`SELECT COUNT(*)::text AS count FROM capture_events WHERE project_id = $1`,
		[projectId],
	);
	const existing = Number(countRows[0]?.count ?? 0);
	if (existing + events.length > MAX_EVENTS_PER_PROJECT) {
		throw new Error('Capture event limit reached for this project');
	}

	let accepted = 0;
	let rejectedOrigin = 0;
	for (const ev of events) {
		if (!ev.sessionId?.trim() || !ev.url?.trim()) continue;
		if (allowedOrigins.length && !eventUrlAllowed(ev.url, allowedOrigins)) {
			rejectedOrigin += 1;
			continue;
		}
		const capturedAt =
			ev.ts != null
				? new Date(typeof ev.ts === 'number' ? ev.ts : Date.parse(String(ev.ts)))
				: new Date();
		const assetId = await resolveScreenshotAsset(pool, projectId, ev.screenshot);
		await pool.query(
			`INSERT INTO capture_events
       (project_id, session_id, url, title, asset_id, viewport, clicked_selector, navigated_from, captured_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
			[
				projectId,
				ev.sessionId.trim(),
				ev.url.trim(),
				ev.title?.trim() ?? null,
				assetId,
				ev.viewport ? JSON.stringify(ev.viewport) : null,
				ev.clickedSelector?.trim() ?? null,
				ev.navigatedFrom?.trim() ?? null,
				Number.isNaN(capturedAt.getTime()) ? new Date() : capturedAt,
			],
		);
		accepted += 1;
	}

	if (accepted === 0 && rejectedOrigin > 0) {
		throw new ProjectAccessError('Event URLs do not match the allowed website origin for this token', 403);
	}

	return { accepted, rejectedOrigin, synced: false };
}

export async function ingestAndSyncCaptureEvents(
	pool: pg.Pool,
	projectId: string,
	events: CaptureEventInput[],
	actor: AuthActor,
	sync: boolean,
	allowedOrigins: string[] = [],
): Promise<{
	accepted: number;
	rejectedOrigin: number;
	synced: boolean;
	version?: number;
	pageId?: string;
}> {
	const ingested = await ingestCaptureEvents(pool, projectId, events, allowedOrigins);
	if (!sync || ingested.accepted === 0) return ingested;
	try {
		const result = await syncCaptureFlowMap(pool, projectId, actor);
		return { ...ingested, synced: true, version: result.version, pageId: result.pageId };
	} catch (err) {
		if (err instanceof Error && err.message.includes('No capture events')) {
			return ingested;
		}
		throw err;
	}
}
