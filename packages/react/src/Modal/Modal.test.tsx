import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { axe } from 'vitest-axe';
import { Button } from '../Button/Button';
import { Drawer, Modal } from './Modal';

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

	it('does not render when closed', () => {
		render(
			<Modal isOpen={false} title="Hidden">
				Nope
			</Modal>,
		);
		expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
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

describe('Drawer', () => {
	it('renders when open', () => {
		render(
			<Drawer isOpen title="Panel">
				Drawer body
			</Drawer>,
		);
		expect(screen.getByRole('dialog')).toHaveTextContent('Drawer body');
	});

	it('has no axe violations', async () => {
		const { container } = render(
			<Drawer isOpen title="Panel">
				Body
			</Drawer>,
		);
		expect(await axe(container)).toHaveNoViolations();
	});
});
