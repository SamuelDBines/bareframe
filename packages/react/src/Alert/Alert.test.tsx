import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Alert } from './Alert';

describe('Alert', () => {
	it('renders title and message', () => {
		render(<Alert title="Heads up">Something happened</Alert>);
		expect(screen.getByRole('alert')).toBeInTheDocument();
		expect(screen.getByText('Heads up')).toBeInTheDocument();
		expect(screen.getByText('Something happened')).toBeInTheDocument();
	});

	it('applies variant class', () => {
		render(
			<Alert variant="success" title="Saved">
				OK
			</Alert>,
		);
		expect(screen.getByRole('alert')).toHaveClass('bf-alert--success');
	});

	it('dismisses when dismissible', async () => {
		const user = userEvent.setup();
		const onDismiss = vi.fn();
		render(
			<Alert dismissible title="Note" onDismiss={onDismiss}>
				Bye
			</Alert>,
		);
		await user.click(screen.getByRole('button', { name: 'Dismiss alert' }));
		expect(onDismiss).toHaveBeenCalled();
		expect(screen.queryByRole('alert')).not.toBeInTheDocument();
	});

	it('has no axe violations', async () => {
		const { container } = render(<Alert title="Info">Message</Alert>);
		expect(await axe(container)).toHaveNoViolations();
	});
});
