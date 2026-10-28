import { forwardRef, type ReactNode } from 'react';
import {
	Dialog,
	Heading,
	Modal as RACModal,
	ModalOverlay,
	type ModalOverlayProps,
} from 'react-aria-components';
import { cn } from '../utils/cn';

export type ModalProps = ModalOverlayProps & {
	title?: string;
	children?: ReactNode;
	footer?: ReactNode;
	className?: string;
	dialogClassName?: string;
};

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
	{ title, children, footer, className, dialogClassName, ...props },
	ref,
) {
	return (
		<ModalOverlay {...props} className={cn('bf-modal-overlay', className)} ref={ref}>
			<RACModal className={cn('bf-modal-scene', dialogClassName)}>
				<Dialog className="bf-modal" aria-labelledby={title ? 'bf-modal-title' : undefined}>
					{title ? (
						<header className="bf-modal__header">
							<Heading slot="title" id="bf-modal-title" className="bf-modal__title">
								{title}
							</Heading>
						</header>
					) : null}
					<div className="bf-modal__body">{children}</div>
					{footer ? <footer className="bf-modal__footer">{footer}</footer> : null}
				</Dialog>
			</RACModal>
		</ModalOverlay>
	);
});

Modal.displayName = 'Modal';

export type DrawerProps = ModalOverlayProps & {
	title?: string;
	children?: ReactNode;
	side?: 'left' | 'right';
	className?: string;
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
	{ title, children, side = 'right', className, ...props },
	ref,
) {
	return (
		<ModalOverlay {...props} className={cn('bf-drawer-overlay', className)} ref={ref}>
			<RACModal className={cn('bf-drawer-scene', `bf-drawer-scene--${side}`)}>
				<Dialog className="bf-drawer" aria-label={title}>
					{title ? (
						<header className="bf-drawer__header">
							<Heading slot="title">{title}</Heading>
						</header>
					) : null}
					<div className="bf-drawer__body">{children}</div>
				</Dialog>
			</RACModal>
		</ModalOverlay>
	);
});

Drawer.displayName = 'Drawer';
