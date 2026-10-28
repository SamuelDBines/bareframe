import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { axe } from 'vitest-axe';
import { Progress, Skeleton, Spinner, Toast } from './feedback';

describe('feedback components', () => {
	it('Progress reflects value', () => {
		render(<Progress value={65} />);
		expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '65');
	});

	it('Spinner exposes status role', () => {
		render(<Spinner label="Loading" />);
		expect(screen.getByRole('status')).toBeInTheDocument();
	});

	it('Skeleton renders lines', () => {
		const { container } = render(<Skeleton lines={3} />);
		expect(container.querySelectorAll('.bf-skeleton')).toHaveLength(3);
	});

	it('Toast renders message', () => {
		render(<Toast>Hi</Toast>);
		expect(screen.getByRole('status')).toHaveTextContent('Hi');
	});

	it('has no axe violations on toast', async () => {
		const { container } = render(<Toast>Hi</Toast>);
		expect(await axe(container)).toHaveNoViolations();
	});
});
