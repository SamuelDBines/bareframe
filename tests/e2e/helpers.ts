/** Tier A demo slugs — keep aligned with docs/TIERING.md (chart is Tier C; omitted from gate). */
export const TIER_A_DEMO_SLUGS = [
	'button',
	'link',
	'header',
	'footer',
	'modal',
	'dialog',
	'toast',
	'message',
	'error-summary',
	'input',
	'checkbox',
	'radio',
	'select',
	'toggle',
] as const;

export const MATRIX_THEMES = ['system', 'dark', 'matrix'] as const;

export function componentTag(slug: (typeof TIER_A_DEMO_SLUGS)[number]): string {
	if (slug === 'link') return 'bf-link';
	return `bf-${slug}`;
}

/** Pick a host that is visibly on-screen (closed modals/dialog sheets are intentionally hidden). */
export function themeMatrixLocator(page: import('@playwright/test').Page, slug: (typeof TIER_A_DEMO_SLUGS)[number]) {
	const root = page.locator('[data-demo-root]').first();
	if (slug === 'modal') return root.locator('#btnOpen');
	if (slug === 'dialog') return root.locator('bf-button').first();
	if (slug === 'toast') return root.locator('bf-toast[banner]').first();
	return root.locator(componentTag(slug)).first();
}

/** Failures limited to same-origin URLs from the Playwright harness (avoids third-party Paypal, etc.). */
export function attachSameOriginFailures(
	page: import('@playwright/test').Page,
	baseURL: string,
	failures: { url: string; status: number }[],
): void {
	page.on('response', (response) => {
		const url = response.url();
		const status = response.status();
		if (status < 400) return;
		if (!url.startsWith(baseURL.replace(/\/$/, ''))) return;
		if (/\/donate-sdk|paypalobjects/i.test(url)) return;
		failures.push({ url, status });
	});
}
