import { test } from '@playwright/test';
import path from 'node:path';

const ARTIFACTS = '/opt/cursor/artifacts';
const BASE = '/#/';

async function shot(page: import('@playwright/test').Page, hash: string, name: string) {
  await page.goto(`${BASE}${hash}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForSelector('.app-shell, .designer-workspace-v2, .app-review-panel', { timeout: 30_000 });
  await page.waitForTimeout(400);
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
    await shot(page, 'demo/journey-review', 'product-app-review-callouts.png');
    await shot(page, 'app', 'product-app-hub.png');
    await page.getByRole('button', { name: 'Import website' }).click();
    await page.waitForSelector('h1:has-text("Import a live URL")');
    await page.screenshot({
      path: path.join(ARTIFACTS, 'product-url-import.png'),
      fullPage: true,
    });
    await shot(page, 'demo/share-canvas', 'product-share-canvas.png');
  });
});
