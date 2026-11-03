import { test } from '@playwright/test';
import path from 'node:path';

const ARTIFACTS_AFTER = '/opt/cursor/artifacts/app-ui-after';
const ARTIFACTS_BEFORE = '/opt/cursor/artifacts/app-ui-before';

type RouteShot = {
  hash: string;
  file: string;
  waitFor?: string;
};

const ROUTES: RouteShot[] = [
  { hash: '/app', file: 'app-hub.png', waitFor: '.app-hero' },
  { hash: '/app/product/new', file: 'app-new-project.png', waitFor: '.app-form-panel' },
  { hash: '/demo/flow-map', file: 'app-demo-flow-map.png', waitFor: '[data-testid="flow-map-workspace"]' },
  { hash: '/demo/journey-review', file: 'app-demo-journey-review.png', waitFor: '[data-testid="flow-map-workspace"]' },
  { hash: '/pricing', file: 'app-pricing.png', waitFor: '.app-pricing-grid' },
  { hash: '/sign-in', file: 'app-sign-in.png', waitFor: '.app-auth-card' },
  { hash: '/examples', file: 'app-examples.png', waitFor: '.app-example-grid' },
  { hash: '/', file: 'app-landing.png', waitFor: '.page-hero' },
];

async function captureRoutes(
  page: import('@playwright/test').Page,
  outDir: string,
  routes: RouteShot[],
) {
  for (const route of routes) {
    const hash = route.hash.startsWith('/') ? route.hash : `/${route.hash}`;
    await page.goto(`/#${hash.replace(/^\//, '')}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
    if (route.waitFor) {
      await page.waitForSelector(route.waitFor, { timeout: 30_000 }).catch(() => undefined);
    }
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outDir, route.file),
      fullPage: true,
    });
  }
}

test.describe('App route screenshots (1440×900)', () => {
  test.setTimeout(180_000);

  test('capture after UI pass', async ({ page }) => {
    await captureRoutes(page, ARTIFACTS_AFTER, ROUTES);
  });
});

const ROUTES_BEFORE: RouteShot[] = [
  { hash: '/app', file: 'app-hub.png', waitFor: '.app-hero' },
  { hash: '/app/product/new', file: 'app-new-project.png', waitFor: '.ds-form-card' },
  { hash: '/demo/flow-map', file: 'app-demo-flow-map.png', waitFor: '.ds-flow-map-graph' },
  { hash: '/demo/journey-review', file: 'app-demo-journey-review.png', waitFor: '.flow-map-workspace, .designer-workspace-v2' },
  { hash: '/pricing', file: 'app-pricing.png', waitFor: '.page-hero' },
  { hash: '/sign-in', file: 'app-sign-in.png', waitFor: '.form-stack' },
  { hash: '/examples', file: 'app-examples.png', waitFor: '.grid-3' },
  { hash: '/', file: 'app-landing.png', waitFor: '.page-hero' },
];

/** Run once on main before the UI pass: APP_UI_BEFORE=1 pnpm exec playwright test app-routes-screenshots */
test.describe('App route before baseline', () => {
  test.skip(!process.env.APP_UI_BEFORE, 'Set APP_UI_BEFORE=1 to capture pre-redesign shots');
  test('capture before UI pass', async ({ page }) => {
    await captureRoutes(page, ARTIFACTS_BEFORE, ROUTES_BEFORE);
  });
});
