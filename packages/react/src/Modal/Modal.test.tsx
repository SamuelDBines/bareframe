import { render, screen, waitFor } from '@testing-library/react';
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

	it('accepts open alias', () => {
		render(
			<Modal open title="Alias">
				Body
			</Modal>,
		);
		expect(screen.getByRole('dialog')).toBeInTheDocument();
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

	it('closes via close button and escape', async () => {
		const user = userEvent.setup();
		const onOpenChange = vi.fn();
		render(
			<Modal isOpen showCloseButton title="Title" onOpenChange={onOpenChange}>
				Content
			</Modal>,
		);
		await user.click(screen.getByRole('button', { name: 'Close dialog' }));
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it('full modal traps focus inside the dialog', async () => {
		const user = userEvent.setup();
		const outside = document.createElement('button');
		outside.type = 'button';
		outside.textContent = 'Outside control';
		document.body.appendChild(outside);

		render(
			<Modal
				isOpen
				title="Confirm"
				footer={
					<>
						<Button variant="ghost">Cancel</Button>
						<Button variant="primary">OK</Button>
					</>
				}
			>
				Body
			</Modal>,
		);

		const dialog = await screen.findByRole('dialog');

		await user.tab();
		expect(dialog.contains(document.activeElement)).toBe(true);
		await user.tab();
		expect(dialog.contains(document.activeElement)).toBe(true);
		expect(outside).not.toHaveFocus();
		outside.remove();
	});

	it('has no axe violations when open', async () => {
		const { container } = render(
			<Modal isOpen title="Title">
				Content
			</Modal>,
		);
		expect(await axe(container)).toHaveNoViolations();
	});

	it('marks page content inert when open as a full modal', async () => {
		const outside = document.createElement('button');
		outside.type = 'button';
		outside.textContent = 'Outside';
		document.body.appendChild(outside);

		render(
			<Modal isOpen title="Confirm">
				Body
			</Modal>,
		);

		await waitFor(() => {
			expect(outside).toHaveAttribute('aria-hidden', 'true');
		});
		outside.remove();
	});

	it('contained mode leaves outside elements interactive and not inert', async () => {
		const outside = document.createElement('button');
		outside.type = 'button';
		outside.textContent = 'Outside';
		document.body.appendChild(outside);

		render(
			<Modal isOpen contained title="Preview">
				Scoped
			</Modal>,
		);

		await waitFor(() => {
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});
		expect(document.querySelector('.bf-modal-overlay--contained')).toBeTruthy();
		expect(outside).not.toHaveAttribute('inert');
		expect(outside).not.toHaveAttribute('aria-hidden', 'true');

		outside.remove();
	});

	it('contained mode keeps focus within the dialog', async () => {
		const user = userEvent.setup();
		render(
			<>
				<button type="button">Outside control</button>
				<Modal
					isOpen
					contained
					showCloseButton
					title="Preview"
					footer={<Button variant="primary">Done</Button>}
				>
					Scoped
				</Modal>
			</>,
		);

		const dialog = await screen.findByRole('dialog');
		const outside = screen.getByRole('button', { name: 'Outside control' });

		await user.tab();
		expect(dialog.contains(document.activeElement)).toBe(true);
		await user.tab();
		expect(dialog.contains(document.activeElement)).toBe(true);
		expect(outside).not.toHaveFocus();
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

	it('contained mode does not inert outside content', async () => {
		const outside = document.createElement('button');
		outside.type = 'button';
		outside.textContent = 'Outside';
		document.body.appendChild(outside);

		render(
			<Drawer isOpen contained title="Panel">
				Body
			</Drawer>,
		);

		await waitFor(() => {
			expect(screen.getByRole('dialog')).toBeInTheDocument();
		});
		expect(outside).not.toHaveAttribute('inert');
		outside.remove();
	});
});
