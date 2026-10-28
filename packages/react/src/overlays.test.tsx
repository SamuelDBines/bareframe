import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@react-aria/i18n';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { DropdownMenu, Popover, Tooltip } from './overlays';

function wrap(ui: React.ReactElement) {
	return render(<I18nProvider locale="en-US">{ui}</I18nProvider>);
}

describe('Tooltip', () => {
	it('renders trigger', () => {
		wrap(<Tooltip content="Hint">Target</Tooltip>);
		expect(screen.getByRole('button', { name: 'Target' })).toBeInTheDocument();
	});

	it('has no axe violations', async () => {
		const { container } = wrap(<Tooltip content="Hint">Target</Tooltip>);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe('Popover', () => {
	it('opens panel from trigger', async () => {
		const user = userEvent.setup();
		wrap(
			<Popover trigger="Open">
				<p>Popover body</p>
			</Popover>,
		);
		await user.click(screen.getByRole('button', { name: 'Open' }));
		expect(await screen.findByRole('dialog')).toHaveTextContent('Popover body');
	});

	it('has no axe violations when closed', async () => {
		const { container } = wrap(
			<Popover trigger="Open">
				<p>Body</p>
			</Popover>,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe('DropdownMenu', () => {
	it('fires onAction when item chosen', async () => {
		const user = userEvent.setup();
		const onAction = vi.fn();
		wrap(<DropdownMenu label="Menu" onAction={onAction} />);
		await user.click(screen.getByRole('button', { name: /Menu/ }));
		await user.click(await screen.findByRole('menuitem', { name: 'Edit' }));
		expect(onAction).toHaveBeenCalledWith('edit');
	});

	it('has no axe violations', async () => {
		const { container } = wrap(<DropdownMenu />);
		expect(await axe(container)).toHaveNoViolations();
	});
});
