import { expect, test, type Page, type Route } from '@playwright/test';

async function mockSignedIn(page: Page) {
	await page.route('**/api/**', (route: Route) => {
		const url = new URL(route.request().url());
		const p = url.pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({
				user: { id: 1, login: 'SamuelDBines', name: 'Sam', avatarUrl: null, email: 'sam@example.com' },
			});
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free' });
		if (p.endsWith('/api/billing/config')) {
			return json({ stripeEnabled: false, priceLabel: '£20/month', planName: 'Bareframe Pro' });
		}
		if (p.endsWith('/api/projects')) return json({ projects: [] });
		return json({ error: 'not_found' }, 404);
	});
}

test.describe('account header menu', () => {
	test('shows GitHub avatar when URL is valid', async ({ page }) => {
		await page.route('**/api/**', (route: Route) => {
			const url = new URL(route.request().url());
			const p = url.pathname;
			const json = (body: unknown, status = 200) =>
				route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
			if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
			if (p.endsWith('/api/me')) {
				return json({
					user: {
						id: 1,
						login: 'SamuelDBines',
						name: 'Sam',
						avatarUrl: 'https://avatars.githubusercontent.com/u/583231?v=4',
						email: 'sam@example.com',
					},
				});
			}
			if (p.endsWith('/api/plan')) return json({ tier: 'free' });
			if (p.endsWith('/api/billing/config')) {
				return json({ stripeEnabled: false, priceLabel: '£20/month', planName: 'Bareframe Pro' });
			}
			if (p.endsWith('/api/projects')) return json({ projects: [] });
			return json({ error: 'not_found' }, 404);
		});
		await page.goto('/#/app');
		await expect(page.getByTestId('user-avatar-image')).toBeVisible({ timeout: 30_000 });
	});

	test('falls back to initials when avatar image fails', async ({ page }) => {
		await page.route('**/api/**', (route: Route) => {
			const url = new URL(route.request().url());
			const p = url.pathname;
			const json = (body: unknown, status = 200) =>
				route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
			if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
			if (p.endsWith('/api/me')) {
				return json({
					user: {
						id: 1,
						login: 'SamuelDBines',
						name: 'Sam',
						avatarUrl: 'https://example.test/broken-avatar.png',
						email: 'sam@example.com',
					},
				});
			}
			if (p.endsWith('/api/plan')) return json({ tier: 'free' });
			if (p.endsWith('/api/billing/config')) {
				return json({ stripeEnabled: false, priceLabel: '£20/month', planName: 'Bareframe Pro' });
			}
			if (p.endsWith('/api/projects')) return json({ projects: [] });
			return json({ error: 'not_found' }, 404);
		});
		await page.route('https://example.test/broken-avatar.png', (route) =>
			route.fulfill({ status: 404, body: 'missing' }),
		);
		await page.goto('/#/app');
		await expect(page.getByTestId('user-avatar-initials')).toHaveText('S', { timeout: 30_000 });
	});

	test('signed-in header uses account menu instead of standalone sign out', async ({ page }) => {
		await mockSignedIn(page);
		await page.goto('/#/app');
		await expect(page.getByTestId('account-menu-trigger')).toBeVisible({ timeout: 30_000 });
		await expect(page.getByRole('button', { name: /^Sign out$/i })).toHaveCount(0);

		await page.getByTestId('account-menu-trigger').click();
		await expect(page.getByTestId('account-menu-panel')).toBeVisible();
		await expect(page.getByTestId('account-menu-settings')).toBeVisible();
		await expect(page.getByTestId('account-menu-sign-out')).toBeVisible();
	});

	test('escape closes menu and returns focus to trigger', async ({ page }) => {
		await mockSignedIn(page);
		await page.goto('/#/app');
		await expect(page.getByTestId('account-menu-trigger')).toBeVisible({ timeout: 30_000 });
		await page.getByTestId('account-menu-trigger').click();
		await expect(page.getByTestId('account-menu-panel')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(page.getByTestId('account-menu-panel')).toHaveCount(0);
		await expect(page.getByTestId('account-menu-trigger')).toBeFocused();
	});

	test('settings navigates to account settings page', async ({ page }) => {
		await mockSignedIn(page);
		await page.goto('/#/app');
		await page.getByTestId('account-menu-trigger').click();
		await page.getByTestId('account-menu-settings').click();
		await expect(page).toHaveURL(/#\/app\/settings$/);
		await expect(page.getByTestId('account-settings-page')).toBeVisible();
		await expect(page.getByTestId('account-plan-tier')).toHaveText('Free');
	});
});
