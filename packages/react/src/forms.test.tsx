import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@react-aria/i18n';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Checkbox, RadioGroup, Slider, Switch, Textarea } from './forms';

function wrap(ui: React.ReactElement) {
	return render(<I18nProvider locale="en-US">{ui}</I18nProvider>);
}

describe('Checkbox', () => {
	it('toggles uncontrolled', async () => {
		const user = userEvent.setup();
		wrap(<Checkbox label="Accept" />);
		const box = screen.getByRole('checkbox');
		expect(box).not.toBeChecked();
		await user.click(box);
		expect(box).toBeChecked();
	});

	it('respects controlled checked state', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		wrap(<Checkbox label="Accept" checked onChange={onChange} />);
		await user.click(screen.getByRole('checkbox'));
		expect(onChange).toHaveBeenCalled();
	});

	it('has no axe violations', async () => {
		const { container } = wrap(<Checkbox label="Accept" />);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe('Switch', () => {
	it('toggles with keyboard', async () => {
		const user = userEvent.setup();
		wrap(<Switch label="Notifications" />);
		const sw = screen.getByRole('switch');
		sw.focus();
		await user.keyboard('[Space]');
		expect(sw).toBeChecked();
	});
});

describe('Textarea', () => {
	it('accepts typing', async () => {
		const user = userEvent.setup();
		wrap(<Textarea aria-label="Notes" />);
		const field = screen.getByRole('textbox');
		await user.type(field, 'Hello');
		expect(field).toHaveValue('Hello');
	});
});

describe('RadioGroup', () => {
	it('selects option with arrow keys', async () => {
		const user = userEvent.setup();
		wrap(<RadioGroup aria-label="Plan" />);
		const first = screen.getAllByRole('radio')[0];
		first.focus();
		await user.keyboard('{ArrowDown}');
		expect(screen.getAllByRole('radio')[1]).toHaveFocus();
	});
});

describe('Slider', () => {
	it('renders labeled range input', () => {
		wrap(<Slider label="Volume" defaultValue={40} />);
		expect(screen.getByRole('slider')).toHaveValue('40');
	});
});
