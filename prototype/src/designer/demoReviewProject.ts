import type { DesignerProject } from './types';
import { createInitialProject } from './initialProject';

export const demoReviewProjectId = 'demo-journey-review';

export const DEMO_REVIEW_ISSUES = [
  {
    id: 'iss_ux_1',
    category: 'ux_problem',
    severity: 'major',
    title: 'Primary action competes with secondary nav',
    explanation:
      'Sign-in and the main CTA share visual weight on the landing screen, which can slow first-time comprehension.',
    fix: 'Demote secondary actions to ghost buttons and keep one primary CTA per viewport.',
    status: 'open',
  },
  {
    id: 'iss_missing_1',
    category: 'missing_state',
    severity: 'major',
    title: 'No empty or error state on the queue screen',
    explanation: 'Users who have no scheduled posts will hit a dead end without guidance.',
    fix: 'Add an empty-state component with a single “Create first post” action.',
    status: 'open',
  },
  {
    id: 'iss_drop_1',
    category: 'drop_off_estimate',
    severity: 'info',
    title: 'Likely drop-off after sign-in code (estimate)',
    explanation:
      'Magic-link flows often lose users between email entry and code confirmation when there is no progress indicator.',
    fix: 'Add a 3-step progress header and resend-code affordance.',
    status: 'open',
  },
] as const;

export function buildDemoReviewProject(): DesignerProject {
  const project = createInitialProject('noir');
  project.id = demoReviewProjectId;
  project.name = 'Hookoh booking journey';
  const frameId = project.frames[0]?.id ?? 'frame-iphone';
  project.annotations = [
    {
      id: 'anno-1',
      frameId,
      kind: 'callout',
      target: { kind: 'rect', x: 24, y: 120, w: 280, h: 52 },
      text: 'Primary action competes with secondary nav\nDemote ghost buttons here.',
    },
    {
      id: 'anno-2',
      frameId,
      kind: 'callout',
      target: { kind: 'rect', x: 24, y: 320, w: 260, h: 48 },
      text: 'Missing empty state (estimate)\nAdd guidance when the queue is empty.',
    },
  ];
  return project;
}
