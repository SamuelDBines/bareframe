import type { IntakePayload } from '@bareframe/package-contracts';
import type { JourneyPlan, LlmAdapter, LlmRequest, PipelineArtifacts, ScreenPlan } from '../types.js';

function isBarberBrief(intake: IntakePayload): boolean {
  const hay = `${intake.idea} ${intake.audience}`.toLowerCase();
  return hay.includes('barber') || hay.includes('booking') || hay.includes('haircut');
}

export function barberBookingArtifacts(intake: IntakePayload, projectName: string): PipelineArtifacts {
  const product = {
    problem:
      'Walk-in barbershops lose bookings to phone tag; customers want to pick a barber, time, and service without calling.',
    audience: [
      { persona: 'Regular client', need: 'Book the same barber quickly on mobile.' },
      { persona: 'Shop owner', need: 'Fill chairs without answering the phone all day.' },
    ],
    value_proposition: 'Book trusted local barbers in under a minute — pick service, barber, and pay a deposit.',
    core_features: [
      { id: 'f_book', name: 'Service & slot booking', story_ids: ['us_book'], description: 'Choose service, barber, date/time.' },
      { id: 'f_account', name: 'Account & history', story_ids: ['us_account'], description: 'Email sign-in and past visits.' },
      { id: 'f_owner', name: 'Owner dashboard', story_ids: ['us_owner'], description: 'Today’s chair list and no-shows.' },
      { id: 'f_pay', name: 'Deposit checkout', story_ids: ['us_pay'], description: 'Hold slot with card deposit.' },
      { id: 'f_notify', name: 'Reminders', story_ids: ['us_notify'], description: 'SMS/email before appointment.' },
    ],
    mvp_scope: ['f_book', 'f_account', 'f_pay'],
    non_goals: ['Multi-location franchises', 'Inventory POS', 'Loyalty marketplace'],
    success_measures: ['50% of bookings online within 90 days', 'No-show rate below 8% with deposits'],
  };

  const naming = {
    options: [
      {
        name: 'ChairTime',
        rationale: 'Evokes a booked chair and punctual service.',
        domains: [{ domain: 'chairtime.app', apparent_status: 'unknown' }],
        trademark: { registers_checked: ['UKIPO'], classes: [45], notes: 'Preliminary scan only.' },
        verified_by_human: false,
      },
      {
        name: 'FadeDesk',
        rationale: 'Barber slang + front-desk scheduling.',
        domains: [{ domain: 'fadedesk.com', apparent_status: 'unknown' }],
        trademark: { registers_checked: ['USPTO'], classes: [42], notes: 'Preliminary scan only.' },
        verified_by_human: false,
      },
      {
        name: 'TrimSlot',
        rationale: 'Direct mapping to booking a trim slot.',
        domains: [{ domain: 'trimslot.io', apparent_status: 'looks_free' }],
        trademark: { registers_checked: ['EUIPO'], classes: [35], notes: 'Preliminary scan only.' },
        verified_by_human: false,
      },
      {
        name: 'ClipCal',
        rationale: 'Calendar metaphor with clipper cue.',
        domains: [{ domain: 'clipcal.com', apparent_status: 'taken' }],
        trademark: { registers_checked: ['UKIPO'], classes: [9], notes: 'Preliminary scan only.' },
        verified_by_human: false,
      },
      {
        name: 'BarberBench',
        rationale: 'Community bench where clients wait their turn digitally.',
        domains: [{ domain: 'barberbench.co', apparent_status: 'unknown' }],
        trademark: { registers_checked: ['USPTO'], classes: [45], notes: 'Preliminary scan only.' },
        verified_by_human: false,
      },
    ],
    recommended: 'TrimSlot',
  };

  const branding = {
    personality: ['Confident', 'Neighbourly', 'Efficient', 'Craft-proud'],
    tone_of_voice: {
      we_are: ['Direct', 'Warm', 'Local'],
      we_are_not: ['Corporate', 'Trend-chasing', 'Pushy'],
      examples: [
        { do: 'Your fade with Marcus is locked for 4:30.', dont: 'ACT NOW!!! Best deal ever!!!' },
      ],
    },
    taglines: ['Book the chair, not the hold music.', 'Sharp cuts. Sharper scheduling.', 'Your barber, on your calendar.'],
    logo_direction: {
      concept: 'Minimal wordmark with subtle clipper negative space in the T stem.',
      type: 'wordmark',
      do: ['High contrast', 'Works on dark shop windows'],
      avoid: ['Cartoon mascots', 'Scissors clipart'],
      concept_image_refs: [],
    },
  };

  const design_options = [
    {
      id: 'dir_slate',
      name: 'Calm slate',
      mood: 'Professional shop floor, quiet confidence',
      palette: {
        primary: '#334155',
        secondary: '#64748b',
        neutral: '#94a3b8',
        surface: '#f8fafc',
        text: '#0f172a',
        success: '#15803d',
        warning: '#b45309',
        danger: '#b91c1c',
      },
      contrast_checks: [
        { pair: 'text/surface', ratio: 12.4, wcag_aa: true },
        { pair: 'primary/surface', ratio: 7.1, wcag_aa: true },
      ],
      typography: { heading_font: 'Inter', body_font: 'Inter', scale: [0.875, 1, 1.25, 1.5], licence: 'OFL' },
      radius: '8px',
      density: 'comfortable',
      bareframe_theme: { base_theme: 'simple', overrides: {} },
      preview_screen_ids: ['scr_landing', 'scr_book'],
    },
    {
      id: 'dir_noir',
      name: 'Noir studio',
      mood: 'Premium barbershop, dark walls and gold accents',
      palette: {
        primary: '#eab308',
        secondary: '#a16207',
        neutral: '#52525b',
        surface: '#18181b',
        text: '#fafafa',
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      contrast_checks: [
        { pair: 'text/surface', ratio: 11.2, wcag_aa: true },
        { pair: 'primary/surface', ratio: 8.5, wcag_aa: true },
      ],
      typography: { heading_font: 'Inter', body_font: 'Inter', scale: [0.875, 1, 1.25, 1.5], licence: 'OFL' },
      radius: '6px',
      density: 'compact',
      bareframe_theme: { base_theme: 'noir', overrides: {} },
      preview_screen_ids: ['scr_landing', 'scr_confirm'],
    },
  ];

  const ia = {
    sitemap: [
      { id: 'scr_landing', title: 'Landing', route: '/', auth: 'public', mvp: true },
      { id: 'scr_signin', title: 'Sign in', route: '/sign-in', auth: 'public', mvp: true },
      { id: 'scr_services', title: 'Choose service', route: '/book/service', auth: 'signed_in', mvp: true },
      { id: 'scr_barber', title: 'Pick barber', route: '/book/barber', auth: 'signed_in', mvp: true },
      { id: 'scr_slot', title: 'Pick time', route: '/book/time', auth: 'signed_in', mvp: true },
      { id: 'scr_confirm', title: 'Confirm & pay', route: '/book/confirm', auth: 'signed_in', mvp: true },
      { id: 'scr_home', title: 'My bookings', route: '/home', auth: 'signed_in', mvp: true },
      { id: 'scr_owner', title: 'Owner today', route: '/owner', auth: 'admin', mvp: false },
    ],
    navigation: { primary: ['scr_home', 'scr_services'], footer: ['scr_landing'] },
  };

  const screens: ScreenPlan[] = [
    { id: 'scr_landing', name: 'Landing', route: '/', intent: 'welcome onboarding', components: ['card', 'button', 'field'], story_ids: ['us_book'] },
    { id: 'scr_signin', name: 'Sign in', route: '/sign-in', intent: 'login sign-in', components: ['field', 'input', 'button', 'otp-input'], story_ids: ['us_account'] },
    { id: 'scr_services', name: 'Services', route: '/book/service', intent: 'form submit', components: ['card', 'button', 'badge'], story_ids: ['us_book'] },
    { id: 'scr_barber', name: 'Barbers', route: '/book/barber', intent: 'dashboard', components: ['card', 'avatar', 'button'], story_ids: ['us_book'] },
    { id: 'scr_slot', name: 'Time slots', route: '/book/time', intent: 'calendar', components: ['card', 'button', 'badge'], story_ids: ['us_book'] },
    { id: 'scr_confirm', name: 'Confirm', route: '/book/confirm', intent: 'checkout payment', components: ['card', 'field', 'button'], story_ids: ['us_pay'] },
    { id: 'scr_home', name: 'My bookings', route: '/home', intent: 'dashboard', components: ['table', 'badge', 'button'], story_ids: ['us_account'] },
    { id: 'scr_owner', name: 'Owner desk', route: '/owner', intent: 'dashboard analytics', components: ['stat-card', 'table', 'button'], story_ids: ['us_owner'] },
  ];

  const journeys: JourneyPlan[] = [
    {
      id: 'j_book_first',
      name: 'Book first visit',
      persona: 'Regular client',
      goal: 'Book a fade with deposit',
      story_ids: ['us_book', 'us_pay'],
      steps: [
        { screen_id: 'scr_landing', action: 'Tap Book now', next_screen_id: 'scr_signin' },
        { screen_id: 'scr_signin', action: 'Enter code', next_screen_id: 'scr_services' },
        { screen_id: 'scr_services', action: 'Pick service', next_screen_id: 'scr_barber' },
        { screen_id: 'scr_barber', action: 'Choose barber', next_screen_id: 'scr_slot' },
        { screen_id: 'scr_slot', action: 'Select slot', next_screen_id: 'scr_confirm' },
        { screen_id: 'scr_confirm', action: 'Pay deposit', next_screen_id: 'scr_home' },
      ],
    },
    {
      id: 'j_return',
      name: 'Returning sign-in',
      persona: 'Regular client',
      goal: 'See upcoming booking',
      story_ids: ['us_account'],
      steps: [
        { screen_id: 'scr_landing', action: 'Sign in', next_screen_id: 'scr_signin' },
        { screen_id: 'scr_signin', action: 'Enter code', next_screen_id: 'scr_home' },
      ],
    },
    {
      id: 'j_owner',
      name: 'Owner morning check',
      persona: 'Shop owner',
      goal: 'Review today’s chair list',
      story_ids: ['us_owner'],
      steps: [
        { screen_id: 'scr_signin', action: 'Owner login', next_screen_id: 'scr_owner' },
      ],
    },
  ];

  const copy = screens.map((s) => ({
    screen_id: s.id,
    blocks: [
      { key: 'hero.heading', text: s.name },
      { key: 'cta.primary', text: s.id === 'scr_landing' ? 'Book now' : 'Continue' },
      { key: 'body.lead', text: `Part of ${projectName} — ${intake.idea.slice(0, 80)}` },
    ],
  }));

  const handoff = {
    components: [
      { slug: 'button', stability: 'stable', used_on: screens.map((s) => s.id) },
      { slug: 'card', stability: 'stable', used_on: screens.map((s) => s.id) },
      { slug: 'field', stability: 'stable', used_on: ['scr_landing', 'scr_signin', 'scr_confirm'] },
    ],
    design_tokens: { theme: 'simple', note: 'Filled at assembly from catalog' },
    scaffolded_screens: screens.map((s) => ({
      screen_id: s.id,
      path: `src/screens/${s.id}.tsx`,
      tsx: `// scaffolded in assembly for ${s.name}`,
    })),
    data_entities: ['Customer', 'Barber', 'Service', 'Booking', 'Payment'],
    api_contracts: [
      { method: 'POST', path: '/api/bookings', description: 'Create booking with deposit' },
      { method: 'GET', path: '/api/slots', description: 'List open slots by barber' },
    ],
    stack: {
      frontend: 'React + @bareframe/react',
      backend: 'FastAPI',
      hosting: 'kuboh.dev',
      email: 'RelayEmail',
      analytics: 'Telemetry',
      database: 'PostgreSQL',
    },
  };

  void isBarberBrief;
  return { product, naming, branding, design_options, ia, journeys, screens, copy, handoff };
}

export function createFixtureLlmAdapter(intake: IntakePayload, projectName: string): LlmAdapter {
  const artifacts = barberBookingArtifacts(intake, projectName);
  return {
    kind: 'fixture',
    async completeJson<T>(request: LlmRequest): Promise<T> {
      switch (request.stage) {
        case 'definition':
          return { product: artifacts.product } as T;
        case 'naming_branding':
          return { naming: artifacts.naming, branding: artifacts.branding } as T;
        case 'design_directions':
          return { design_options: artifacts.design_options } as T;
        case 'ia':
          return { ia: artifacts.ia } as T;
        case 'journeys':
          return { journeys: artifacts.journeys } as T;
        case 'screens_copy':
          return { screens: artifacts.screens, copy: artifacts.copy } as T;
        case 'handoff':
          return { handoff: artifacts.handoff } as T;
        default:
          return {} as T;
      }
    },
  };
}
