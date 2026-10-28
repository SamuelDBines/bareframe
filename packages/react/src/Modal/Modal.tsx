import { forwardRef, type ReactNode } from 'react';
import {
	Button as RACButton,
	Dialog,
	Heading,
	Modal as RACModal,
	ModalOverlay,
	type ModalOverlayProps,
} from 'react-aria-components';
import { cn } from '../utils/cn';
import { ContainedOverlay } from './ContainedOverlay';

export type ModalProps = Omit<ModalOverlayProps, 'children'> & {
	title?: string;
	children?: ReactNode;
	footer?: ReactNode;
	className?: string;
	dialogClassName?: string;
	showCloseButton?: boolean;
	/** Alias for `isOpen` used by docs/codegen. */
	open?: boolean;
	/**
	 * Non-modal overlay scoped to `portalContainer` (docs preview). Omit for full-page modals
	 * with focus trap and an inert page background.
	 */
	contained?: boolean;
	/** Portal target; required when `contained` is true. */
	portalContainer?: Element | null;
};

function ModalDialogContent({
	title,
	titleId,
	showCloseButton,
	children,
	footer,
	dialogClassName,
}: {
	title?: string;
	titleId?: string;
	showCloseButton: boolean;
	children?: ReactNode;
	footer?: ReactNode;
	dialogClassName?: string;
}) {
	return (
		<div className={cn('bf-modal-scene', dialogClassName)}>
			<Dialog className="bf-modal" aria-labelledby={titleId}>
				{title ? (
					<header className="bf-modal__header">
						<div className="bf-modal__header-row">
							<Heading slot="title" id={titleId} className="bf-modal__title">
								{title}
							</Heading>
							{showCloseButton ? (
								<RACButton slot="close" className="bf-modal__close" aria-label="Close dialog">
									×
								</RACButton>
							) : null}
						</div>
					</header>
				) : showCloseButton ? (
					<div className="bf-modal__header bf-modal__header--close-only">
						<RACButton slot="close" className="bf-modal__close" aria-label="Close dialog">
							×
						</RACButton>
					</div>
				) : null}
				<div className="bf-modal__body">{children}</div>
				{footer ? <footer className="bf-modal__footer">{footer}</footer> : null}
			</Dialog>
		</div>
	);
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
	{
		title,
		children,
		footer,
		className,
		dialogClassName,
		showCloseButton = false,
		open,
		isOpen,
		isDismissable = true,
		contained = false,
		portalContainer,
		onOpenChange,
		...props
	},
	ref,
) {
	const resolvedOpen = isOpen ?? open ?? false;
	const titleId = title ? 'bf-modal-title' : undefined;

	const dialog = (
		<ModalDialogContent
			title={title}
			titleId={titleId}
			showCloseButton={showCloseButton}
			dialogClassName={dialogClassName}
			footer={footer}
		>
			{children}
		</ModalDialogContent>
	);

	if (contained) {
		return (
			<ContainedOverlay
				isOpen={resolvedOpen}
				onOpenChange={onOpenChange}
				isDismissable={isDismissable}
				portalContainer={portalContainer}
				overlayClassName={cn('bf-modal-overlay', 'bf-modal-overlay--contained', className)}
				overlayRef={ref}
			>
				{dialog}
			</ContainedOverlay>
		);
	}

	return (
		<ModalOverlay
			{...props}
			isOpen={resolvedOpen}
			isDismissable={isDismissable}
			onOpenChange={onOpenChange}
			className={cn('bf-modal-overlay', className)}
			ref={ref}
		>
			<RACModal className={cn('bf-modal-scene', dialogClassName)}>
				<Dialog className="bf-modal" aria-labelledby={titleId}>
					{title ? (
						<header className="bf-modal__header">
							<div className="bf-modal__header-row">
								<Heading slot="title" id={titleId} className="bf-modal__title">
									{title}
								</Heading>
								{showCloseButton ? (
									<RACButton slot="close" className="bf-modal__close" aria-label="Close dialog">
										×
									</RACButton>
								) : null}
							</div>
						</header>
					) : showCloseButton ? (
						<div className="bf-modal__header bf-modal__header--close-only">
							<RACButton slot="close" className="bf-modal__close" aria-label="Close dialog">
								×
							</RACButton>
						</div>
					) : null}
					<div className="bf-modal__body">{children}</div>
					{footer ? <footer className="bf-modal__footer">{footer}</footer> : null}
				</Dialog>
			</RACModal>
		</ModalOverlay>
	);
});

Modal.displayName = 'Modal';

export type DrawerProps = Omit<ModalOverlayProps, 'children'> & {
	title?: string;
	children?: ReactNode;
	side?: 'left' | 'right';
	className?: string;
	open?: boolean;
	contained?: boolean;
	portalContainer?: Element | null;
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
	{
		title,
		children,
		side = 'right',
		className,
		open,
		isOpen,
		isDismissable = true,
		contained = false,
		portalContainer,
		onOpenChange,
		...props
	},
	ref,
) {
	const resolvedOpen = isOpen ?? open ?? false;

	const drawerDialog = (
		<div className={cn('bf-drawer-scene', `bf-drawer-scene--${side}`)}>
			<Dialog className="bf-drawer" aria-label={title}>
				{title ? (
					<header className="bf-drawer__header">
						<Heading slot="title">{title}</Heading>
					</header>
				) : null}
				<div className="bf-drawer__body">{children}</div>
			</Dialog>
		</div>
	);

	if (contained) {
		return (
			<ContainedOverlay
				isOpen={resolvedOpen}
				onOpenChange={onOpenChange}
				isDismissable={isDismissable}
				portalContainer={portalContainer}
				overlayClassName={cn('bf-drawer-overlay', 'bf-drawer-overlay--contained', className)}
				overlayRef={ref}
			>
				{drawerDialog}
			</ContainedOverlay>
		);
	}

	return (
		<ModalOverlay
			{...props}
			isOpen={resolvedOpen}
			isDismissable={isDismissable}
			onOpenChange={onOpenChange}
			className={cn('bf-drawer-overlay', className)}
			ref={ref}
		>
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
