import {
	defaultNewId,
	insertFlowTemplate,
	listFlowTemplates,
	platformForDevices,
	type FlowDevice,
	type FlowTemplateId,
} from '@bareframe/designer-core';
import { fromProjectDocument, toProjectDocument } from '../projectApi';
import type { DesignerProject } from '../types';

type Starter = { name: string; flowTemplateId: FlowTemplateId };

/** Library flows surfaced in onboarding (editable after insert). */
export const STARTER_FLOWS: Starter[] = listFlowTemplates().map((f) => ({
	name: f.title,
	flowTemplateId: f.id,
}));

export function randomStarterIndex(exclude?: number): number {
	if (STARTER_FLOWS.length < 2) return 0;
	let i = Math.floor(Math.random() * STARTER_FLOWS.length);
	if (i === exclude) i = (i + 1) % STARTER_FLOWS.length;
	return i;
}

/** Lay out a library flow on the chosen devices. */
export function projectWithStarterFlow(project: DesignerProject, index: number, devices: FlowDevice[]): DesignerProject {
	const starter = STARTER_FLOWS[index] ?? STARTER_FLOWS[0]!;
	const { document } = insertFlowTemplate(toProjectDocument(project), {
		flowTemplateId: starter.flowTemplateId,
		platform: platformForDevices(devices),
		platforms: devices,
		description: starter.name,
		newId: defaultNewId,
		merge: false,
	});
	return fromProjectDocument(document);
}