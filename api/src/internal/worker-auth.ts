import { timingSafeEqual } from 'node:crypto';

/** Constant-time compare for worker shared secrets (UTF-8). */
export function verifyRenderWorkerSecret(
	provided: string | undefined,
	expected: string,
): boolean {
	if (provided === undefined || provided === '') return false;
	const a = Buffer.from(provided, 'utf8');
	const b = Buffer.from(expected, 'utf8');
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
