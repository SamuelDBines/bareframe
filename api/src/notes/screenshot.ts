import type pg from 'pg';
import { insertProjectAsset } from '../db/projects.js';

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

export async function storeNoteScreenshot(
	pool: pg.Pool,
	projectId: string,
	screenshot?: string,
): Promise<string | null> {
	if (!screenshot?.trim()) return null;
	const parsed = parseScreenshotPayload(screenshot);
	if (!parsed) return null;
	if (parsed.bytes.byteLength > 5 * 1024 * 1024) return null;
	return insertProjectAsset(pool, projectId, parsed.contentType, parsed.bytes);
}