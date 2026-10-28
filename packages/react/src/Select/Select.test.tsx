import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Select } from './Select';

const options = [
	{ value: 'a', label: 'Alpha' },
	{ value: 'b', label: 'Beta' },
];

describe('Select', () => {
	it('renders placeholder', () => {
		render(<Select options={options} aria-label="Pick one" />);
		expect(screen.getByRole('button')).toHaveTextContent('Select…');
	});

	it('opens listbox on click', async () => {
		const user = userEvent.setup();
		render(<Select options={options} aria-label="Pick one" />);
		await user.click(screen.getByRole('button'));
		expect(await screen.findByRole('listbox')).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Alpha' })).toBeInTheDocument();
	});

	it('calls onSelectionChange', async () => {
		const user = userEvent.setup();
		const onSelectionChange = vi.fn();
		render(
			<Select options={options} aria-label="Pick one" onSelectionChange={onSelectionChange} />,
		);
		await user.click(screen.getByRole('button'));
		await user.click(await screen.findByRole('option', { name: 'Beta' }));
		expect(onSelectionChange).toHaveBeenCalled();
	});

	it('has no axe violations', async () => {
		const { container } = render(
			<Select options={options} aria-label="Pick one" defaultSelectedKey="a" />,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
