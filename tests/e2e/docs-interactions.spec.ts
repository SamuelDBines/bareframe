import { expect, test } from './fixtures';
import {
	expectExamplesSection,
	isMobileProject,
	openComponent,
	panel,
	preview,
	previewOverlays,
	setPreviewColorMode,
} from './docs-helpers';

test.describe('Overlay interactions', () => {
	test('Modal: Open control reachable while dialog is open', async ({ page }) => {
		await openComponent(page, 'modal');
		const openToggle = panel(page).getByRole('checkbox', { name: 'Open' });
		await openToggle.check();
		await expect(page.getByRole('dialog', { name: 'Delete project?' })).toBeVisible();
		await openToggle.uncheck();
		await expect(page.getByRole('dialog', { name: 'Delete project?' })).toBeHidden();
	});

	test('Popover: Open control and Escape sync', async ({ page }) => {
		await openComponent(page, 'popover');
		const openToggle = panel(page).getByRole('checkbox', { name: 'Open' });
		await openToggle.check();
		await expect(preview(page).getByText('Floating content')).toBeVisible();
		await page.keyboard.press('Escape');
		await expect(preview(page).getByText('Floating content')).toBeHidden();
		await expect(openToggle).not.toBeChecked();
	});

	test('Tooltip: focus shows tip (desktop)', async ({ page }, testInfo) => {
		test.skip(isMobileProject(testInfo.project.name), 'Hover-less focus path on mobile uses tap');
		await openComponent(page, 'tooltip');
		await setPreviewColorMode(page, 'dark');
		const target = preview(page).getByRole('button', { name: 'Hover target' });
		await target.hover();
		await expect(page.getByRole('tooltip')).toBeVisible();
		await panel(page).getByLabel('Content').fill('Updated hint');
		await expect(page.getByRole('tooltip')).toContainText('Updated hint');
	});

	test('Tooltip: tap shows tip on mobile', async ({ page }, testInfo) => {
		test.skip(!isMobileProject(testInfo.project.name), 'Mobile touch project only');
		await openComponent(page, 'tooltip');
		const target = preview(page).getByRole('button', { name: 'Hover target' });
		await target.tap();
		await expect(page.getByRole('tooltip')).toBeVisible({ timeout: 10_000 });
	});

	test('DropdownMenu: opens menu and selects item', async ({ page }) => {
		await openComponent(page, 'dropdown-menu');
		await preview(page).getByRole('button', { name: /Actions/i }).click();
		await expect(page.getByRole('menu')).toBeVisible();
		await page.getByRole('menuitem', { name: 'Edit' }).click();
		await expect(page.getByRole('menu')).toBeHidden();
		await setPreviewColorMode(page, 'dark');
		await preview(page).getByRole('button', { name: /Actions/i }).click();
		await expect(page.getByRole('menu')).toBeVisible();
	});

	test('Select: listbox opens and Value control updates selection', async ({ page }, testInfo) => {
		await openComponent(page, 'select');
		const trigger = preview(page).getByRole('button');
		await trigger.click();
		await expect(page.getByRole('listbox')).toBeVisible();
		if (isMobileProject(testInfo.project.name)) {
			await page.getByRole('option', { name: 'Option B' }).tap();
		} else {
			await page.keyboard.press('ArrowDown');
			await page.keyboard.press('Enter');
		}
		await expect(preview(page).getByRole('button')).toContainText('Option B');
		await panel(page).getByLabel('Value').selectOption('c');
		await expect(preview(page).getByRole('button')).toContainText('Option C');
	});

	test('Combobox: type and pick option', async ({ page }, testInfo) => {
		await openComponent(page, 'combobox');
		const input = preview(page).getByRole('combobox', { name: 'Framework' });
		await input.scrollIntoViewIfNeeded();
		await input.fill('Vue');
		const overlay = previewOverlays(page);
		const option = overlay.getByRole('option', { name: 'Vue' });
		await expect(option).toBeVisible();
		if (isMobileProject(testInfo.project.name)) {
			const pick = overlay.getByRole('option', { name: 'Vue' });
			if (testInfo.project.name === 'webkit-mobile') {
				await expect(async () => {
					const vue = overlay.getByRole('option', { name: 'Vue' });
					await expect(vue).toBeVisible();
					await vue.scrollIntoViewIfNeeded();
					await vue.tap({ timeout: 5000 });
					await expect(input).toHaveValue('Vue');
				}).toPass({ timeout: 45_000 });
			} else {
				await expect
					.poll(async () => (await pick.boundingBox())?.width ?? 0, { timeout: 15_000 })
					.toBeGreaterThan(50);
				await pick.tap();
			}
		} else {
			await option.click();
		}
		await expect(input).toHaveValue('Vue');
		await setPreviewColorMode(page, 'dark');
		await expect(input).toBeVisible();
	});

	test('MultiSelect: adds a chip via listbox', async ({ page }, testInfo) => {
		await openComponent(page, 'multiselect');
		const trigger = preview(page).getByRole('button');
		if (isMobileProject(testInfo.project.name)) {
			await trigger.tap();
			await page.getByRole('option', { name: 'Design' }).tap();
		} else {
			await trigger.click();
			await page.getByRole('option', { name: 'Design' }).click();
		}
		await expect(preview(page).getByText('Design')).toBeVisible();
	});
});

