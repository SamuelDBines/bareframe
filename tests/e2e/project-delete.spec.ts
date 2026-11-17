import { expect, test, type Page, type Route } from '@playwright/test';

const PROJECT_ID = 'p-delete-me';

async function mockApi(page: Page, deleted: { value: boolean }) {
	await page.route('**/api/**', async (route: Route) => {
		const req = route.request();
		const p = new URL(req.url()).pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({ user: { id: 1, login: 'tester', name: 'Tester', avatarUrl: null, email: 't@example.com' }, features: { ai: true, llm: true } });
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free', limits: {}, usage: {} });
		if (p.endsWith('/api/projects') && req.method() === 'GET') {
			if (deleted.value) return json({ projects: [] });
			return json({
				projects: [{ id: PROJECT_ID, name: 'To delete', version: 1, updatedAt: new Date().toISOString() }],
			});
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}`) && req.method() === 'DELETE') {
			deleted.value = true;
			return json({ ok: true });
		}
		return json({ error: 'not_found' }, 404);
	});
}

test('deletes a project from the card menu', async ({ page, isMobile }) => {
	const deleted = { value: false };
	await mockApi(page, deleted);
	await page.goto('/#/app');
	const cardName = page.locator('.project-card__name', { hasText: 'To delete' });
	await expect(cardName).toBeVisible({ timeout: 15_000 });
	await page.getByTestId(`project-menu-${PROJECT_ID}`).click();
	await page.getByRole('menuitem', { name: 'Delete project' }).click();
	const dialog = page.getByTestId('delete-project-dialog');
	await expect(dialog).toBeVisible();
	await expect(dialog).toContainText('To delete');
	const deleteReq = page.waitForResponse(
		(res) => res.request().method() === 'DELETE' && res.url().includes(`/api/projects/${PROJECT_ID}`),
	);
	await page.getByTestId('confirm-delete-project').click();
	await deleteReq;
	await expect(cardName).toHaveCount(0);
	if (!isMobile) {
		await expect(page.getByTestId(`project-menu-${PROJECT_ID}`)).toHaveCount(0);
	}
});