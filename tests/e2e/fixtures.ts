import { test as baseTest, expect } from '@playwright/test';

const IGNORE_CONSOLE = [
	/favicon/i,
	/Failed to load resource.*404/i,
];

function isIgnoredConsoleError(text: string): boolean {
	return IGNORE_CONSOLE.some((re) => re.test(text));
}

/**
 * Local demos load PayPal widgets from a CDN; blocking them keeps `page.goto`
 * from hanging on external `load` and matches CI network isolation for those assets.
 */
export const test = baseTest.extend({
	page: async ({ page }, use, testInfo) => {
		await page.route(/\b(paypalobjects|paypal)\.com\b/i, (route) => route.abort());

		const errors: string[] = [];
		const onConsole = (msg: import('@playwright/test').ConsoleMessage) => {
			if (msg.type() !== 'error') return;
			const text = msg.text();
			if (isIgnoredConsoleError(text)) return;
			errors.push(text);
		};
		const onPageError = (err: Error) => {
			errors.push(err.message);
		};

		page.on('console', onConsole);
		page.on('pageerror', onPageError);

		await use(page);

		page.off('console', onConsole);
		page.off('pageerror', onPageError);

		expect(errors, `Console errors during "${testInfo.title}":\n${errors.join('\n')}`).toEqual([]);
	},
});

/** Demos embed third-party scripts; `domcontentloaded` matches our structural assertions reliably. */
export async function gotoDemo(page: import('@playwright/test').Page, path: string): Promise<void> {
	await page.goto(path, { waitUntil: 'domcontentloaded', timeout: 45_000 });
}

export { expect };
