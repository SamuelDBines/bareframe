import { forwardRef, useId } from 'react';
import { cn } from './utils/cn';

export const Checkbox = forwardRef<
	HTMLInputElement,
	{ label?: string; checked?: boolean; defaultChecked?: boolean; className?: string } & React.InputHTMLAttributes<HTMLInputElement>
>(function Checkbox({ label = 'Accept terms', className, ...props }, ref) {
	const id = useId();
	return (
		<label className={cn('bf-checkbox', className)} htmlFor={id}>
			<input id={id} ref={ref} type="checkbox" {...props} />
			<span>{label}</span>
		</label>
	);
});

export const Switch = forwardRef<
	HTMLInputElement,
	{ label?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>
>(function Switch({ label = 'Notifications', className, ...props }, ref) {
	const id = useId();
	return (
		<label className={cn('bf-switch', className)} htmlFor={id}>
			<input id={id} ref={ref} type="checkbox" role="switch" {...props} />
			<span className="bf-switch__track" aria-hidden />
			<span className="bf-switch__label">{label}</span>
		</label>
	);
});

export const Textarea = forwardRef<
	HTMLTextAreaElement,
	React.TextareaHTMLAttributes<HTMLTextAreaElement> & { className?: string }
>(function Textarea({ className, ...props }, ref) {
	return <textarea ref={ref} className={cn('bf-textarea', className)} {...props} />;
});

export const Slider = forwardRef<
	HTMLInputElement,
	{ label?: string; className?: string } & React.InputHTMLAttributes<HTMLInputElement>
>(function Slider({ label = 'Volume', className, value, ...props }, ref) {
	const id = useId();
	return (
		<div className={cn('bf-slider-field', className)}>
			<label htmlFor={id}>{label}</label>
			<input id={id} ref={ref} type="range" className="bf-slider" value={value} {...props} />
			{value !== undefined ? <span className="bf-slider-value">{value}</span> : null}
		</div>
	);
});

export const RadioGroup = forwardRef<
	HTMLDivElement,
	{
		name?: string;
		value?: string;
		defaultValue?: string;
		onChange?: (value: string) => void;
		options?: { value: string; label: string }[];
		className?: string;
		'aria-label'?: string;
	}
>(function RadioGroup(
	{
		name,
		value,
		defaultValue,
		onChange,
		options = [
			{ value: 'email', label: 'Email' },
			{ value: 'sms', label: 'SMS' },
			{ value: 'push', label: 'Push' },
		],
		className,
		'aria-label': ariaLabel = 'Options',
	},
	ref,
) {
	const autoName = useId();
	const groupName = name ?? autoName;
	return (
		<div ref={ref} className={cn('bf-radio-group', className)} role="radiogroup" aria-label={ariaLabel}>
			{options.map((o) => (
				<label key={o.value} className="bf-radio">
					<input
						type="radio"
						name={groupName}
						value={o.value}
						checked={value !== undefined ? value === o.value : undefined}
						defaultChecked={defaultValue === o.value}
						onChange={() => onChange?.(o.value)}
					/>
					<span>{o.label}</span>
				</label>
			))}
		</div>
	);
});
