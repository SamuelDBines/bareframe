import { expect, gotoDemo, test } from './fixtures';
import { attachSameOriginFailures } from './helpers';

function baseOrigin(): string {
	const u = test.info().project.use.baseURL!;
	return u.replace(/\/$/, '');
}

test.describe('smoke — static artifact + showcase', () => {
	test('prototype root and legacy dist manifest respond', async ({ request, page }) => {
		await page.goto('/');
		await expect(page.getByText('Bareframe', { exact: false }).first()).toBeVisible();

		const m = await request.get('/legacy/dist/manifest.json');
		expect(m.ok(), await m.text()).toBeTruthy();

		const t = await request.get('/legacy/dist/tokens.json');
		expect(t.ok(), await t.text()).toBeTruthy();
		const tokens = await t.json();
		expect(Array.isArray(tokens.tokens)).toBeTruthy();
	});

	test('showcase loads and same-origin navigations succeed', async ({ page, request }) => {
		const base = baseOrigin();
		const failures: { url: string; status: number }[] = [];
		attachSameOriginFailures(page, base, failures);

		await gotoDemo(page, '/legacy/showcase/index.html');
		await expect(page.locator('body')).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Component Studio' })).toBeVisible({
			timeout: 15_000,
		});
		await expect(page.getByText('Component Studio needs a build')).toHaveCount(0);

		const studio = await request.get('/legacy/dist/showcase-studio.json');
		expect(studio.ok(), await studio.text()).toBeTruthy();

		const demoSlugs = ['button', 'input', 'card'];
		for (const slug of demoSlugs) {
			await gotoDemo(page, `/legacy/${slug}/index.html`);
			await page.waitForLoadState('domcontentloaded');
			await expect(page.locator('body')).toBeVisible();
		}

		expect(failures, `HTTP failures: ${JSON.stringify(failures)}`).toEqual([]);
	});
});
