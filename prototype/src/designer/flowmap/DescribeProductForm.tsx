import { useId, useState, type FormEvent } from 'react';
import { FLOW_LIMITS, type FlowDevice } from '@bareframe/designer-core';
import { PlatformPicker } from './PlatformPicker';

const MIN_LENGTH = 10;

type Props = {
	initialDescription?: string;
	initialPlatforms?: FlowDevice[];
	busy: boolean;
	error: string | null;
	submitLabel: string;
	busyLabel: string;
	onSubmit: (value: { description: string; platforms: FlowDevice[] }) => void;
	onCancel?: () => void;
	autoFocus?: boolean;
};

/** Product description and platform; shared by the empty-canvas panel and the refine dialog. */
export function DescribeProductForm({
	initialDescription = '',
	initialPlatforms = ['mobile'],
	busy,
	error,
	submitLabel,
	busyLabel,
	onSubmit,
	onCancel,
	autoFocus,
}: Props) {
	const id = useId();
	const [description, setDescription] = useState(initialDescription);
	const [platforms, setPlatforms] = useState<FlowDevice[]>(initialPlatforms);
	const [touched, setTouched] = useState(false);
	const trimmed = description.trim();
	const tooShort = trimmed.length < MIN_LENGTH;
	const showLengthError = touched && tooShort;
	const [submitted, setSubmitted] = useState(false);
	const noPlatform = platforms.length === 0;

	function submit(e: FormEvent) {
		e.preventDefault();
		setTouched(true);
		setSubmitted(true);
		if (tooShort || noPlatform || busy) return;
		onSubmit({ description: trimmed, platforms });
	}

	return (
		<form className="describe-form" onSubmit={submit} noValidate aria-busy={busy}>
			<label className="field" htmlFor={`${id}-desc`}>
				<span>What are you building?</span>
			</label>
			<p className="bx-hint" id={`${id}-hint`}>
				What it is, who it’s for, and the main things people do with it.
			</p>
			<textarea
				id={`${id}-desc`}
				className="describe-form__text"
				data-testid="describe-product-text"
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				onBlur={() => setTouched(true)}
				rows={5}
				maxLength={FLOW_LIMITS.descriptionLength}
				placeholder="e.g. A habit tracker for busy parents. They set small daily routines, tick them off, and see a weekly streak."
				aria-describedby={`${id}-hint${showLengthError ? ` ${id}-err` : ''}`}
				aria-invalid={showLengthError || undefined}
				disabled={busy}
				autoFocus={autoFocus}
			/>
			{showLengthError ? (
				<p className="describe-form__field-error" id={`${id}-err`}>
					Add a little more detail (at least {MIN_LENGTH} characters).
				</p>
			) : null}
			<PlatformPicker value={platforms} onChange={setPlatforms} disabled={busy} showError={submitted && noPlatform} />
			{error ? (
				<div className="bx-notice bx-notice--warn" role="alert">
					<span className="bx-notice__icon" aria-hidden>
						!
					</span>
					<p>{error}</p>
				</div>
			) : null}
			<div className="bx-dialog__actions">
				{onCancel ? (
					<button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
						Cancel
					</button>
				) : null}
				<button type="submit" className="btn btn-primary" data-testid="describe-product-submit" disabled={busy}>
					{busy ? busyLabel : submitLabel}
				</button>
			</div>
			<p className="bx-visually-hidden" role="status" aria-live="polite">
				{busy ? busyLabel : ''}
			</p>
		</form>
	);
}
