import type pg from 'pg';
import { chromium, type Page } from 'playwright';
import { extractLinks } from '@bareframe/flow-map-engine';
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

async function collectMetrics(page: Page, url: string): Promise<{
	metrics: Omit<PageCaptureMetrics, 'url'>;
	outboundLinks: CapturedPage['outboundLinks'];
}> {
	const origin = new URL(url).origin;
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
		return { scrollWidth, clientWidth, hasHeader, hasBottomBar, minSideMargin, offBrand };
	});

	const html = await page.content();
	const path = new URL(url).pathname || '/';
	const links = extractLinks(html, origin).slice(0, 30).map((l) => ({
		path: l.href,
		label: l.text,
		trigger: 'link' as const,
	}));

	return {
		metrics: {
			path,
			scrollWidth: data.scrollWidth,
			clientWidth: data.clientWidth,
			hasHeader: data.hasHeader,
			hasBottomBar: data.hasBottomBar,
			minSideMargin: Math.max(0, Math.round(data.minSideMargin)),
			offBrandColorHits: data.offBrand,
		},
		outboundLinks: links,
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
		await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
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
		await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
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
		await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
		const png = await page.screenshot({ type: 'png', fullPage: false });
		return Buffer.from(png);
	} finally {
		await context.close();
	}
}