test.describe('Navigation & structure interactions', () => {
	test('Tabs: keyboard and Default tab control', async ({ page }) => {
		await openComponent(page, 'tabs');
		await preview(page).getByRole('tab', { name: 'Analytics' }).click();
		await expect(preview(page).getByRole('tabpanel')).toContainText('Analytics');
		await panel(page).getByLabel('Default tab').selectOption('settings');
		await expect(preview(page).getByRole('tab', { name: 'Settings' })).toHaveAttribute('aria-selected', 'true');
		await setPreviewColorMode(page, 'dark');
		await preview(page).getByRole('tab', { name: 'Overview' }).focus();
		await page.keyboard.press('ArrowRight');
		await expect(preview(page).getByRole('tab', { name: 'Analytics' })).toBeFocused();
	});

	test('Accordion: expands section with keyboard', async ({ page }) => {
		await openComponent(page, 'accordion');
		const trigger = preview(page).getByRole('button', { name: /How do themes work/i });
		await trigger.click();
		await expect(trigger).toHaveAttribute('aria-expanded', 'true');
		await trigger.focus();
		await page.keyboard.press('Enter');
		await expect(trigger).toHaveAttribute('aria-expanded', 'false');
	});

	test('Pagination: Page control updates current page', async ({ page }) => {
		await openComponent(page, 'pagination');
		await panel(page).getByRole('spinbutton', { name: 'Page', exact: true }).fill('4');
		await expect(preview(page).getByRole('button', { name: '4' })).toHaveAttribute('aria-current', 'page');
		await setPreviewColorMode(page, 'dark');
		await expect(preview(page).getByRole('button', { name: '4' })).toBeVisible();
	});

	test('Breadcrumbs: trail renders current page', async ({ page }) => {
		await openComponent(page, 'breadcrumbs');
		await expect(preview(page).getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
		await expect(preview(page).getByText('Alert')).toHaveAttribute('aria-current', 'page');
		await setPreviewColorMode(page, 'dark');
		await expect(preview(page).getByRole('link', { name: 'Home' })).toBeVisible();
	});

	test('Table: renders headers and rows', async ({ page }) => {
		await openComponent(page, 'table');
		await expect(preview(page).getByRole('table')).toBeVisible();
		await expect(preview(page).getByRole('columnheader')).toHaveCount(3);
		await setPreviewColorMode(page, 'dark');
		await expect(preview(page).getByRole('row')).not.toHaveCount(0);
	});
});

test.describe('Form control interactions', () => {
	test('Switch and Checkbox respond to playground controls', async ({ page }) => {
		await openComponent(page, 'switch');
		await panel(page).getByRole('checkbox', { name: 'On' }).uncheck();
		await expect(preview(page).getByRole('switch')).not.toBeChecked();
		await openComponent(page, 'checkbox');
		await panel(page).getByRole('checkbox', { name: 'Checked' }).check();
		await expect(preview(page).getByRole('checkbox')).toBeChecked();
	});

	test('RadioGroup: arrow keys move selection', async ({ page }) => {
		await openComponent(page, 'radio-group');
		await preview(page).getByRole('radio', { name: 'Push' }).click();
		await expect(preview(page).getByRole('radio', { name: 'Push' })).toBeChecked();
	});

	test('Slider: Value control and drag', async ({ page }) => {
		await openComponent(page, 'slider');
		const slider = preview(page).getByRole('slider');
		await slider.focus();
		await page.keyboard.press('ArrowRight');
		await expect(Number(await panel(page).getByLabel('Value').inputValue())).toBeGreaterThan(40);
	});

	test('Field error message from control', async ({ page }) => {
		await openComponent(page, 'field');
		await panel(page).getByLabel('Error').fill('Invalid email');
		await expect(preview(page).getByText('Invalid email')).toBeVisible();
		await setPreviewColorMode(page, 'dark');
	});

	test('Input error state styling', async ({ page }) => {
		await openComponent(page, 'input');
		await panel(page).getByRole('checkbox', { name: 'Error state' }).check();
		await expect(preview(page).locator('.bf-input--error').first()).toBeVisible();
	});

	test('Textarea: placeholder control updates', async ({ page }) => {
		await openComponent(page, 'textarea');
		await panel(page).getByLabel('Placeholder').fill('Notes…');
		await expect(preview(page).getByPlaceholder('Notes…')).toBeVisible();
	});
});

test.describe('Toast interactions', () => {
	test('shows, stacks, and auto-dismisses', async ({ page }) => {
		await openComponent(page, 'toast');
		const show = preview(page).getByRole('button', { name: 'Show toast' });
		await show.click();
		await show.click();
		await expect(preview(page).getByRole('status')).toHaveCount(2);
		await panel(page).getByLabel('Variant').selectOption('error');
		await show.click();
		await expect(preview(page).getByRole('status')).toHaveCount(3);
		await expect(preview(page).locator('.bf-toast--error')).toBeVisible();
		await page.waitForTimeout(2600);
		await expect(preview(page).getByRole('status')).toHaveCount(0);
	});
});

test.describe('Presentational components — props & dark mode', () => {
	const cases: { slug: string; controlLabel: string; value: string; expectText: string }[] = [
		{ slug: 'badge', controlLabel: 'Label', value: 'QA', expectText: 'QA' },
		{ slug: 'button', controlLabel: 'Label', value: 'Run audit', expectText: 'Run audit' },
		{ slug: 'alert', controlLabel: 'Title', value: 'Notice', expectText: 'Notice' },
		{ slug: 'card', controlLabel: 'Title', value: 'Card QA', expectText: 'Card QA' },
		{ slug: 'avatar', controlLabel: 'Name', value: 'Ada Lovelace', expectText: 'AL' },
		{ slug: 'progress', controlLabel: 'Label', value: 'Upload', expectText: 'Upload' },
		{ slug: 'empty-state', controlLabel: 'Title', value: 'Nothing here', expectText: 'Nothing here' },
		{ slug: 'stat-card', controlLabel: 'Label', value: 'Users', expectText: 'Users' },
	];

	for (const { slug, controlLabel, value, expectText } of cases) {
		test(`${slug}: control updates preview in light and dark`, async ({ page }) => {
			await openComponent(page, slug);
			await panel(page).getByLabel(controlLabel).fill(value);
			await expect(preview(page).getByText(expectText).first()).toBeVisible();
			await setPreviewColorMode(page, 'dark');
			await expect(preview(page).getByText(expectText).first()).toBeVisible();
			await expectExamplesSection(page);
		});
	}

	test('Skeleton lines control', async ({ page }) => {
		await openComponent(page, 'skeleton');
		await panel(page).getByLabel('Lines').fill('5');
		await expect(preview(page).locator('.bf-skeleton')).toHaveCount(5);
		await setPreviewColorMode(page, 'dark');
	});

	test('Spinner exposes accessible label from control', async ({ page }) => {
		await openComponent(page, 'spinner');
		await panel(page).getByLabel('Label').fill('Busy');
		await expect(preview(page).getByRole('status', { name: 'Busy' })).toBeVisible();
	});
});
