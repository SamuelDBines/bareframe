import { describe, expect, it } from 'vitest';
import {
	applyImportScreenshots,
	applyProjectCommand,
	CommandError,
	createDefaultCommandContext,
	createEmptyProjectDocument,
	defaultNewId,
} from '../src/index.js';

const ctx = createDefaultCommandContext((slug) => slug === 'button' || slug === 'card');

function emptyDoc() {
	return createEmptyProjectDocument('proj-1', 'Test', 'light', { newId: defaultNewId });
}

describe('applyProjectCommand', () => {
	it('adds a frame on a page', () => {
		const doc = emptyDoc();
		const pageId = doc.project.pages[0]!.id;
		const { effects, document } = applyProjectCommand(
			doc,
			{ type: 'add_frame', pageId, presetId: 'iphone-15', name: 'Home' },
			ctx,
		);
		expect(effects.frameId).toBeTruthy();
		expect(document.project.frames).toHaveLength(1);
	});

	it('rejects unknown component slugs', () => {
		const doc = emptyDoc();
		const page = doc.project.pages[0]!;
		expect(() =>
			applyProjectCommand(
				doc,
				{
					type: 'add_component',
					pageId: page.id,
					parentNodeId: page.rootNodeId,
					slug: 'not-real',
				},
				ctx,
			),
		).toThrow(CommandError);
	});

	it('adds a catalog component', () => {
		const doc = emptyDoc();
		const page = doc.project.pages[0]!;
		const { effects } = applyProjectCommand(
			doc,
			{
				type: 'add_component',
				pageId: page.id,
				parentNodeId: page.rootNodeId,
				slug: 'button',
			},
			ctx,
		);
		expect(effects.nodeId).toBeTruthy();
	});

	it('creates connector between frames', () => {
		let doc = emptyDoc();
		const pageId = doc.project.pages[0]!.id;
		const a = applyProjectCommand(doc, { type: 'add_frame', pageId }, ctx);
		doc = a.document;
		const b = applyProjectCommand(doc, { type: 'add_frame', pageId }, ctx);
		const from = a.effects.frameId as string;
		const to = b.effects.frameId as string;
		const linked = applyProjectCommand(
			b.document,
			{ type: 'add_connector', fromFrameId: from, toFrameId: to, label: 'Next' },
			ctx,
		);
		expect(linked.document.project.connectors).toHaveLength(1);
	});

	it('import_screenshots lays out frames and links', () => {
		const doc = emptyDoc();
		const imported = applyImportScreenshots(
			doc,
			[
				{ assetId: 'asset-a', title: 'A' },
				{ assetId: 'asset-b', title: 'B' },
			],
			[{ fromAssetId: 'asset-a', toAssetId: 'asset-b', label: 'Go' }],
			ctx,
		);
		expect(imported.document.project.frames.length).toBeGreaterThanOrEqual(2);
		expect(imported.document.project.connectors.length).toBe(1);
	});
});
