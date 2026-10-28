import { forwardRef, useState, type ReactNode } from 'react';
import {
	Button as RACButton,
	ComboBox,
	Input as RACInput,
	Label,
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
	/** Docs/codegen alias for `selectedKey`. */
	value?: string;
};

export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
	{ options, placeholder = 'Select…', className, triggerClassName, value, selectedKey, ...props },
	ref,
) {
	const resolvedKey = selectedKey ?? (value as string | undefined);
	return (
		<RACSelect {...props} selectedKey={resolvedKey} className={cn('bf-select-field', className)}>
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
	label?: string;
	'aria-label'?: string;
	className?: string;
	value?: string;
	defaultValue?: string;
	onChange?: (value: string) => void;
};

export function Combobox({
	options,
	placeholder = 'Search…',
	label,
	'aria-label': ariaLabel,
	className,
	value,
	defaultValue,
	onChange,
}: ComboboxProps) {
	const a11yLabel = label ?? ariaLabel ?? 'Search options';
	return (
		<ComboBox<SelectOption>
			className={cn('bf-combobox', className)}
			selectedKey={value}
			defaultSelectedKey={defaultValue}
			onSelectionChange={(key) => onChange?.(String(key))}
			aria-label={label ? undefined : a11yLabel}
			items={options}
		>
			{label ? <Label className="bf-field__label">{label}</Label> : null}
			<div className="bf-combobox__input-row">
				<RACInput className="bf-input bf-combobox__input" placeholder={placeholder} />
				<RACButton className="bf-combobox__trigger" aria-label={`${a11yLabel} options`}>
					▾
				</RACButton>
			</div>
			<Popover className="bf-combobox__popover">
				<ListBox className="bf-combobox__list" items={options}>
					{(item: SelectOption) => (
						<ListBoxItem id={item.value} textValue={item.label} className="bf-select-option">
							{item.label}
						</ListBoxItem>
					)}
				</ListBox>
			</Popover>
		</ComboBox>
	);
}

export type MultiSelectProps = {
	options: SelectOption[];
	value?: string[];
	defaultValue?: string[];
	onChange?: (value: string[]) => void;
	placeholder?: string;
	label?: string;
	'aria-label'?: string;
	className?: string;
};

export function MultiSelect({
	options,
	value: valueProp,
	defaultValue,
	onChange,
	placeholder = 'Add…',
	label,
	'aria-label': ariaLabel,
	className,
}: MultiSelectProps) {
	const [internal, setInternal] = useState<string[]>(defaultValue ?? []);
	const value = valueProp ?? internal;
	const setValue = (next: string[]) => {
		if (valueProp === undefined) setInternal(next);
		onChange?.(next);
	};
	const addLabel = label ?? ariaLabel ?? 'Add item';
	return (
		<div className={cn('bf-multiselect', className)}>
			{label ? (
				<span id="bf-multiselect-label" className="bf-field__label">
					{label}
				</span>
			) : null}
			<div className="bf-multiselect__chips" aria-labelledby={label ? 'bf-multiselect-label' : undefined}>
				{value.map((v) => {
					const chipLabel = options.find((o) => o.value === v)?.label ?? v;
					return (
						<span key={v} className="bf-badge bf-badge--outline">
							{chipLabel}
						</span>
					);
				})}
			</div>
			<Select
				options={options.filter((o) => !value.includes(o.value))}
				placeholder={placeholder}
				aria-label={label ? undefined : addLabel}
				aria-labelledby={label ? 'bf-multiselect-label' : undefined}
				onSelectionChange={(key) => {
					if (key) setValue([...value, String(key)]);
				}}
			/>
		</div>
	);
}
