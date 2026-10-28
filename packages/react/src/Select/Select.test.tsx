import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Combobox, MultiSelect, Select } from './Select';

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

describe('Combobox', () => {
	it('renders with visible label', () => {
		render(<Combobox label="Tool" options={options} />);
		expect(screen.getByRole('combobox', { name: 'Tool' })).toBeInTheDocument();
	});

	it('calls onChange when controlled', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<Combobox label="Tool" options={options} value="a" onChange={onChange} />,
		);
		await user.click(screen.getByRole('button', { name: /Tool options/ }));
		await user.click(await screen.findByRole('option', { name: 'Beta' }));
		expect(onChange).toHaveBeenCalledWith('b');
	});

	it('has no axe violations with aria-label', async () => {
		const { container } = render(
			<Combobox aria-label="Search" options={options} defaultValue="a" />,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});

describe('MultiSelect', () => {
	it('adds chip on selection uncontrolled', async () => {
		const user = userEvent.setup();
		render(
			<MultiSelect label="Tags" options={options} defaultValue={['a']} />,
		);
		await user.click(screen.getByRole('button', { name: /Add… Tags/ }));
		await user.click(await screen.findByRole('option', { name: 'Beta' }));
		expect(screen.getByText('Beta')).toBeInTheDocument();
	});

	it('supports controlled value', async () => {
		const user = userEvent.setup();
		const onChange = vi.fn();
		render(
			<MultiSelect label="Tags" options={options} value={['a']} onChange={onChange} />,
		);
		await user.click(screen.getByRole('button', { name: /Add… Tags/ }));
		await user.click(await screen.findByRole('option', { name: 'Beta' }));
		expect(onChange).toHaveBeenCalledWith(['a', 'b']);
	});

	it('has no axe violations', async () => {
		const { container } = render(
			<MultiSelect aria-label="Tags" options={options} defaultValue={[]} />,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
