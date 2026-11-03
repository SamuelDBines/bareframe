import { test } from '@playwright/test';
import path from 'node:path';

const ARTIFACTS = '/opt/cursor/artifacts';
const BASE = '/designer/index.html#';

async function shot(page: import('@playwright/test').Page, hash: string, name: string) {
  await page.goto(`${BASE}${hash}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  if (hash.includes('flow-map')) {
    await page.waitForSelector('[data-testid="flow-map-workspace"]', { timeout: 30_000 });
    await page.waitForSelector('.flow-map-card', { timeout: 15_000 });
  } else {
    await page.waitForSelector('.app-shell, .designer-workspace-v2, .ds-review-workspace, .app-page', {
      timeout: 30_000,
    });
  }

  const iframe = page.locator('.frame-preview-iframe');
  if (hash.includes('package-review') && (await iframe.count()) > 0) {
    await page
      .frameLocator('.ds-review-stage .frame-preview-iframe')
      .locator('.bf-btn--primary, .bf-btn-primary')
      .first()
      .waitFor({ timeout: 15_000 });
  }

  await page.waitForTimeout(300);
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
