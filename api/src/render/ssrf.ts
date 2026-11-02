import { isIP } from 'node:net';
import { lookup } from 'node:dns/promises';

const BLOCKED_HOSTS = new Set(['localhost', 'metadata.google.internal']);

function isPrivateIp(ip: string): boolean {
	if (ip === '127.0.0.1' || ip === '::1') return true;
	if (ip.startsWith('10.')) return true;
	if (ip.startsWith('192.168.')) return true;
	if (ip.startsWith('169.254.')) return true;
	const m = /^172\.(\d+)\./.exec(ip);
	if (m && Number(m[1]) >= 16 && Number(m[1]) <= 31) return true;
	if (ip.startsWith('fc') || ip.startsWith('fd')) return true;
	return false;
}

function allowListHosts(extraHosts: string[]): string[] {
	return [
		...extraHosts,
		...(process.env.RENDER_ALLOW_HOSTS?.split(',').map((h) => h.trim()).filter(Boolean) ?? []),
	];
}

export function isAllowedPublicUrl(raw: string, extraHosts: string[] = []): boolean {
	let u: URL;
	try {
		u = new URL(raw);
	} catch {
		return false;
	}
	if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
	const host = u.hostname.toLowerCase();
	if (allowListHosts(extraHosts).includes(host)) return true;
	if (BLOCKED_HOSTS.has(host)) return false;
	if (host === '127.0.0.1' || host.endsWith('.local')) return false;
	if (isIP(host)) return !isPrivateIp(host);
	return true;
}

export async function assertResolvedPublicHost(url: string): Promise<void> {
	const u = new URL(url);
	const host = u.hostname;
	if (allowListHosts([]).includes(host)) return;
	if (isIP(host)) {
		if (isPrivateIp(host)) throw new Error('Private IP blocked');
		return;
	}
	const records = await lookup(host, { all: true });
	for (const r of records) {
		if (isPrivateIp(r.address)) throw new Error('Host resolves to private IP');
	}
}
