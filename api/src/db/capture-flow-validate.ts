import type { CaptureFlowStepInput } from './capture-flow.js';

export class CaptureFlowValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'CaptureFlowValidationError';
	}
}

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

export function clickNeedsCoordinates(click: CaptureFlowStepInput['click']): boolean {
	if (!click || typeof click !== 'object') return false;
	const keys = Object.keys(click);
	if (keys.length === 0) return false;
	if (isFiniteNumber(click.x) && isFiniteNumber(click.y)) return false;
	const hasPointerHint = 'x' in click || 'y' in click;
	const hasMeta =
		Boolean(click.selector?.trim()) ||
		Boolean(click.name?.trim()) ||
		Boolean(click.text?.trim()) ||
		Boolean(click.role?.trim());
	return hasPointerHint || hasMeta;
}

export function validateCaptureFlowSteps(steps: CaptureFlowStepInput[]): void {
	for (let i = 0; i < steps.length; i++) {
		const step = steps[i]!;
		const click = step.click;
		if (!clickNeedsCoordinates(click)) continue;
		if (!isFiniteNumber(click?.x) || !isFiniteNumber(click?.y)) {
			throw new CaptureFlowValidationError(
				`steps[${step.stepIndex ?? i}].click requires finite x and y coordinates`,
			);
		}
	}
}