import type { ThemeId } from '../theme/themes';
import type { DesignerProject } from './types';
import { getHookohDemoPreview } from './demoHookohPreview';

export const demoReviewProjectId = 'demo-journey-review';

export const DEMO_REVIEW_ISSUES = [
  {
    id: 'iss_ux_1',
    category: 'ux_problem',
    severity: 'major',
    title: 'Sign in competes with the Hookoh signup CTA',
    explanation:
      'Ghost “Sign in” in the nav matches weight with the hero email field — first-time founders may hesitate on the primary path.',
    fix: 'Keep one primary action in the hero; move Sign in to a text link below the email field.',
    status: 'open',
  },
  {
    id: 'iss_missing_1',
    category: 'missing_state',
    severity: 'major',
    title: 'Queue has no empty state',
    explanation:
      'When there are no scheduled posts, the queue screen should guide users to compose their first Hookoh draft.',
    fix: 'Add an empty-state card with “Compose your first post”.',
    status: 'open',
  },
  {
    id: 'iss_drop_1',
    category: 'drop_off_estimate',
    severity: 'info',
    title: 'Likely drop-off on magic-link code step (estimate)',
    explanation:
      'Users often abandon between “Email me a sign-in code” and entering the 6-digit code without progress feedback.',
    fix: 'Add a 3-step header (Email → Code → Queue) and a resend-code link.',
    status: 'open',
  },
] as const;

/** Single Hookoh landing screen — matches review callouts and marketing screenshots. */
export function buildDemoReviewProject(): DesignerProject {
  const { page, frame } = getHookohDemoPreview('scr_landing');
  const frameId = frame.id;
  const viewW = 720;
  const viewH = 780;
  const zoom = Math.min((viewW - 48) / frame.width, (viewH - 80) / frame.height, 0.92);
  const cx = frame.x + frame.width / 2;
  const cy = frame.y + frame.height / 2;

  return {
    id: demoReviewProjectId,
    name: 'Hookoh — social queue',
    defaultThemeId: 'noir' as ThemeId,
    pages: [page],
    frames: [{ ...frame, x: 48, y: 56 }],
    trials: [],
    customTokenOverrides: {},
    connectors: [],
    annotations: [
      {
        id: 'anno-1',
        frameId,
        kind: 'callout',
        target: { kind: 'rect', x: 20, y: 168, w: 300, h: 56 },
        text: 'Sign in competes with signup CTA\nDemote Sign in below the email field.',
      },
      {
        id: 'anno-2',
        frameId,
        kind: 'callout',
        target: { kind: 'rect', x: 20, y: 420, w: 280, h: 52 },
        text: 'Magic-link drop-off (estimate)\nAdd progress + resend on code step.',
      },
    ],
    canvas: {
      zoom,
      x: viewW / 2 - cx * zoom,
      y: viewH / 2 - cy * zoom,
    },
  };
}
