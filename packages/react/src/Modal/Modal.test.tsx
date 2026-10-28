import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button/Button';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button/Button';
import { Modal } from './Modal';

describe('Modal', () => {
	it('renders when open', () => {
		render(
			<Modal isOpen title="Confirm">
				Body copy
			</Modal>,
		);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
		expect(screen.getByText('Confirm')).toBeInTheDocument();
	});

	it('traps focus on primary action', async () => {
		const user = userEvent.setup();
		render(
			<Modal
				isOpen
				title="Delete"
				footer={
					<>
						<Button variant="ghost">Cancel</Button>
						<Button variant="destructive">Delete</Button>
					</>
				}
			>
				Are you sure?
			</Modal>,
		);
		await user.tab();
		expect(screen.getByRole('button', { name: 'Cancel' })).toHaveFocus();
	});

	it('has no axe violations when open', async () => {
		const { container } = render(
			<Modal isOpen title="Title">
				Content
			</Modal>,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
