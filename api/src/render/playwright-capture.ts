import type pg from 'pg';
import { chromium, type Page } from 'playwright';
import { buildPageUrl, routeKeyFromUrl } from '@bareframe/flow-map-engine';
import type { PageCaptureMetrics } from '@bareframe/flow-map-engine';
import { insertProjectAsset } from '../db/projects.js';
import { assertResolvedPublicHost } from './ssrf.js';

export type CapturedPage = {
	assetId: string;
	metrics: PageCaptureMetrics;
	outboundLinks: { path: string; label: string; trigger: 'link' | 'button' | 'nav' }[];
};

export type BrowserCapture = (
	pool: pg.Pool,
	projectId: string,
	url: string,
	width: number,
	height: number,
) => Promise<CapturedPage>;

const PAGE_GOTO_TIMEOUT_MS = 45_000;

async function collectMetrics(page: Page, url: string): Promise<{
	metrics: Omit<PageCaptureMetrics, 'url'>;
	outboundLinks: CapturedPage['outboundLinks'];
}> {
	const origin = new URL(url).origin;
	const pageUrl = new URL(url);
	const routePath = routeKeyFromUrl(pageUrl, origin) ?? (pageUrl.pathname || '/');

	const data = await page.evaluate(() => {
		const doc = document;
		const scrollWidth = doc.documentElement.scrollWidth;
		const clientWidth = doc.documentElement.clientWidth;
		const hasHeader = !!doc.querySelector('header,[role=banner]');
		const hasBottomBar = !!doc.querySelector(
			'nav[aria-label*="bottom" i], footer nav, [data-testid*="tab-bar"]',
		);
		const body = doc.body;
		const rect = body.getBoundingClientRect();
		const minSideMargin = Math.min(rect.left, window.innerWidth - rect.right);
		let offBrand = 0;
		doc.querySelectorAll('*').forEach((el) => {
			const bg = getComputedStyle(el).backgroundColor;
			if (bg.includes('rgb(37, 99, 235)')) offBrand += 0;
			else if (bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') offBrand += 1;
		});
		const anchors = [...doc.querySelectorAll('a[href]')] as HTMLAnchorElement[];
		const domLinks = anchors
			.map((a) => {
				const href = a.getAttribute('href')?.trim() ?? '';
				if (!href || href.startsWith('mailto:') || href.startsWith('javascript:')) return null;
				if (href === '#' || (href.startsWith('#') && !href.startsWith('#/'))) return null;
				const text = (a.textContent ?? href).replace(/\s+/g, ' ').trim();
				return { href, text: text || href };
			})
			.filter(Boolean) as { href: string; text: string }[];
		return {
			scrollWidth,
			clientWidth,
			hasHeader,
			hasBottomBar,
			minSideMargin,
			offBrand,
			title: doc.title?.trim() ?? '',
			domLinks,
		};
	});

	const outboundLinks = data.domLinks
		.map((l) => {
			try {
				const key = routeKeyFromUrl(new URL(l.href, url), origin);
				if (!key) return null;
				return { path: key, label: l.text, trigger: 'link' as const };
			} catch {
				return null;
			}
		})
		.filter(Boolean)
		.slice(0, 30) as CapturedPage['outboundLinks'];

	return {
		metrics: {
			path: routePath,
			title: data.title || undefined,
			scrollWidth: data.scrollWidth,
			clientWidth: data.clientWidth,
			hasHeader: data.hasHeader,
			hasBottomBar: data.hasBottomBar,
			minSideMargin: Math.max(0, Math.round(data.minSideMargin)),
			offBrandColorHits: data.offBrand,
		},
		outboundLinks,
	};
}

let browserPromise: ReturnType<typeof chromium.launch> | null = null;

async function getBrowser() {
	if (!browserPromise) {
		browserPromise = chromium.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
	}
	return browserPromise;
}

export async function closePlaywrightBrowser(): Promise<void> {
	if (browserPromise) {
		const b = await browserPromise;
		await b.close();
		browserPromise = null;
	}
}

export async function capturePublicUrlCheck(
	url: string,
	width: number,
	height: number,
): Promise<{ metrics: PageCaptureMetrics; outboundLinks: CapturedPage['outboundLinks'] }> {
	await assertResolvedPublicHost(url);
	const browser = await getBrowser();
	const context = await browser.newContext({ viewport: { width, height } });
	const page = await context.newPage();
	try {
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_GOTO_TIMEOUT_MS });
		await page.waitForTimeout(250);
		const { metrics, outboundLinks } = await collectMetrics(page, url);
		return { metrics: { ...metrics, url, path: metrics.path }, outboundLinks };
	} finally {
		await context.close();
	}
}

export const capturePageWithPlaywright: BrowserCapture = async (
	pool,
	projectId,
	url,
	width,
	height,
) => {
	await assertResolvedPublicHost(url);
	const browser = await getBrowser();
	const context = await browser.newContext({ viewport: { width, height } });
	const page = await context.newPage();
	try {
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_GOTO_TIMEOUT_MS });
		await page.waitForTimeout(400);
		const png = await page.screenshot({ type: 'png', fullPage: false });
		const { metrics, outboundLinks } = await collectMetrics(page, url);
		const assetId = await insertProjectAsset(pool, projectId, 'image/png', Buffer.from(png));
		return {
			assetId,
			metrics: { ...metrics, url, path: metrics.path },
			outboundLinks,
		};
	} finally {
		await context.close();
	}
};

export async function screenshotUrlToBuffer(
	url: string,
	width: number,
	height: number,
): Promise<Buffer> {
	await assertResolvedPublicHost(url);
	const browser = await getBrowser();
	const context = await browser.newContext({ viewport: { width, height } });
	const page = await context.newPage();
	try {
		await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_GOTO_TIMEOUT_MS });
		await page.waitForTimeout(400);
		const png = await page.screenshot({ type: 'png', fullPage: false });
		return Buffer.from(png);
	} finally {
		await context.close();
	}
}

export { buildPageUrl };