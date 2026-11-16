import { describe, expect, it } from 'vitest';
import { parseBulkNotes } from './parseBulkNotes';

const MESSY = `First issue:
Where: top navigation on root page
Issue: Logo overlaps the hamburger menu on mobile

Issue four:
Where: app/Billing
isse: Price breakdown missing tax line

Where: Compose modal
Issue: Post button disabled after paste

Second issue:
Where: Settings / Notifications
Issue: Toggle does not persist after refresh`;

describe('parseBulkNotes', () => {
	it('parses numbered blocks with typos and blank lines', () => {
		const notes = parseBulkNotes(MESSY);
		expect(notes.length).toBeGreaterThanOrEqual(4);
		const first = notes.find((n) => n.index === 1);
		expect(first?.where).toContain('top navigation');
		expect(first?.issue).toContain('Logo overlaps');
		const fourth = notes.find((n) => n.index === 4);
		expect(fourth?.where).toBe('app/Billing');
		expect(fourth?.issue).toContain('tax line');
		const compose = notes.find((n) => n.where === 'Compose modal');
		expect(compose?.issue).toContain('Post button');
	});

	it('handles a single unprefixed block', () => {
		const notes = parseBulkNotes(`Where: root footer\nIssue: Dead link to pricing`);
		expect(notes).toHaveLength(1);
		expect(notes[0]?.where).toBe('root footer');
		expect(notes[0]?.issue).toContain('Dead link');
	});

	it('returns empty for blank input', () => {
		expect(parseBulkNotes('   \n\n  ')).toEqual([]);
	});
});