import { chromium } from 'playwright';

export type BrowserReadyState = 'pending' | 'ready' | 'failed';

let browserReady: BrowserReadyState = 'pending';
let browserReadyError: string | null = null;

export function getBrowserReadyState(): { state: BrowserReadyState; error: string | null } {
	return { state: browserReady, error: browserReadyError };
}

export async function runPlaywrightStartupSelfCheck(): Promise<void> {
	try {
		const browser = await chromium.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		try {
			const context = await browser.newContext({ viewport: { width: 320, height: 200 } });
			const page = await context.newPage();
			await page.setContent('<html><body>bareframe render worker</body></html>', {
				waitUntil: 'load',
			});
			const png = await page.screenshot({ type: 'png' });
			if (!png.length) throw new Error('screenshot was empty');
			await context.close();
		} finally {
			await browser.close();
		}
		browserReady = 'ready';
		browserReadyError = null;
		console.log('Playwright browser self-check passed');
	} catch (err) {
		browserReady = 'failed';
		browserReadyError = err instanceof Error ? err.message : String(err);
		console.error(
			'Playwright browser self-check failed. npm Playwright must match the mcr.microsoft.com/playwright base image.',
			browserReadyError,
		);
	}
}