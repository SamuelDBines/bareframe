/** Cookie header value for requests (name=value pairs only). */
export function cookieHeaderFromResponse(res: Response): string {
	const raw = setCookieLines(res);
	return raw
		.map((sc) => sc.split(';')[0]?.trim())
		.filter(Boolean)
		.join('; ');
}

export function setCookieLines(res: Response): string[] {
	if (res.headers.getSetCookie) {
		return res.headers.getSetCookie();
	}
	const single = res.headers.get('set-cookie');
	return single ? [single] : [];
}
