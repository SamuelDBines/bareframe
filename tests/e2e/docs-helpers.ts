import { expect, type Page } from '@playwright/test';

export async function openComponent(page: Page, slug: string) {
	await page.goto(`/#/components/${slug}`, { waitUntil: 'domcontentloaded' });
	await expect(page.getByTestId('playground-preview')).toBeVisible({ timeout: 25_000 });
}

export function preview(page: Page) {
	return page.getByTestId('playground-preview');
}

export function panel(page: Page) {
	return page.locator('.playground-panel');
}

export async function setPreviewColorMode(page: Page, mode: 'light' | 'dark') {
	const label = mode === 'light' ? 'Light' : 'Dark';
	await page
		.locator('.playground-frame__toolbar')
		.getByRole('group', { name: 'Color mode' })
		.getByRole('button', { name: label })
		.click();
}

export async function expectExamplesSection(page: Page) {
	const examples = page.locator('#examples .doc-example-preview');
	if ((await examples.count()) > 0) {
		await expect(examples.first()).toBeVisible();
	}
}

export function isMobileProject(projectName: string) {
	return projectName === 'chromium-mobile';
}

export function isDesktopProject(projectName: string) {
	return projectName === 'chromium-desktop' || projectName === 'webkit-desktop';
}
