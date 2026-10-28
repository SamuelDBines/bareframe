import { useState, type ReactNode } from 'react';
import { Button, Drawer, Modal } from '@bareframe/react';

export function ModalDocPreview(props: Record<string, unknown>) {
	const { open, title, children, footer, onOpenChange, ...rest } = props;
	const isControlled = typeof open === 'boolean';
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = isControlled ? open : internalOpen;

	const handleOpenChange = (next: boolean) => {
		if (!isControlled) {
			setInternalOpen(next);
		}
		if (typeof onOpenChange === 'function') {
			onOpenChange(next);
		}
	};

	const titleText = String(title ?? 'Modal title');
	const body = (children as ReactNode) ?? 'Modal body content.';
	const footerNode =
		(footer as ReactNode | undefined) ??
		(
			<>
				<Button variant="ghost" size="sm" onPress={() => handleOpenChange(false)}>
					Cancel
				</Button>
				<Button variant="primary" size="sm" onPress={() => handleOpenChange(false)}>
					Confirm
				</Button>
			</>
		);

	return (
		<div className="bf-doc-modal-preview">
			<Button variant="primary" size="sm" onPress={() => handleOpenChange(true)}>
				Open modal
			</Button>
			<Modal
				{...rest}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				isDismissable
				title={titleText}
				showCloseButton
				footer={footerNode}
			>
				{body}
			</Modal>
		</div>
	);
}

export function DrawerDocPreview(props: Record<string, unknown>) {
	const { open, title, side, children, onOpenChange, ...rest } = props;
	const isControlled = typeof open === 'boolean';
	const [internalOpen, setInternalOpen] = useState(false);
	const isOpen = isControlled ? open : internalOpen;

	const handleOpenChange = (next: boolean) => {
		if (!isControlled) {
			setInternalOpen(next);
		}
		if (typeof onOpenChange === 'function') {
			onOpenChange(next);
		}
	};

	const titleText = String(title ?? 'Panel');
	const body = (children as ReactNode) ?? 'Drawer content.';

	return (
		<div className="bf-doc-drawer-preview">
			<Button variant="secondary" size="sm" onPress={() => handleOpenChange(true)}>
				Open drawer
			</Button>
			<Drawer
				{...rest}
				isOpen={isOpen}
				onOpenChange={handleOpenChange}
				isDismissable
				side={(side as 'left' | 'right') ?? 'right'}
				title={titleText}
			>
				{body}
			</Drawer>
		</div>
	);
}
