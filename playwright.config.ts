import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PW_PORT || 4173);
const baseURL = process.env.PW_BASE_URL || `http://127.0.0.1:${PORT}`;

const fontStableLaunch: { chromium?: object; webkit?: object } = process.env.CI
	? {
			chromium: {
				launchOptions: {
					args: ['--disable-font-subpixel-positioning', '--font-render-hinting=none'],
				},
			},
		}
	: {};

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	use: {
		baseURL,
		trace: 'on-first-retry',
		video: 'on-first-retry',
		deviceScaleFactor: 1,
	},
	projects: [
		{
			name: 'chromium-desktop',
			use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, ...fontStableLaunch.chromium },
		},
		{
			name: 'webkit-desktop',
			use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } },
		},
		{
			name: 'chromium-mobile',
			use: { ...devices['Pixel 7'], deviceScaleFactor: 1, ...fontStableLaunch.chromium },
		},
		{
			name: 'webkit-mobile',
			use: { ...devices['iPhone 14'], deviceScaleFactor: 1 },
		},
	],
	webServer: process.env.PW_NO_SERVER
		? undefined
		: {
				command: `pnpm exec sirv public --host 127.0.0.1 --port ${PORT} --cors --dev --quiet`,
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
});
