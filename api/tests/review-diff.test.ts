import { describe, expect, it } from 'vitest';
import { computeReviewDiff, type ReviewIssue } from '../src/reviews/process-review.js';

describe('computeReviewDiff', () => {
  it('detects added and removed open issues between runs', () => {
    const previous: ReviewIssue[] = [
      {
        id: '1',
        category: 'ux_problem',
        severity: 'major',
        title: 'Old issue',
        explanation: '',
        fix: '',
        status: 'open',
      },
    ];
    const current: ReviewIssue[] = [
      {
        id: '2',
        category: 'ux_problem',
        severity: 'major',
        title: 'New issue',
        explanation: '',
        fix: '',
        status: 'open',
      },
    ];
    const diff = computeReviewDiff(previous, current);
    expect(diff?.added).toHaveLength(1);
    expect(diff?.removed).toHaveLength(1);
    expect(diff?.added[0]?.title).toBe('New issue');
  });
});
