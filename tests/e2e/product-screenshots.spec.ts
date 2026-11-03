import { test } from '@playwright/test';
import path from 'node:path';

const ARTIFACTS = '/opt/cursor/artifacts';
const BASE = '/#/';

async function shot(page: import('@playwright/test').Page, hash: string, name: string) {
  await page.goto(`${BASE}${hash}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForSelector('.app-shell, .flow-map-workspace, .app-review-panel', { timeout: 30_000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(ARTIFACTS, name),
    fullPage: true,
  });
}

test.describe('Product marketing screenshots', () => {
  test.setTimeout(120_000);
  test('capture homepage, pricing, app, import, share', async ({ page }) => {
    await shot(page, '', 'product-home.png');
    await shot(page, 'pricing', 'product-pricing.png');

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`${BASE}demo/journey-review`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-testid="flow-map-workspace"]', { timeout: 30_000 });
    await page.waitForSelector('.flow-map-card', { timeout: 15_000 });
    await page.waitForTimeout(1200);
    await page.locator('.app-project-canvas').screenshot({
      path: path.join(ARTIFACTS, 'product-flow-map.png'),
    });
    await page.locator('.app-project-layout').screenshot({
      path: path.join(ARTIFACTS, 'product-app-review-callouts.png'),
    });

    await shot(page, 'app', 'product-app-hub.png');

    await page.getByRole('button', { name: 'Import from Figma' }).first().click();
    await page.waitForSelector('[data-testid="app-figma-url"]');
    await page.screenshot({
      path: path.join(ARTIFACTS, 'product-figma-import.png'),
      fullPage: true,
    });

    await page.goto(`${BASE}demo/journey-review`, { waitUntil: 'domcontentloaded' });
    await page.getByTestId('flow-mode-prototype').click();
    await page.waitForSelector('[data-testid="prototype-player"]');
    await page.waitForTimeout(800);
    await page.locator('.app-project-canvas').screenshot({
      path: path.join(ARTIFACTS, 'product-prototype-mode.png'),
    });

    await page.goto(`${BASE}app`, { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Import website' }).click();
    await page.waitForSelector('h1:has-text("Import a live URL")');
    await page.screenshot({
      path: path.join(ARTIFACTS, 'product-url-import.png'),
      fullPage: true,
    });
    await shot(page, 'demo/share-canvas', 'product-share-canvas.png');
  });
});
