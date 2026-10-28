import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@react-aria/i18n';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { DatePicker } from './DatePicker';

function renderPicker(ui = <DatePicker label="Start date" />) {
	return render(<I18nProvider locale="en-US">{ui}</I18nProvider>);
}

describe('DatePicker', () => {
	it('renders labeled field', () => {
		renderPicker();
		expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument();
	});

	it('opens calendar on button press', async () => {
		const user = userEvent.setup();
		renderPicker();
		await user.click(screen.getByText('📅'));
		expect(await screen.findByRole('grid')).toBeInTheDocument();
	});

	it('has no axe violations', async () => {
		const { container } = renderPicker();
		expect(await axe(container)).toHaveNoViolations();
	});
});
