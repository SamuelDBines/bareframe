import { useState, type ReactNode } from 'react';
import { Button, Drawer, Modal, PopoverPanel, Tooltip } from '@bareframe/react';

import { usePlaygroundPortal } from './PlaygroundPortal';

function playgroundPortal(): Element | null {
	return usePlaygroundPortal();
}

export function ModalDocPreview(props: Record<string, unknown>) {
	const { open, title, children, footer, onOpenChange, ...rest } = props;
	const portalContainer = playgroundPortal();
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
				className="bf-modal-overlay--contained"
				portalContainer={portalContainer}
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
	const portalContainer = playgroundPortal();
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
				className="bf-drawer-overlay--contained"
				portalContainer={portalContainer}
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

export function PopoverDocPreview(props: Record<string, unknown>) {
	const portalContainer = playgroundPortal();
	const isOpen = props.open as boolean | undefined;
	const onOpenChange = props.onOpenChange as ((open: boolean) => void) | undefined;
	return (
		<PopoverPanel
			trigger="Open popover"
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			portalContainer={portalContainer}
			className="bf-popover-anchor--contained"
		>
			<strong>Popover</strong>
			<p>Floating content anchored to the trigger.</p>
		</PopoverPanel>
	);
}

export function TooltipDocPreview(props: Record<string, unknown>) {
	const { content, open, onOpenChange } = props;
	const text = String(content ?? 'Helpful hint');
	const panelOpen = open === true;
	const [triggerOpen, setTriggerOpen] = useState(false);
	const isOpen = panelOpen || triggerOpen;

	const handleOpenChange = (next: boolean) => {
		setTriggerOpen(next);
		if (typeof onOpenChange === 'function') {
			onOpenChange(next);
		}
	};

	return (
		<Tooltip
			content={text}
			isOpen={isOpen}
			onOpenChange={handleOpenChange}
		>
			Hover target
		</Tooltip>
	);
}

export function ToastDocPreview(props: Record<string, unknown> & { message?: string }) {
	const { variant = 'success', message = 'Saved.' } = props;
	const [items, setItems] = useState<{ id: number; text: string; variant: string }[]>([]);

	const pushToast = () => {
		const id = Date.now();
		const text = String(message);
		const tone = String(variant);
		setItems((prev) => [...prev, { id, text, variant: tone }].slice(-3));
		window.setTimeout(() => {
			setItems((prev) => prev.filter((t) => t.id !== id));
		}, 2500);
	};

	return (
		<div className="bf-doc-toast-preview">
			<Button variant="secondary" size="sm" onPress={pushToast}>
				Show toast
			</Button>
			<div className="bf-doc-toast-stack" aria-live="polite">
				{items.map((t) => (
					<div key={t.id} className={`bf-toast bf-toast--${t.variant}`} role="status">
						{t.text}
					</div>
				))}
			</div>
		</div>
	);
}
