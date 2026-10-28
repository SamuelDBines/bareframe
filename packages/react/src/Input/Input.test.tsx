import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Field, Input } from './Input';

describe('Input', () => {
	it('renders text field', () => {
		render(<Input aria-label="Email" placeholder="you@example.com" />);
		expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
	});

	it('Field shows label and error', () => {
		render(<Field label="Email" errorMessage="Required" defaultValue="" />);
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Required')).toBeInTheDocument();
	});

	it('Field accepts typing uncontrolled', async () => {
		const user = userEvent.setup();
		render(<Field label="Name" defaultValue="" />);
		await user.type(screen.getByRole('textbox'), 'Ada');
		expect(screen.getByRole('textbox')).toHaveValue('Ada');
	});

	it('has no axe violations', async () => {
		const { container } = render(<Field label="Name" defaultValue="Ada" />);
		expect(await axe(container)).toHaveNoViolations();
	});
});
