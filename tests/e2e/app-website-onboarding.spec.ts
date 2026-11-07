import { expect, test, type Page, type Route } from '@playwright/test';

async function mockSignedInAppApi(page: Page, opts: { checkoutWorks: boolean }) {
	await page.route('**/api/**', (route: Route) => {
		const url = new URL(route.request().url());
		const p = url.pathname;
		const method = route.request().method();
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({ user: { id: 1, login: 'samuel', avatarUrl: null } });
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free' });
		if (p.endsWith('/api/projects') && method === 'GET') {
			return json({ projects: [{ id: 'p-existing', name: 'Untitled', version: 1, updatedAt: '2026-11-07T00:00:00Z' }] });
		}
		if (p.endsWith('/api/projects') && method === 'POST') {
			return json({ id: 'proj-new', name: 'example.com', version: 1 }, 201);
		}
		if (p.includes('/packages/config')) return json({ llmConfigured: false, intakeQuestions: [] });
		if (p.endsWith('/api/billing/config')) {
			return json({
				stripeEnabled: true,
				priceLabel: '£20/month',
				planName: 'Bareframe Pro',
			});
		}
		if (p.endsWith('/api/billing/checkout') && method === 'POST') {
			if (opts.checkoutWorks) {
				return json({ checkoutUrl: 'https://checkout.stripe.test/session' });
			}
			return json(
				{ disabled: true, message: 'Upgrades open soon. Your free plan keeps working in the meantime.' },
				503,
			);
		}
		if (p.includes('/website-capture/setup') && method === 'POST') {
			return json(
				{
					token: 'bf_test_token_once',
					tokenPrefix: 'bf_test',
					scopes: ['capture:ingest'],
					ingestUrl: '/api/v1/capture/events',
					allowedOrigin: 'https://example.com',
				},
				201,
			);
		}
		if (p.includes('/website-capture/status')) {
			return json({ eventCount: 0, distinctUrlCount: 0, screenshotCount: 0 });
		}
		if (p.match(/\/api\/projects\/[^/]+$/) && method === 'GET') {
			return json({ id: 'proj-new', name: 'example.com', version: 1, document: { frames: [], pages: [], connectors: [] } });
		}
		return json({ error: 'not_found' }, 404);
	});
}

test.describe('app website onboarding (free plan)', () => {
	test('free user reaches installed capture setup without Pro', async ({ page }) => {
		await mockSignedInAppApi(page, { checkoutWorks: true });
		await page.goto('/#/app');
		await expect(page.getByTestId('free-plan-capabilities')).toBeVisible({ timeout: 30_000 });
		await expect(page.getByTestId('app-upgrade-pro')).toBeVisible();

		await page.getByTestId('new-project').click();
		await expect(page.getByTestId('new-project-dialog')).toBeVisible();
		await page.locator('[data-start="url"]').click();
		await page.getByTestId('app-website-url').fill('https://example.com');
		await page.getByTestId('new-project-dialog').locator('form').evaluate((f) => {
			f.requestSubmit();
		});

		await expect(page.getByTestId('website-capture-setup')).toBeVisible({ timeout: 30_000 });
		await expect(page.getByTestId('import-step-0')).toBeVisible();
		await page.getByRole('button', { name: /Installed capture/i }).click();
		await expect(page.getByTestId('import-step-1')).toBeVisible();
		await page.locator('.website-import__check input').nth(1).check();
		await page.getByTestId('import-next').click();
		await expect(page.getByTestId('import-step-2')).toBeVisible();
		await expect(page.getByTestId('generate-capture-token')).toBeEnabled();
	});

	test('upgrade starts checkout when Stripe is configured', async ({ page }) => {
		await mockSignedInAppApi(page, { checkoutWorks: true });
		await page.goto('/#/app');
		await expect(page.getByTestId('app-upgrade-pro')).toBeVisible({ timeout: 30_000 });
		await Promise.all([
			page.waitForURL(/checkout\.stripe\.test\/session/),
			page.getByTestId('app-upgrade-pro').click(),
		]);
	});

	test('upgrade notice when checkout endpoint is unavailable', async ({ page }) => {
		await mockSignedInAppApi(page, { checkoutWorks: false });
		await page.goto('/#/app');
		await expect(page.getByTestId('app-upgrade-pro')).toBeVisible({ timeout: 30_000 });
		await page.getByTestId('app-upgrade-pro').click();
		await expect(page.getByTestId('upgrade-unavailable-notice')).toContainText(/Upgrades open soon/i);
	});
});
