import { forwardRef, type ReactNode } from 'react';
import {
	Button as RACButton,
	ListBox,
	ListBoxItem,
	Popover,
	Select as RACSelect,
	SelectValue,
	type SelectProps as RACSelectProps,
} from 'react-aria-components';
import { cn } from '../utils/cn';

export type SelectOption = { value: string; label: string; disabled?: boolean };

export type SelectProps = Omit<RACSelectProps<SelectOption>, 'children' | 'className'> & {
	options: SelectOption[];
	placeholder?: string;
	className?: string;
	triggerClassName?: string;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{ options, placeholder = 'Select…', className, triggerClassName, ...props },
	ref,
) {
	return (
		<RACSelect {...props} className={cn('bf-select-field', className)}>
			<RACButton ref={ref} className={cn('bf-select-native', triggerClassName)}>
				<SelectValue>{({ selectedText }) => selectedText || placeholder}</SelectValue>
				<span aria-hidden> ▾</span>
			</RACButton>
			<Popover className="bf-select-popover">
				<ListBox className="bf-select-list" items={options}>
					{(item) => (
						<ListBoxItem id={item.value} textValue={item.label} className="bf-select-option">
							{item.label}
						</ListBoxItem>
					)}
				</ListBox>
			</Popover>
		</RACSelect>
	);
});

Select.displayName = 'Select';

export type NativeSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
	options: SelectOption[];
	className?: string;
};

/** Simple native select for progressive enhancement / forms. */
export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(function NativeSelect(
	{ options, className, ...props },
	ref,
) {
	return (
		<select ref={ref} className={cn('bf-select-native', className)} {...props}>
			{options.map((o) => (
				<option key={o.value} value={o.value} disabled={o.disabled}>
					{o.label}
				</option>
			))}
		</select>
	);
});

NativeSelect.displayName = 'NativeSelect';

export type ComboboxProps = {
	options: SelectOption[];
	placeholder?: string;
	className?: string;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
};

export function Combobox({
	options,
	placeholder = 'Search…',
	className,
	value,
	defaultValue,
	onChange,
}: ComboboxProps) {
	return (
		<RACSelect
			className={cn('bf-combobox', className)}
			selectedKey={value}
			defaultSelectedKey={defaultValue}
			onSelectionChange={(key) => onChange?.(String(key))}
		>
			<RACButton className="bf-input bf-combobox__trigger">
				<SelectValue>{({ selectedText }) => selectedText || placeholder}</SelectValue>
			</RACButton>
			<Popover className="bf-combobox__popover">
				<ListBox className="bf-combobox__list" items={options}>
					{(item) => (
						<ListBoxItem id={item.value} textValue={item.label}>
							{item.label}
						</ListBoxItem>
					)}
				</ListBox>
			</Popover>
		</RACSelect>
	);
}

export type MultiSelectProps = {
	options: SelectOption[];
	value?: string[];
	onChange?: (value: string[]) => void;
	placeholder?: string;
	className?: string;
};

export function MultiSelect({
	options,
	value = [],
	onChange,
	placeholder = 'Add…',
	className,
}: MultiSelectProps) {
	return (
		<div className={cn('bf-multiselect', className)}>
			<div className="bf-multiselect__chips">
				{value.map((v) => {
					const label = options.find((o) => o.value === v)?.label ?? v;
					return (
						<span key={v} className="bf-badge bf-badge--outline">
							{label}
						</span>
					);
				})}
			</div>
			<Select
				options={options.filter((o) => !value.includes(o.value))}
				placeholder={placeholder}
				onSelectionChange={(key) => {
					if (key) onChange?.([...value, String(key)]);
				}}
			/>
		</div>
	);
}
