import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Card } from './Card';

describe('Card', () => {
	it('renders title and footer', () => {
		render(
			<Card title="Revenue" footer="Updated">
				Body
			</Card>,
		);
		expect(screen.getByText('Revenue')).toBeInTheDocument();
		expect(screen.getByText('Updated')).toBeInTheDocument();
	});

	it('applies variant class', () => {
		const { container } = render(<Card variant="elevated">X</Card>);
		expect(container.firstChild).toHaveClass('bf-card--elevated');
	});

	it('has no axe violations', async () => {
		const { container } = render(<Card title="T">Body</Card>);
		expect(await axe(container)).toHaveNoViolations();
	});
});
