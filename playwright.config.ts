import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PW_PORT || 4173);
const baseURL = process.env.PW_BASE_URL || `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: 'tests/e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	reporter: process.env.CI ? [['github'], ['list']] : 'list',
	use: {
		baseURL,
		trace: 'on-first-retry',
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: process.env.PW_NO_SERVER
		? undefined
		: {
				command: `pnpm exec sirv public --host 127.0.0.1 --port ${PORT} --cors --quiet`,
				url: baseURL,
				reuseExistingServer: !process.env.CI,
				timeout: 120_000,
			},
});
