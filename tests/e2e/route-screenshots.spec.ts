import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type Route } from '@playwright/test';
import path from 'node:path';

/**
 * Every product route at 1440×900: asserts the shared design system is applied
 * (no default-browser pages) and no raw server/config errors leak into the UI,
 * then saves a screenshot. The API is mocked so results don't depend on a backend.
 *
 * Screenshots land in SCREENSHOT_DIR (default: test-results/route-screenshots).
 */

const BASE = process.env.PW_HASH_BASE ?? '/#/';
const OUT = process.env.SCREENSHOT_DIR ?? path.join('test-results', 'route-screenshots');

const RAW_ERROR =
	/LLM_API|not configured|Unexpected token|is not valid JSON|STRIPE_|FIGMA_ACCESS_TOKEN|<!doctype|stack trace|undefined is not|TypeError/i;

type ApiMode = 'offline' | 'signed-out' | 'signed-in-empty' | 'signed-in-projects';

async function mockApi(page: Page, mode: ApiMode) {
	await page.route('**/api/**', (route: Route) => {
		const url = new URL(route.request().url());
		const p = url.pathname;
		const json = (body: unknown, status = 200) =>
			route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
		if (mode === 'offline') return route.fulfill({ status: 404, body: 'Not found' });
		if (p.endsWith('/api/healthz')) return route.fulfill({ status: 200, body: 'ok' });
		if (p.endsWith('/api/me')) {
			return json({ user: mode === 'signed-out' ? null : { id: 1, login: 'test-user', avatarUrl: null } });
		}
		if (p.endsWith('/api/projects')) {
			return json({
				projects:
					mode === 'signed-in-projects'
						? [
								{ id: 'p1', name: 'Checkout redesign', version: 3, updatedAt: '2026-10-28T10:00:00Z' },
								{ id: 'p2', name: 'Onboarding v2', version: 1, updatedAt: '2026-10-30T10:00:00Z' },
							]
						: [],
			});
		}
		if (p.endsWith('/api/plan')) return json({ tier: 'free' });
		if (p.includes('/packages/config')) return json({ llmConfigured: false, intakeQuestions: [] });
		if (p.includes('/api/share/')) return json({ error: 'not_found' }, 404);
		return json({ error: 'not_found' }, 404);
	});
}

