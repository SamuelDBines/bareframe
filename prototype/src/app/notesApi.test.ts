import { describe, expect, it } from 'vitest';
import { notesToMarkdown } from './notesApi';

describe('notesToMarkdown', () => {
	it('outputs Where/Issue blocks in order', () => {
		const md = notesToMarkdown([
			{
				id: '1',
				projectId: 'p',
				authorUserId: 1,
				where: 'top navigation on root page',
				body: 'Logo overlaps menu',
				frameId: null,
				nodeId: null,
				pageUrl: null,
				elementSelector: null,
				screenshotAssetId: null,
				status: 'open',
				tags: [],
				convertedToBacklogId: null,
				createdAt: '2026-01-01T00:00:00Z',
				updatedAt: '2026-01-01T00:00:00Z',
			},
			{
				id: '2',
				projectId: 'p',
				authorUserId: 1,
				where: 'app/Billing',
				body: 'Missing tax line',
				frameId: null,
				nodeId: null,
				pageUrl: null,
				elementSelector: null,
				screenshotAssetId: null,
				status: 'done',
				tags: [],
				convertedToBacklogId: null,
				createdAt: '2026-01-02T00:00:00Z',
				updatedAt: '2026-01-02T00:00:00Z',
			},
		]);
		expect(md).toContain('First issue:');
		expect(md).toContain('Where: top navigation on root page');
		expect(md).toContain('Issue: Logo overlaps menu');
		expect(md).toContain('Second issue:');
		expect(md).toContain('Where: app/Billing');
		expect(md).toContain('Issue: Missing tax line');
		expect(md).toContain('(done)');
	});
});