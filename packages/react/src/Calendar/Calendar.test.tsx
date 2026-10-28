import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Calendar } from './Calendar';

describe('Calendar', () => {
	it('renders calendar grid', () => {
		render(<Calendar aria-label="Choose date" />);
		expect(screen.getByRole('grid')).toBeInTheDocument();
	});

	it('has no axe violations', async () => {
		const { container } = render(<Calendar aria-label="Choose date" />);
		expect(await axe(container)).toHaveNoViolations();
	});
});
