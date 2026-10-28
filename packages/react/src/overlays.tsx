import { forwardRef, type ReactNode } from 'react';
import {
	Button as RACButton,
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
	{ content: ReactNode; children: ReactNode; className?: string }
>(function Tooltip({ content, children, className }, ref) {
	return (
		<div ref={ref} className={cn('bf-tooltip-anchor', className)}>
			<TooltipTrigger>
				<RACButton className="btn btn-secondary">{children}</RACButton>
				<RACTooltip className="bf-tooltip">{content}</RACTooltip>
			</TooltipTrigger>
		</div>
	);
});

export function PopoverPanel({
	trigger,
	children,
	className,
}: {
	trigger: ReactNode;
	children: ReactNode;
	className?: string;
}) {
	return (
		<div className={cn('bf-popover-anchor', className)}>
			<MenuTrigger>
				<RACButton className="btn btn-secondary">{trigger}</RACButton>
				<RACPopover className="bf-popover">
					<div role="dialog">{children}</div>
				</RACPopover>
			</MenuTrigger>
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
