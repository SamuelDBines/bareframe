import { test, expect } from '@playwright/test';

const JOURNEY_MAP_ROUTES = [
	{ path: '/#/demo/b2b-workspace', minCards: 15 },
	{ path: '/#/demo/marketplace-fulfilment', minCards: 15 },
	{ path: '/#/demo/med-schedule', minCards: 15 },
] as const;

test.describe('public journey examples', () => {
	test('examples gallery lists all journey demos in one grid', async ({ page }) => {
		await page.goto('/#/examples');
		await expect(page.getByRole('heading', { name: /See Bareframe on a real flow/i })).toBeVisible();
		await expect(page.getByRole('heading', { name: 'Complex journeys' })).toHaveCount(0);
		const cards = page.locator('.example-card');
		expect(await cards.count()).toBe(8);
		await expect(page.getByRole('link', { name: /LatticeDesk workspace/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /Arbor Market/i })).toBeVisible();
		await expect(page.getByRole('link', { name: /MedSchedule appointments/i })).toBeVisible();
		await expect(page.locator('.example-card__cta').first()).toHaveText('Open example →');
	});

	for (const route of JOURNEY_MAP_ROUTES) {
		test(`smoke: ${route.path} map loads`, async ({ page }) => {
			await page.goto(route.path);
			await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
			const mapCards = page.locator('.flow-map-card');
			await expect(mapCards.first()).toBeVisible();
			expect(await mapCards.count()).toBeGreaterThanOrEqual(route.minCards);
		});
	}

	test('b2b prototype exposes branch hotspots', async ({ page }) => {
		await page.addInitScript(() => {
			localStorage.setItem('bareframe.flowMapTour.v1', JSON.stringify({ dismissed: true }));
		});
		await page.goto('/#/demo/b2b-workspace');
		await expect(page.getByTestId('flow-map-workspace')).toBeVisible({ timeout: 30_000 });
		await page.getByTestId('flow-mode-prototype').click();
		await expect(page.getByTestId('prototype-player')).toBeVisible();
		const hotspots = page.locator('.proto-hotspot');
		await expect(hotspots.first()).toBeVisible();
		expect(await hotspots.count()).toBeGreaterThanOrEqual(2);
		await page.getByRole('button', { name: 'Close prototype' }).click();
	});

	test('every example opens in the same example layout', async ({ page }) => {
		await page.goto('/#/examples');
		const hrefs = await page.locator('.example-card').evaluateAll((cards) =>
			cards.map((c) => (c.closest('a') ?? c.querySelector('a'))?.getAttribute('href') ?? ''),
		);
		expect(hrefs).toHaveLength(8);
		for (const href of hrefs) {
			await page.goto(`/${href.replace(/^\//, '')}`);
			await expect(page.getByTestId('example-stage'), href).toBeVisible({ timeout: 30_000 });
			await expect(page.getByRole('link', { name: 'All examples' }), href).toBeVisible();
			await expect(page.getByRole('heading', { level: 1 }), href).toBeVisible();
		}
	});

	test('scrolling over an example map scrolls the page, not the map', async ({ page, isMobile }) => {
		test.skip(isMobile, 'Wheel scrolling is a desktop interaction');
		await page.setViewportSize({ width: 1280, height: 800 });
		await page.goto('/#/demo/b2b-workspace');
		const viewport = page.getByTestId('flow-map-viewport');
		await expect(page.locator('.flow-map-card').first()).toBeVisible({ timeout: 30_000 });
		// Wait for the initial fit to settle, then note the map's camera.
		await page.waitForTimeout(700);
		const camera = () => page.locator('.flow-map-world').evaluate((el) => (el as HTMLElement).style.transform);
		const before = await camera();
		const box = (await viewport.boundingBox())!;
		await page.mouse.move(box.x + box.width / 2, box.y + 40);
		await page.mouse.wheel(0, 600);
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
		// The page scrolled; the map itself did not pan.
		expect(await camera()).toBe(before);

		// Scrolled to the end, the whole map stage is in view below the site header.
		await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
		const stage = (await page.getByTestId('example-stage').boundingBox())!;
		expect(stage.y).toBeGreaterThanOrEqual(64);
		expect(stage.y + stage.height).toBeLessThanOrEqual(800);
	});
});

test.describe('homepage', () => {
	test('says what Bareframe does and animates every how-it-works step', async ({ page }) => {
		await page.goto('/#/');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Map your user flows/);
		for (const step of ['import', 'review', 'share']) {
			const names = await page
				.locator(`.step-art--${step}`)
				.evaluate((el) => [...el.querySelectorAll('*')].flatMap((n) => n.getAnimations().map((a) => (a as CSSAnimation).animationName)));
			expect(names.length, step).toBeGreaterThan(0);
		}
	});
});

