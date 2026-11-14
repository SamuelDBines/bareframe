import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { FLOW_LIMITS } from '@bareframe/designer-core';
import { useDesigner } from '../store';
import { DescribeProductForm } from './DescribeProductForm';
import { flowResultMessage, useGenerateFlow } from './flowGenApi';

type Props = {
	projectId: string;
	onClose: () => void;
	onDone: (message: string) => void;
};

/** Change the generated flow with a follow-up instruction, or start again from the description. */
export function RefineFlowDialog({ projectId, onClose, onDone }: Props) {
	const { state } = useDesigner();
	const brief = state.project.productBrief;
	const id = useId();
	const [tab, setTab] = useState<'refine' | 'regenerate'>(brief ? 'refine' : 'regenerate');
	const [instruction, setInstruction] = useState('');
	const { run, busy, error, clearError } = useGenerateFlow(projectId);
	// Captured during the first render, before autoFocus moves focus into the dialog.
	const [opener] = useState(() => document.activeElement as HTMLElement | null);
	const busyRef = useRef(busy);
	busyRef.current = busy;
	const closeRef = useRef(onClose);
	closeRef.current = onClose;

	// Escape closes (not while generating); focus returns to the button that opened the dialog.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && !busyRef.current) closeRef.current();
		};
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('keydown', onKey);
			opener?.focus?.();
		};
	}, [opener]);

	async function refine(e: FormEvent) {
		e.preventDefault();
		if (instruction.trim().length < 3 || busy) return;
		const result = await run({ instruction: instruction.trim() });
		if (result) {
			onDone(flowResultMessage(result));
			onClose();
		}
	}

	// Portal: inside the workspace the toolbar's stacking context sits above the dialog on phones.
	return createPortal(
		<div className="bx-dialog-backdrop">
			<div
				className="bx-dialog flow-map-dialog"
				role="dialog"
				aria-modal="true"
				aria-labelledby={`${id}-title`}
				data-testid="refine-flow-dialog"
			>
				<h2 id={`${id}-title`}>Refine flow</h2>
				<div className="describe-tabs" role="radiogroup" aria-label="How to change the flow">
					{brief ? (
						<button
							type="button"
							role="radio"
							aria-checked={tab === 'refine'}
							onClick={() => {
								setTab('refine');
								clearError();
							}}
							disabled={busy}
						>
							Change the flow
						</button>
					) : null}
					<button
						type="button"
						role="radio"
						aria-checked={tab === 'regenerate'}
						onClick={() => {
							setTab('regenerate');
							clearError();
						}}
						disabled={busy}
					>
						Start again
					</button>
				</div>

				{tab === 'refine' ? (
					<form onSubmit={refine} aria-busy={busy}>
						<label className="field" htmlFor={`${id}-instruction`}>
							<span>What should change?</span>
						</label>
						<p className="bx-hint" id={`${id}-instruction-hint`}>
							For example: “add a password reset screen” or “merge sign up and onboarding”. Screens you keep keep their designs.
						</p>
						<textarea
							id={`${id}-instruction`}
							className="describe-form__text"
							data-testid="refine-flow-instruction"
							rows={3}
							value={instruction}
							maxLength={FLOW_LIMITS.instructionLength}
							onChange={(e) => setInstruction(e.target.value)}
							aria-describedby={`${id}-instruction-hint`}
							disabled={busy}
							autoFocus
						/>
						{error ? (
							<div className="bx-notice bx-notice--warn" role="alert">
								<span className="bx-notice__icon" aria-hidden>
									!
								</span>
								<p>{error}</p>
							</div>
						) : null}
						<div className="bx-dialog__actions">
							<button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>
								Cancel
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								data-testid="refine-flow-submit"
								disabled={busy || instruction.trim().length < 3}
							>
								{busy ? 'Updating the flow…' : 'Update flow'}
							</button>
						</div>
						<p className="bx-visually-hidden" role="status" aria-live="polite">
							{busy ? 'Updating the flow…' : ''}
						</p>
					</form>
				) : (
					<>
						<p className="bx-hint">
							This maps the flow again from your description and replaces the current screens and links.
						</p>
						<DescribeProductForm
							initialDescription={brief?.description}
							initialPlatform={brief?.platform}
							busy={busy}
							error={error}
							submitLabel="Map flow again"
							busyLabel="Mapping your screens…"
							onCancel={onClose}
							autoFocus
							onSubmit={async (value) => {
								const result = await run(value);
								if (result) {
									onDone(flowResultMessage(result));
									onClose();
								}
							}}
						/>
					</>
				)}
			</div>
		</div>,
		document.body,
	);
}
