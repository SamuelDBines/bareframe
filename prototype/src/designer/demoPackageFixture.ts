/** Static fixture for UI screenshots / demo route only (not a fake API). */
export const DEMO_PACKAGE_DOC: Record<string, unknown> = {
  contract: 'bareframe.package',
  version: '1.0',
  project: 'Hookoh',
  summary: 'AI-generated social posts for busy founders — book, edit, and ship from one queue.',
  status: 'in_review',
  selected_direction: 'dir_slate',
  design_options: [
    {
      id: 'dir_slate',
      name: 'Calm slate',
      bareframe_theme: { base_theme: 'simple' },
    },
    {
      id: 'dir_noir',
      name: 'Noir studio',
      bareframe_theme: { base_theme: 'noir' },
    },
  ],
  journeys: [
    {
      id: 'j_signup',
      name: 'Sign up → first post',
      steps: [
        { screen_id: 'scr_landing', action: 'Email me a sign-in code', next_screen_id: 'scr_code' },
        { screen_id: 'scr_code', action: 'Enter code', next_screen_id: 'scr_home' },
        { screen_id: 'scr_home', action: 'Tap Compose', next_screen_id: 'scr_compose' },
      ],
    },
  ],
  prototype: {
    designer_project_id: '',
    share_url: 'https://designer.bareframe.org/#/share/demo',
    screens: [
      { id: 'scr_landing', name: 'Landing', route: '/' },
      { id: 'scr_code', name: 'Sign-in code', route: '/sign-in' },
      { id: 'scr_home', name: 'Home queue', route: '/home' },
      { id: 'scr_compose', name: 'Compose', route: '/compose' },
    ],
  },
  product: { value_proposition: 'Your AI makes the posts.' },
  review: { checklist: [], rounds_included: 2, rounds_used: 0 },
};
