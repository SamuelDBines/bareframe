import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@react-aria/i18n';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Accordion, Pagination, Tabs } from './navigation';

function wrap(ui: React.ReactElement) {
	return render(<I18nProvider locale="en-US">{ui}</I18nProvider>);
}

describe('Tabs', () => {
	const items = [
		{ id: 'a', label: 'Tab A', content: 'Panel A' },
		{ id: 'b', label: 'Tab B', content: 'Panel B' },
	];

	it('renders default panel uncontrolled', () => {
		wrap(<Tabs items={items} defaultValue="a" />);
		expect(screen.getByRole('tab', { name: 'Tab A' })).toHaveAttribute('aria-selected', 'true');
		expect(screen.getByText('Panel A')).toBeInTheDocument();
	});

	it('switches tabs on click (uncontrolled)', async () => {
		const user = userEvent.setup();
		wrap(<Tabs items={items} defaultValue="a" />);
		await user.click(screen.getByRole('tab', { name: 'Tab B' }));
		expect(screen.getByText('Panel B')).toBeInTheDocument();
	});

	it('supports controlled value', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		const { rerender } = wrap(<Tabs items={items} value="a" onChange={onChange} />);
		await user.click(screen.getByRole('tab', { name: 'Tab B' }));
		expect(onChange).toHaveBeenCalledWith('b');
		rerender(
			<I18nProvider locale="en-US">
				<Tabs items={items} value="b" onChange={onChange} />
			</I18nProvider>,
		);
		expect(screen.getByText('Panel B')).toBeInTheDocument();
	});

	it('moves focus with arrow keys', async () => {
		const user = userEvent.setup();
		wrap(<Tabs items={items} defaultValue="a" />);
		const tabA = screen.getByRole('tab', { name: 'Tab A' });
		tabA.focus();
		await user.keyboard('{ArrowRight}');
		expect(screen.getByRole('tab', { name: 'Tab B' })).toHaveFocus();
	});

	it('has no axe violations', async () => {
		const { container } = wrap(<Tabs items={items} />);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe('Accordion', () => {
	const items = [
		{ id: '1', title: 'First', content: 'First panel' },
		{ id: '2', title: 'Second', content: 'Second panel' },
	];

	it('expands first item by default', () => {
		wrap(<Accordion items={items} />);
		expect(screen.getByText('First panel')).toBeVisible();
	});

	it('toggles sections on trigger click', async () => {
		const user = userEvent.setup();
		wrap(<Accordion items={items} />);
		await user.click(screen.getByRole('button', { name: 'Second' }));
		expect(screen.getByText('Second panel')).toBeVisible();
	});

	it('supports controlled expanded keys', async () => {
		const user = userEvent.setup();
		const onExpandedChange = vi.fn();
		wrap(
			<Accordion
				items={items}
				expandedKeys={new Set(['1'])}
				onExpandedChange={onExpandedChange}
			/>,
		);
		await user.click(screen.getByRole('button', { name: 'Second' }));
		expect(onExpandedChange).toHaveBeenCalled();
	});

	it('has no axe violations', async () => {
		const { container } = wrap(<Accordion items={items} />);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe('Pagination', () => {
	it('calls onPageChange', async () => {
		const user = userEvent.setup();
		const onPageChange = vi.fn();
		wrap(<Pagination page={2} total={4} onPageChange={onPageChange} />);
		await user.click(screen.getByRole('button', { name: '3' }));
		expect(onPageChange).toHaveBeenCalledWith(3);
	});
});
