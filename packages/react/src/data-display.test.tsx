import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Avatar, EmptyState, StatCard, Table } from './data-display';

describe('data display', () => {
	it('renders demo table', () => {
		render(<Table />);
		expect(screen.getByRole('table')).toBeInTheDocument();
		expect(screen.getByText('Ava Chen')).toBeInTheDocument();
	});

	it('renders empty state', () => {
		render(<EmptyState title="Nothing here" description="Try creating a project." />);
		expect(screen.getByText('Nothing here')).toBeInTheDocument();
	});

	it('renders stat card', () => {
		render(<StatCard label="Users" value="1,024" />);
		expect(screen.getByText('1,024')).toBeInTheDocument();
	});

	it('renders avatar with accessible name', () => {
		render(<Avatar name="Ada Lovelace" />);
		expect(screen.getByRole('img', { name: 'Ada Lovelace' })).toHaveTextContent('AL');
	});

	it('has no axe violations on table', async () => {
		const { container } = render(<Table />);
		expect(await axe(container)).toHaveNoViolations();
	});
});
