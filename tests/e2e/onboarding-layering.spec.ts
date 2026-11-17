import { expect, test, type Page, type Route } from '@playwright/test';

const PROJECT_ID = 'p-onboard-layer';

async function mockEmptyProject(page: Page) {
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
		if (p.endsWith(`/api/projects/${PROJECT_ID}`)) {
			return json({
				id: PROJECT_ID,
				name: 'New flow',
				version: 1,
				document: { project: { id: PROJECT_ID, name: 'New flow', pages: [], frames: [], connectors: [], annotations: [], defaultThemeId: 'light' }, schemaVersion: 1 },
			});
		}
		if (p.endsWith(`/api/projects/${PROJECT_ID}/document`) && req.method() === 'PUT') return json({ version: 2 });
		if (p.endsWith('/events')) return route.fulfill({ status: 204, body: '' });
		return json({ error: 'not_found' }, 404);
	});
}

test('onboarding modal stays above canvas chrome on an empty map', async ({ page }) => {
	await mockEmptyProject(page);
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await page.goto(`/#/app/project/${PROJECT_ID}`);
	const panel = page.getByTestId('describe-product-panel');
	await expect(panel).toBeVisible({ timeout: 30_000 });
	await expect(panel.getByText('Prefer to start by hand? Switch to Edit and add a screen.')).toBeVisible();
	const footer = panel.getByText('Prefer to start by hand? Switch to Edit and add a screen.');
	const zoom = page.getByTestId('flow-map-zoom-bar');
	await expect(zoom).toHaveCount(0);
	await expect(page.getByTestId('design-bar')).toHaveCount(0);
	await expect(page.locator('.canvas-subtoolbar')).toHaveCount(0);
	await expect(page.locator('.device-viewport-switch--canvas')).toHaveCount(0);
	const footerBox = await footer.boundingBox();
	expect(footerBox).toBeTruthy();
	if (footerBox) {
		const obscured = await page.evaluate((y) => {
			const el = document.elementFromPoint(window.innerWidth / 2, y + 6);
			return el?.closest('.describe-panel') != null;
		}, footerBox.y + footerBox.height - 8);
		expect(obscured).toBe(true);
	}
});

test('empty map mode keeps canvas chrome hidden before any screens exist', async ({ page }) => {
	await mockEmptyProject(page);
	await page.addInitScript(() => {
		localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
	});
	await page.goto(`/#/app/project/${PROJECT_ID}`);
	await expect(page.getByTestId('describe-product-panel')).toBeVisible({ timeout: 30_000 });
	await expect(page.getByTestId('flow-mode-map')).toHaveAttribute('aria-selected', 'true');
	await expect(page.getByTestId('flow-map-zoom-bar')).toHaveCount(0);
	await expect(page.getByTestId('design-bar')).toHaveCount(0);
});