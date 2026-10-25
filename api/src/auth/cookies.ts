import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Context } from 'hono';

export const SESSION_COOKIE = 'bareframe_session';
export const OAUTH_STATE_COOKIE = 'bareframe_oauth';

const MAX_AGE_OAUTH = 600; // 10 minutes
const MAX_AGE_SESSION = 60 * 60 * 24 * 30; // 30 days

export type CookieSettings = {
	/** True when the public site URL is HTTPS (TLS terminates at ingress). */
	secure: boolean;
};

export function cookieSettingsFromPublicUrl(publicUrl: string): CookieSettings {
	return { secure: publicUrl.startsWith('https://') };
}

function sign(value: string, secret: string): string {
	const sig = createHmac('sha256', secret).update(value).digest('base64url');
	return `${value}.${sig}`;
}

function unsign(signed: string, secret: string): string | null {
	const i = signed.lastIndexOf('.');
	if (i <= 0) return null;
	const value = signed.slice(0, i);
	const sig = signed.slice(i + 1);
	const expected = createHmac('sha256', secret).update(value).digest('base64url');
	try {
		const a = Buffer.from(sig);
		const b = Buffer.from(expected);
		if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
	} catch {
		return null;
	}
	return value;
}

function parseCookieHeader(header: string | undefined): Record<string, string> {
	const out: Record<string, string> = {};
	if (!header) return out;
	for (const part of header.split(';')) {
		const [rawKey, ...rest] = part.split('=');
		const key = rawKey?.trim();
		if (!key) continue;
		const rawValue = rest.join('=').trim();
		try {
			out[key] = decodeURIComponent(rawValue);
		} catch {
			/* ignore malformed cookie values */
		}
	}
	return out;
}

export function getCookie(c: Context, name: string): string | undefined {
	return parseCookieHeader(c.req.header('cookie'))[name];
}

function setCookieHeader(
	c: Context,
	value: string,
	append: boolean,
): void {
	if (append) {
		c.header('Set-Cookie', value, { append: true });
	} else {
		c.header('Set-Cookie', value);
	}
}

export function setSignedCookie(
	c: Context,
	name: string,
	payload: string,
	secret: string,
	maxAgeSeconds: number,
	settings: CookieSettings,
	append = false,
): void {
	const signed = sign(payload, secret);
	const secure = settings.secure ? '; Secure' : '';
	setCookieHeader(
		c,
		`${name}=${encodeURIComponent(signed)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`,
		append,
	);
}

export function readSignedCookie(
	c: Context,
	name: string,
	secret: string,
): string | null {
	const raw = getCookie(c, name);
	if (!raw) return null;
	return unsign(raw, secret);
}

export function clearCookie(
	c: Context,
	name: string,
	settings: CookieSettings,
	append = false,
): void {
	const secure = settings.secure ? '; Secure' : '';
	setCookieHeader(
		c,
		`${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secure}`,
		append,
	);
}

export function setSessionCookie(
	c: Context,
	token: string,
	secret: string,
	settings: CookieSettings,
	append = false,
): void {
	setSignedCookie(c, SESSION_COOKIE, token, secret, MAX_AGE_SESSION, settings, append);
}

export function clearSessionCookie(
	c: Context,
	settings: CookieSettings,
	append = false,
): void {
	clearCookie(c, SESSION_COOKIE, settings, append);
}

export type OAuthStatePayload = {
	state: string;
	returnTo: string;
};

export function setOAuthStateCookie(
	c: Context,
	payload: OAuthStatePayload,
	secret: string,
	settings: CookieSettings,
	append = false,
): void {
	setSignedCookie(
		c,
		OAUTH_STATE_COOKIE,
		JSON.stringify(payload),
		secret,
		MAX_AGE_OAUTH,
		settings,
		append,
	);
}

export function readOAuthStateCookie(
	c: Context,
	secret: string,
): OAuthStatePayload | null {
	const raw = readSignedCookie(c, OAUTH_STATE_COOKIE, secret);
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw) as OAuthStatePayload;
		if (typeof parsed.state !== 'string' || typeof parsed.returnTo !== 'string') {
			return null;
		}
		return parsed;
	} catch {
		return null;
	}
}

export function clearOAuthStateCookie(
	c: Context,
	settings: CookieSettings,
	append = false,
): void {
	clearCookie(c, OAUTH_STATE_COOKIE, settings, append);
}
