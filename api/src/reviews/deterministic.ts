import type { ProjectDocument } from '@bareframe/designer-core';
import type { ReviewIssue } from './process-review.js';

function newId(prefix: string) {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Checks that do not need an LLM. */
export function runDeterministicReviewChecks(doc: ProjectDocument): {
	issues: ReviewIssue[];
	checksRun: string[];
} {
	const frames = doc.project.frames.filter((f) => !f.ghost);
	const connectors = doc.project.connectors;
	const checksRun: string[] = [];
	const issues: ReviewIssue[] = [];

	const connected = new Set<string>();
	for (const c of connectors) {
		connected.add(c.fromFrameId);
		connected.add(c.toFrameId);
	}

	// Orphan screens
	checksRun.push('orphan_screens');
	const orphans = frames.filter((f) => frames.length > 1 && !connected.has(f.id));
	for (const frame of orphans.slice(0, 5)) {
		issues.push({
			id: newId('iss_orphan'),
			category: 'ux_problem',
			severity: 'major',
			title: `${frame.name} has no connections`,
			explanation: 'Screens that are not linked are easy to miss in the prototype.',
			fix: 'Add a link from a nearby screen or remove the orphan.',
			frameId: frame.id,
			status: 'open',
		});
	}

	// Dead ends (no outgoing links except last hop)
	checksRun.push('dead_ends');
	const outgoing = new Map<string, number>();
	for (const c of connectors) {
		outgoing.set(c.fromFrameId, (outgoing.get(c.fromFrameId) ?? 0) + 1);
	}
	for (const frame of frames) {
		if ((outgoing.get(frame.id) ?? 0) === 0 && connectors.some((c) => c.toFrameId === frame.id)) {
			issues.push({
				id: newId('iss_dead'),
				category: 'drop_off_estimate',
				severity: 'minor',
				title: `${frame.name} has no way forward`,
				explanation: 'People can arrive here but there is no obvious next step.',
				fix: 'Add a primary button that links to the next screen.',
				frameId: frame.id,
				status: 'open',
			});
		}
	}

	// Missing back links on detail-style screens
	checksRun.push('back_links');
	for (const frame of frames) {
		if (!/\b(detail|edit|settings|checkout|confirm)\b/i.test(frame.name)) continue;
		const hasBack = connectors.some(
			(c) => c.fromFrameId === frame.id && /\b(back|close|cancel|done|save)\b/i.test(c.label ?? c.trigger ?? ''),
		);
		if (!hasBack) {
			issues.push({
				id: newId('iss_back'),
				category: 'ux_problem',
				severity: 'minor',
				title: `${frame.name} has no back navigation`,
				explanation: 'Detail screens should offer a clear way to return.',
				fix: 'Add a secondary Back or Close action.',
				frameId: frame.id,
				status: 'open',
			});
		}
	}

	// Tap target and contrast heuristics on designed nodes
	checksRun.push('accessibility_tap_targets');
	for (const page of doc.project.pages) {
		const frame = frames.find((f) => f.pageId === page.id);
		if (!frame) continue;
		for (const node of Object.values(page.nodes)) {
			if (node.type !== 'instance' || node.instance?.definitionId !== 'button') continue;
			const props = node.instance?.props as { size?: string } | undefined;
			if (props?.size === 'sm') {
				issues.push({
					id: newId('iss_tap'),
					category: 'accessibility',
					severity: 'major',
					title: 'Button may be below tap target size',
					explanation: 'Buttons under 40px tall are hard to tap on mobile.',
					fix: 'Increase padding or min height to at least 44px.',
					frameId: frame.id,
					status: 'open',
				});
				break;
			}
		}
	}

	checksRun.push('accessibility_labels');
	for (const page of doc.project.pages) {
		const frame = frames.find((f) => f.pageId === page.id);
		if (!frame) continue;
		const inputs = Object.values(page.nodes).filter((n) => n.type === 'instance' && n.instance?.definitionId === 'input');
		for (const node of inputs) {
			const label = node.instance?.props?.label;
			if (!label || String(label).trim().length === 0) {
				issues.push({
					id: newId('iss_label'),
					category: 'accessibility',
					severity: 'major',
					title: 'Input missing a visible label',
					explanation: 'Every field needs a label for screen readers and clarity.',
					fix: 'Add a label prop to the input component.',
					frameId: frame.id,
					status: 'open',
				});
				break;
			}
		}
	}

	return { issues: issues.slice(0, 12), checksRun };
}

export function createDeterministicReviewLlm(project: ProjectDocument) {
	return {
		async completeJson<T>() {
			const { issues, checksRun } = runDeterministicReviewChecks(project);
			return { issues, summary: { deterministicChecks: checksRun } } as T;
		},
	};
}