import { describe, expect, it } from 'vitest';
import { notesToMarkdown } from './notesApi';

describe('notesToMarkdown', () => {
	it('formats open and done notes with screen names', () => {
		const md = notesToMarkdown(
			[
				{
					id: '1',
					projectId: 'p',
					authorUserId: 1,
					body: 'Broken link',
					frameId: 'f1',
					nodeId: null,
					pageUrl: null,
					status: 'open',
					tags: [],
					convertedToBacklogId: null,
					createdAt: '',
					updatedAt: '',
				},
				{
					id: '2',
					projectId: 'p',
					authorUserId: 1,
					body: 'Fixed copy',
					frameId: null,
					nodeId: null,
					pageUrl: null,
					status: 'done',
					tags: [],
					convertedToBacklogId: null,
					createdAt: '',
					updatedAt: '',
				},
			],
			new Map([['f1', 'Home']]),
		);
		expect(md).toContain('[open] (Home) Broken link');
		expect(md).toContain('[done] Fixed copy');
	});
});