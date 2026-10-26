import { useId } from 'react';
import type { PreviewInteractionState } from '../library/types';
import { previewClassName, stateProps } from './utils';

export function Checkbox({
	label = 'Accept terms',
	checked = false,
	previewState = 'default',
}: {
	label?: string;
	checked?: boolean;
	previewState?: PreviewInteractionState;
}) {
	const id = useId();
	const isDisabled = previewState === 'disabled';
	return (
		<label
			className={previewClassName('bf-checkbox', previewState)}
			htmlFor={id}
		>
			<input
				id={id}
				type="checkbox"
				checked={checked}
				readOnly
				disabled={isDisabled}
				{...stateProps(previewState)}
			/>
			<span>{label}</span>
		</label>
	);
}

export function Switch({
	label = 'Notifications',
	checked = true,
	previewState = 'default',
}: {
	label?: string;
	checked?: boolean;
	previewState?: PreviewInteractionState;
}) {
	const id = useId();
	const isDisabled = previewState === 'disabled';
	return (
		<label className={previewClassName('bf-switch', previewState)} htmlFor={id}>
			<input
				id={id}
				type="checkbox"
				role="switch"
				checked={checked}
				readOnly
				disabled={isDisabled}
				aria-checked={checked}
			/>
			<span className="bf-switch__track" aria-hidden />
			<span className="bf-switch__label">{label}</span>
		</label>
	);
}

export function Input({
	placeholder = 'Enter text…',
	type = 'text',
	error,
	previewState = 'default',
}: {
	placeholder?: string;
	type?: string;
	error?: boolean;
	previewState?: PreviewInteractionState;
}) {
	return (
		<input
			className={previewClassName(`bf-input${error ? ' bf-input--error' : ''}`, previewState)}
			type={type}
			placeholder={placeholder}
			readOnly
			{...stateProps(previewState)}
		/>
	);
}

export function Textarea({
	placeholder = 'Write a message…',
	rows = 3,
	previewState = 'default',
}: {
	placeholder?: string;
	rows?: number;
	previewState?: PreviewInteractionState;
}) {
	return (
		<textarea
			className={previewClassName('bf-textarea', previewState)}
			placeholder={placeholder}
			rows={rows}
			readOnly
			{...stateProps(previewState)}
		/>
	);
}

export function Select({
	value = 'a',
	options = [
		{ value: 'a', label: 'Option A' },
		{ value: 'b', label: 'Option B' },
		{ value: 'c', label: 'Option C' },
	],
	previewState = 'default',
}: {
	value?: string;
	options?: { value: string; label: string }[];
	previewState?: PreviewInteractionState;
}) {
	return (
		<select
			className={previewClassName('bf-select-native', previewState)}
			value={value}
			onChange={() => {}}
			{...stateProps(previewState)}
		>
			{options.map((o) => (
				<option key={o.value} value={o.value}>{o.label}</option>
			))}
		</select>
	);
}

export function Slider({
	value = 40,
	min = 0,
	max = 100,
	label = 'Volume',
	previewState = 'default',
}: {
	value?: number;
	min?: number;
	max?: number;
	label?: string;
	previewState?: PreviewInteractionState;
}) {
	const id = useId();
	return (
		<div className={previewClassName('bf-slider-field', previewState)}>
			<label htmlFor={id}>{label}</label>
			<input
				id={id}
				type="range"
				min={min}
				max={max}
				value={value}
				readOnly
				className="bf-slider"
				{...stateProps(previewState)}
			/>
			<span className="bf-slider-value">{value}</span>
		</div>
	);
}

export function RadioGroup({
	value = 'email',
	previewState = 'default',
}: {
	value?: string;
	previewState?: PreviewInteractionState;
}) {
	const name = useId();
	const options = [
		{ value: 'email', label: 'Email' },
		{ value: 'sms', label: 'SMS' },
		{ value: 'push', label: 'Push' },
	];
	return (
		<div className={previewClassName('bf-radio-group', previewState)} role="radiogroup" aria-label="Contact method">
			{options.map((o) => (
				<label key={o.value} className="bf-radio">
					<input
						type="radio"
						name={name}
						value={o.value}
						checked={value === o.value}
						readOnly
						disabled={previewState === 'disabled'}
					/>
					<span>{o.label}</span>
				</label>
			))}
		</div>
	);
}

export function Field({
	label = 'Email',
	hint,
	error,
	previewState = 'default',
}: {
	label?: string;
	hint?: string;
	error?: string;
	previewState?: PreviewInteractionState;
}) {
	return (
		<div className={previewClassName('bf-field', previewState)}>
			<label className="bf-field__label">{label}</label>
			<Input placeholder="you@example.com" error={Boolean(error)} previewState={previewState} />
			{hint && !error ? <p className="bf-field__hint">{hint}</p> : null}
			{error ? <p className="bf-field__error" role="alert">{error}</p> : null}
		</div>
	);
}
