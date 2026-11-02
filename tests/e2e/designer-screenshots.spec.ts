import { test } from '@playwright/test';
import path from 'node:path';

const ARTIFACTS = '/opt/cursor/artifacts';
const BASE = '/designer/index.html#';

async function shot(page: import('@playwright/test').Page, hash: string, name: string) {
  await page.goto(`${BASE}${hash}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await page.waitForSelector('.app-shell, .designer-workspace-v2', { timeout: 30_000 });
  await page.waitForTimeout(400);
  await page.screenshot({
    path: path.join(ARTIFACTS, name),
    fullPage: true,
  });
}

test.describe('Designer UI screenshots', () => {
  test.setTimeout(120_000);
  test('capture main designer screens', async ({ page }) => {
    await shot(page, '/', 'designer-home-dashboard.png');
    await shot(page, '/product/new', 'designer-new-product-intake.png');
    await shot(page, '/demo/package-review', 'designer-package-review-play.png');
    await shot(page, '/demo/flow-map', 'designer-flow-map.png');
    await shot(page, '/editor', 'designer-canvas.png');
    await shot(page, '/product/generating/demo-job', 'designer-package-generating.png');
  });
});
