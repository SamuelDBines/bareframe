import type { ThemeId } from '../theme/themes';
import { getHookohDemoPreview } from './demoHookohPreview';
import { layoutFramesInFlowRow } from '@bareframe/designer-core';
import type { DesignerProject } from './types';

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

/** Hookoh journey as a left-to-right flow map with connectors and review pins. */
export function buildDemoReviewProject(): DesignerProject {
  const landing = getHookohDemoPreview('scr_landing');
  const code = getHookohDemoPreview('scr_code');
  const home = getHookohDemoPreview('scr_home');

  const frames = [
    { ...landing.frame, x: 80, y: 120 },
    { ...code.frame, x: 400, y: 120 },
    { ...home.frame, x: 720, y: 120 },
  ];
  layoutFramesInFlowRow(frames, 80, 120);

  const landingId = frames[0]!.id;
  const codeId = frames[1]!.id;
  const homeId = frames[2]!.id;

  return {
    id: demoReviewProjectId,
    name: 'Hookoh — social queue',
    defaultThemeId: 'noir' as ThemeId,
    pages: [landing.page, code.page, home.page],
    frames,
    trials: [],
    customTokenOverrides: {},
    connectors: [
      {
        id: 'conn-landing-code',
        fromFrameId: landingId,
        toFrameId: codeId,
        label: 'Email me a sign-in code',
        trigger: 'tap',
      },
      {
        id: 'conn-code-home',
        fromFrameId: codeId,
        toFrameId: homeId,
        label: 'Enter code',
        trigger: 'tap',
      },
    ],
    annotations: [
      {
        id: 'anno-1',
        frameId: landingId,
        kind: 'callout',
        target: { kind: 'rect', x: 20, y: 168, w: 300, h: 56 },
        text: 'Sign in competes with signup CTA\nDemote Sign in below the email field.',
      },
      {
        id: 'anno-2',
        frameId: codeId,
        kind: 'callout',
        target: { kind: 'rect', x: 20, y: 420, w: 280, h: 52 },
        text: 'Magic-link drop-off (estimate)\nAdd progress + resend on code step.',
      },
      {
        id: 'anno-3',
        frameId: homeId,
        kind: 'callout',
        target: { kind: 'rect', x: 20, y: 320, w: 280, h: 64 },
        text: 'Missing empty queue state\nGuide users to compose first post.',
      },
    ],
    canvas: { zoom: 0.72, x: 40, y: 20 },
  };
}
