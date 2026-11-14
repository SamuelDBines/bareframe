import { describe, expect, it } from 'vitest';
import { attachConnectorButtonNodes, createEmptyProjectDocument, designToNodes, defaultNewId } from '../src/index.js';
import type { DesignSpec } from '../src/designSpec.js';

describe('attachConnectorButtonNodes', () => {
	it('links connectors to button labels', () => {
		const doc = createEmptyProjectDocument('p1', 'Test', 'light', { newId: defaultNewId });
		const page = doc.project.pages[0]!;
		const spec: DesignSpec = {
			states: {
				default: {
					type: 'stack',
					gap: 8,
					children: [{ type: 'button', props: { label: 'Get started', variant: 'primary' } }],
				},
			},
		};
		doc.project.pages[0] = designToNodes(page, spec.states.default, defaultNewId);
		const frameId = doc.project.pages[0]!.id.replace('page', 'frame') || 'frame-a';
		doc.project.frames = [
			{
				id: frameId,
				name: 'Home',
				pageId: page.id,
				x: 0,
				y: 0,
				width: 390,
				height: 844,
				devicePresetId: 'mobile',
				heightMode: 'fixed',
			},
			{
				id: 'frame-other',
				name: 'Next',
				pageId: page.id,
				x: 400,
				y: 0,
				width: 390,
				height: 844,
				devicePresetId: 'mobile',
				heightMode: 'fixed',
			},
		];
		doc.project.connectors.push({
			id: 'c1',
			fromFrameId: frameId,
			toFrameId: 'frame-other',
			label: 'Get started',
		});
		const frame = doc.project.frames[0]!;
		const notes = attachConnectorButtonNodes(doc, page.id, frame.id);
		expect(notes.length).toBeGreaterThan(0);
		expect(doc.project.connectors[0]?.fromNodeId).toBeTruthy();
	});
});