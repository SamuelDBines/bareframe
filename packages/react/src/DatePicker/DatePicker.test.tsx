import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nProvider } from '@react-aria/i18n';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
	it('renders labeled field', () => {
		render(
			<I18nProvider locale="en-US">
				<DatePicker label="Start date" />
			</I18nProvider>,
		);
		expect(screen.getByRole('group', { name: 'Start date' })).toBeInTheDocument();
	});

	it('opens calendar on button press', async () => {
		const user = userEvent.setup();
		render(
			<I18nProvider locale="en-US">
				<DatePicker label="Start date" />
			</I18nProvider>,
		);
		await user.click(screen.getByRole('button', { name: /Calendar/i }));
		expect(await screen.findByRole('grid')).toBeInTheDocument();
	});

	it('has no axe violations', async () => {
		const { container } = render(
			<I18nProvider locale="en-US">
				<DatePicker label="Start date" />
			</I18nProvider>,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
