import { forwardRef } from 'react';
import {
	FieldError,
	Input as RACInput,
	Label,
	Text,
	TextField,
	type InputProps as RACInputProps,
	type TextFieldProps,
} from 'react-aria-components';
import { cn } from '../utils/cn';

export type InputProps = Omit<TextFieldProps, 'className'> &
	Omit<RACInputProps, 'className'> & {
		className?: string;
		inputClassName?: string;
		error?: boolean;
	};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
	{ className, inputClassName, error, ...props },
	ref,
) {
	return (
		<div className={className}>
			<TextField {...props} isInvalid={error}>
				<RACInput
					ref={ref}
					className={cn('bf-input', error && 'bf-input--error', inputClassName)}
				/>
			</TextField>
		</div>
	);
});

Input.displayName = 'Input';

export type FieldProps = Omit<TextFieldProps, 'className'> & {
	label: string;
	hint?: string;
	errorMessage?: string;
	inputClassName?: string;
	className?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
	{ label, hint, errorMessage, className, inputClassName, ...props },
	ref,
) {
	return (
		<div className={cn('bf-field', className)}>
			<TextField {...props} isInvalid={Boolean(errorMessage)}>
				<Label className="bf-field__label">{label}</Label>
				<RACInput
					ref={ref}
					className={cn('bf-input', errorMessage && 'bf-input--error', inputClassName)}
				/>
				{hint && !errorMessage ? (
					<Text slot="description" className="bf-field__hint">
						{hint}
					</Text>
				) : null}
				{errorMessage ? <FieldError className="bf-field__error">{errorMessage}</FieldError> : null}
			</TextField>
		</div>
	);
});

Field.displayName = 'Field';