async function assertStyled(page: Page) {
	const report = await page.evaluate(() => {
		const root = getComputedStyle(document.documentElement);
		const body = getComputedStyle(document.body);
		const visible = (el: Element) => {
			const r = el.getBoundingClientRect();
			const s = getComputedStyle(el);
			return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
		};
		const serif = [...document.querySelectorAll('body *')]
			.filter((el) => el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
			.filter(visible)
			.filter((el) => /^"?(Times|serif)/i.test(getComputedStyle(el).fontFamily))
			.map((el) => el.tagName.toLowerCase());
		const unstyledButtons = [...document.querySelectorAll<HTMLElement>('main button, main a.btn, main input, main textarea')]
			.filter(visible)
			// Live component-library previews on /components are the library's own markup, not product chrome.
			.filter((el) => !el.closest('.docs-gallery-card, .bf-docs-preview, .playground-preview-content, [data-doc-preview]'))
			.filter((el) => {
				const s = getComputedStyle(el);
				// Browser-default controls: square corners + system font + grey "buttonface" background.
				return s.borderRadius === '0px' && /ButtonFace|rgb\(239, 239, 239\)|rgb\(240, 240, 240\)/.test(s.backgroundColor);
			})
			.map((el) => el.outerHTML.slice(0, 80));
		return {
			accent: root.getPropertyValue('--bx-accent').trim(),
			bodyFont: body.fontFamily,
			bodyBg: body.backgroundColor,
			header: Boolean(document.querySelector('header.app-header')),
			serif,
			unstyledButtons,
			text: document.body.innerText,
		};
	});
	expect(report.accent, 'design tokens loaded').not.toBe('');
	expect(report.bodyFont).toMatch(/Inter/);
	expect(report.bodyBg).not.toBe('rgba(0, 0, 0, 0)');
	expect(report.header, 'shared header present').toBe(true);
	expect(report.serif, 'no default serif text').toEqual([]);
	expect(report.unstyledButtons, 'no browser-default controls').toEqual([]);
	expect(report.text).not.toMatch(RAW_ERROR);
}

async function visit(page: Page, hash: string, ready: string) {
	await page.goto(`${BASE}${hash}`, { waitUntil: 'domcontentloaded' });
	await page.waitForSelector(ready, { timeout: 30_000 });
	await page.evaluate(() => document.fonts.ready);
	await page.waitForTimeout(400);
}

async function shoot(page: Page, name: string) {
	await page.screenshot({ path: path.join(OUT, `${name}.png`) });
}

type Case = { name: string; hash: string; ready: string; api?: ApiMode; act?: (page: Page) => Promise<void> };

const CASES: Case[] = [
	{ name: 'home', hash: '', ready: '[data-testid="live-flow-demo"]' },
	{ name: 'pricing', hash: 'pricing', ready: '.plan--popular' },
	{ name: 'examples', hash: 'examples', ready: '.example-card' },
	{ name: 'sign-in', hash: 'sign-in', ready: '.auth-card' },
	{ name: 'sign-up', hash: 'sign-up', ready: '.auth-card' },
	{ name: 'components', hash: 'components', ready: '.app-header' },
	{ name: 'components-button', hash: 'components/button', ready: 'h1' },
	{ name: 'components-tokens', hash: 'components/tokens', ready: 'h1' },
	{ name: 'components-mcp', hash: 'components/mcp', ready: 'h1' },
	{ name: 'components-start', hash: 'components/start', ready: 'h1' },
	{ name: 'app-signed-out', hash: 'app', ready: '[data-testid="app-signed-out"]', api: 'signed-out' },
	{ name: 'app-empty', hash: 'app', ready: '.app-empty--inline', api: 'signed-in-empty' },
	{ name: 'app-projects', hash: 'app', ready: '.project-grid .project-card__name', api: 'signed-in-projects' },
	{
		name: 'app-new-project',
		hash: 'app',
		ready: '[data-testid="new-project"]',
		api: 'signed-in-empty',
		act: async (page) => {
			await page.getByTestId('new-project').click();
			await expect(page.getByTestId('new-project-dialog')).toBeVisible();
		},
	},
	{
		name: 'app-new-project-brief-paused',
		hash: 'app',
		ready: '[data-testid="new-project"]',
		api: 'signed-in-empty',
		act: async (page) => {
			await page.getByTestId('new-project').click();
			await page.getByRole('radio', { name: /Short brief/ }).click();
			await expect(page.getByTestId('brief-unavailable')).toBeVisible();
		},
	},
	{ name: 'app-brief', hash: 'app/product/new', ready: 'form', api: 'signed-in-empty' },
	{ name: 'flow-map-review', hash: 'demo/journey-review', ready: '.flow-map-card .map-flag' },
	{
		name: 'flow-map-finding-open',
		hash: 'demo/journey-review',
		ready: '.flow-map-card .map-flag',
		act: async (page) => {
			await page.getByRole('button', { name: /Major finding: Queue has no empty state/ }).click();
			await expect(page.locator('.finding.is-active')).toBeVisible();
		},
	},
	{
		name: 'flow-map-fix-applied',
		hash: 'demo/journey-review',
		ready: '.flow-map-card .map-flag',
		act: async (page) => {
			await page.getByRole('button', { name: /Major finding: Queue has no empty state/ }).click();
			await page.getByRole('button', { name: 'Add screen' }).click();
			await expect(page.locator('.flow-map-card')).toHaveCount(4);
			await page.getByRole('button', { name: 'Fit' }).click();
		},
	},
	{
		name: 'prototype',
		hash: 'demo/journey-review',
		ready: '.flow-map-card',
		act: async (page) => {
			await page.getByTestId('flow-mode-prototype').click();
			await expect(page.getByTestId('prototype-player')).toBeVisible();
			await expect(page.locator('.proto-hotspot').first()).toBeVisible();
		},
	},
	{ name: 'demo-flow-map', hash: 'demo/flow-map', ready: '[data-testid="live-flow-demo"]' },
	{ name: 'demo-share-canvas', hash: 'demo/share-canvas', ready: '.flow-map-card' },
	{ name: 'share-unavailable', hash: 'share/expired-token', ready: '[data-testid="share-unavailable"]', api: 'signed-out' },
];

test.describe('Route screenshots (1440×900)', () => {
	test.use({ viewport: { width: 1440, height: 900 } });
	test.skip(({ browserName, isMobile }) => browserName !== 'chromium' || isMobile, 'Desktop Chromium only');

	for (const c of CASES) {
		test(c.name, async ({ page }) => {
			await mockApi(page, c.api ?? 'offline');
			await visit(page, c.hash, c.ready);
			if (c.act) {
				await c.act(page);
				await page.waitForTimeout(500);
			}
			await assertStyled(page);
			await shoot(page, c.name);
		});
	}

	test('homepage demo: applying a fix adds the missing screen', async ({ page }) => {
		await mockApi(page, 'offline');
		await visit(page, '', '[data-testid="live-flow-demo"]');
		const demo = page.getByTestId('live-flow-demo');
		await expect(demo.locator('.ld-card')).toHaveCount(6);
		await demo.getByRole('button', { name: 'Add screen' }).click();
		await expect(demo.locator('.ld-card')).toHaveCount(7);
		await expect(demo.getByText('3 open')).toBeVisible();
		await demo.getByRole('tab', { name: 'Prototype' }).click();
		await demo.getByRole('button', { name: 'Start free' }).click();
		await expect(demo.getByRole('heading', { name: 'Sign up' })).toBeVisible();
	});

	test('flow map is keyboard operable', async ({ page }) => {
		await mockApi(page, 'offline');
		await visit(page, 'demo/journey-review', '.flow-map-card');
		const first = page.locator('.flow-map-card__hit').first();
		await first.focus();
		await page.keyboard.press('Enter');
		await expect(first).toHaveAttribute('aria-pressed', 'true');
		await page.keyboard.press('ArrowRight');
		await expect(page.locator('.flow-map-card__hit').nth(1)).toBeFocused();
		await page.keyboard.press('Escape');
		await expect(page.locator('.flow-map-card--selected')).toHaveCount(0);
	});

	test('pricing toggle switches Pro between monthly and yearly', async ({ page }) => {
		await mockApi(page, 'offline');
		await visit(page, 'pricing', '.plan--popular');
		const pro = page.locator('.plan--popular');
		await expect(pro.locator('.plan__amount')).toHaveText('$29');
		await page.getByRole('radio', { name: 'Monthly' }).click();
		await expect(pro.locator('.plan__amount')).toHaveText('$39');
	});

	for (const c of CASES.filter((x) =>
		['home', 'pricing', 'examples', 'sign-in', 'app-signed-out', 'app-new-project', 'flow-map-finding-open', 'prototype', 'share-unavailable'].includes(x.name),
	)) {
		test(`WCAG AA: ${c.name}`, async ({ page }) => {
			await mockApi(page, c.api ?? 'offline');
			await visit(page, c.hash, c.ready);
			if (c.act) await c.act(page);
			// Let entrance animations finish so contrast is measured at full opacity.
			await page.waitForTimeout(700);
			const results = await new AxeBuilder({ page })
				.withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
				// Screen thumbnails render the user's own designs in iframes; we don't audit their content.
				.exclude('.flow-map-card__thumb')
				.exclude('.proto__screen')
				.exclude('.ld-card__thumb')
				.exclude('.ld-phone__screen')
				.analyze();
			const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 4).join(' | ')}`);
			expect(summary).toEqual([]);
		});
	}
});
