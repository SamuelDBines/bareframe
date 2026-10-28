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

export type ModalProps = Omit<ModalOverlayProps, 'children'> & {
	title?: string;
	children?: ReactNode;
	footer?: ReactNode;
	className?: string;
	dialogClassName?: string;
	showCloseButton?: boolean;
	/** Alias for `isOpen` used by docs/codegen. */
	open?: boolean;
	/** Portal target for docs/playground contained overlays. */
	portalContainer?: Element | null;
};

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
		portalContainer,
		...props
	},
	ref,
) {
	const resolvedOpen = isOpen ?? open ?? false;
	const titleId = title ? 'bf-modal-title' : undefined;
	const contained = Boolean(portalContainer);

	return (
		<ModalOverlay
			{...props}
			isOpen={resolvedOpen}
			isDismissable={isDismissable}
			UNSTABLE_portalContainer={portalContainer ?? undefined}
			{...(contained ? ({ isNonModal: true } as Partial<ModalOverlayProps>) : {})}
			className={cn('bf-modal-overlay', contained && 'bf-modal-overlay--contained', className)}
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
	portalContainer?: Element | null;
};

export const Drawer = forwardRef<HTMLDivElement, DrawerProps>(function Drawer(
	{ title, children, side = 'right', className, open, isOpen, isDismissable = true, portalContainer, ...props },
	ref,
) {
	const resolvedOpen = isOpen ?? open ?? false;
	const contained = Boolean(portalContainer);

	return (
		<ModalOverlay
			{...props}
			isOpen={resolvedOpen}
			isDismissable={isDismissable}
			UNSTABLE_portalContainer={portalContainer ?? undefined}
			{...(contained ? ({ isNonModal: true } as Partial<ModalOverlayProps>) : {})}
			className={cn('bf-drawer-overlay', contained && 'bf-drawer-overlay--contained', className)}
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
