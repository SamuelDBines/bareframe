import { forwardRef, type ReactNode } from 'react';
import {
	Button as RACButton,
	DialogTrigger,
	Menu,
	MenuItem,
	MenuTrigger,
	Popover as RACPopover,
	Tooltip as RACTooltip,
	TooltipTrigger,
} from 'react-aria-components';
import { cn } from './utils/cn';

export const Tooltip = forwardRef<
	HTMLDivElement,
	{
		content: ReactNode;
		children: ReactNode;
		className?: string;
		isOpen?: boolean;
		onOpenChange?: (open: boolean) => void;
	}
>(function Tooltip({ content, children, className, isOpen, onOpenChange }, ref) {
	return (
		<div ref={ref} className={cn('bf-tooltip-anchor', className)}>
			<TooltipTrigger
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				delay={0}
				closeDelay={0}
			>
				<RACButton className="btn btn-secondary" onPress={() => onOpenChange?.(true)}>
					{children}
				</RACButton>
				<RACTooltip className="bf-tooltip">{content}</RACTooltip>
			</TooltipTrigger>
		</div>
	);
});

export function PopoverPanel({
	trigger,
	children,
	className,
	isOpen,
	defaultOpen,
	onOpenChange,
	portalContainer,
}: {
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
	isOpen?: boolean;
	defaultOpen?: boolean;
	onOpenChange?: (open: boolean) => void;
	portalContainer?: Element | null;
}) {
	return (
		<div className={cn('bf-popover-anchor', className)}>
			<DialogTrigger isOpen={isOpen} defaultOpen={defaultOpen} onOpenChange={onOpenChange}>
				<RACButton className="btn btn-secondary">{trigger}</RACButton>
				<RACPopover
					className={cn('bf-popover', portalContainer && 'bf-popover--contained')}
					UNSTABLE_portalContainer={portalContainer ?? undefined}
				>
					<div className="bf-popover__content">{children}</div>
				</RACPopover>
			</DialogTrigger>
		</div>
	);
}

export function DropdownMenu({
	label = 'Actions',
	items = [
		{ id: 'edit', label: 'Edit' },
		{ id: 'duplicate', label: 'Duplicate' },
		{ id: 'archive', label: 'Archive' },
	],
	onAction,
	className,
}: {
	label?: string;
	items?: { id: string; label: string; disabled?: boolean }[];
	onAction?: (id: string) => void;
	className?: string;
}) {
	return (
		<div className={cn('bf-dropdown', className)}>
			<MenuTrigger>
				<RACButton className="btn btn-secondary" aria-haspopup="menu">
					{label} ▾
				</RACButton>
				<RACPopover className="bf-dropdown__popover">
					<Menu
						className="bf-dropdown__menu"
						onAction={(key) => onAction?.(String(key))}
						items={items}
					>
						{(item) => (
							<MenuItem id={item.id} isDisabled={item.disabled} className="bf-dropdown__item">
								{item.label}
							</MenuItem>
						)}
					</Menu>
				</RACPopover>
			</MenuTrigger>
		</div>
	);
}

/** Alias for PopoverPanel */
export { PopoverPanel as Popover };
