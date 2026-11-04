import type { ThemeId } from '../theme/themes';
import { createDemoFlowScreen } from './demoFlowMapScreen';
import type { DesignerProject } from './types';
import { autoLayoutFlowMap } from './flowmap/flowMapLayout';

export const demoSaasOnboardingProjectId = 'demo-saas-onboarding';

const PRODUCT = 'Northstar';

const SCREEN_SPECS = [
	{
		key: 'welcome',
		name: 'Welcome',
		routePath: '/',
		headline: 'Welcome to Northstar',
		body: 'Plan, ship, and measure product work in one workspace built for SaaS teams.',
		primaryCta: 'Get started free',
		secondaryCta: 'Forgot password?',
	},
	{
		key: 'signup',
		name: 'Create account',
		routePath: '/signup',
		headline: 'Create your workspace',
		body: 'Use your work email so teammates can join the same org later.',
		fieldPlaceholder: 'you@company.com',
		primaryCta: 'Create account',
	},
	{
		key: 'verify',
		name: 'Verify email',
		routePath: '/verify',
		headline: 'Check your inbox',
		body: 'We sent a 6-digit code to you@company.com. Codes expire after 10 minutes.',
		fieldPlaceholder: '••••••',
		primaryCta: 'Continue',
		secondaryCta: 'Resend code',
	},
	{
		key: 'dashboard',
		name: 'Dashboard',
		routePath: '/dashboard',
		headline: 'Good morning, Alex',
		body: '3 onboarding tasks left · 2 experiments running · billing on Pro trial.',
		primaryCta: 'Invite teammates',
	},
	{
		key: 'forgot',
		name: 'Forgot password',
		routePath: '/forgot-password',
		headline: 'Reset your password',
		body: 'Enter the email on your account and we will send a secure reset link.',
		fieldPlaceholder: 'you@company.com',
		primaryCta: 'Send reset link',
	},
	{
		key: 'reset-sent',
		name: 'Reset email sent',
		routePath: '/reset-sent',
		headline: 'Link on the way',
		body: 'If an account exists for that email, you will get instructions within a minute.',
		primaryCta: 'Back to sign in',
	},
	{
		key: 'error',
		name: 'Sign-up error',
		routePath: '/signup-error',
		headline: 'We could not create that account',
		body: 'That email domain is blocked on your plan. Try a company address or contact support.',
		primaryCta: 'Try again',
		secondaryCta: 'Contact support',
	},
] as const;

function id(key: string) {
	return `frame-${key}`;
}

export function buildDemoSaasOnboardingProject(): DesignerProject {
	const built = SCREEN_SPECS.map((spec) =>
		createDemoFlowScreen({
			...spec,
			productName: PRODUCT,
		}),
	);
	const pages = built.map((b) => b.page);
	let frames = built.map((b) => ({ ...b.frame }));

	const connectors = [
		{ id: 'c-welcome-signup', fromFrameId: id('welcome'), toFrameId: id('signup'), label: 'Get started free', trigger: 'tap' },
		{ id: 'c-welcome-forgot', fromFrameId: id('welcome'), toFrameId: id('forgot'), label: 'Forgot password?', trigger: 'tap' },
		{ id: 'c-signup-verify', fromFrameId: id('signup'), toFrameId: id('verify'), label: 'Create account', trigger: 'tap' },
		{ id: 'c-signup-error', fromFrameId: id('signup'), toFrameId: id('error'), label: 'Invalid domain', trigger: 'tap' },
		{ id: 'c-error-signup', fromFrameId: id('error'), toFrameId: id('signup'), label: 'Try again', trigger: 'tap' },
		{ id: 'c-verify-dashboard', fromFrameId: id('verify'), toFrameId: id('dashboard'), label: 'Continue', trigger: 'tap' },
		{ id: 'c-forgot-sent', fromFrameId: id('forgot'), toFrameId: id('reset-sent'), label: 'Send reset link', trigger: 'tap' },
		{ id: 'c-sent-welcome', fromFrameId: id('reset-sent'), toFrameId: id('welcome'), label: 'Back to sign in', trigger: 'tap' },
	];

	for (const u of autoLayoutFlowMap({ frames, connectors, pages } as DesignerProject)) {
		const f = frames.find((fr) => fr.id === u.frameId);
		if (f) {
			f.x = u.x;
			f.y = u.y;
		}
	}

	return {
		id: demoSaasOnboardingProjectId,
		name: 'Northstar — SaaS onboarding',
		defaultThemeId: 'aurora' as ThemeId,
		pages,
		frames,
		trials: [],
		customTokenOverrides: {},
		connectors,
		annotations: [
			{
				id: 'anno-welcome',
				frameId: id('welcome'),
				kind: 'callout',
				target: { kind: 'rect', x: 20, y: 420, w: 280, h: 48 },
				text: 'Two equal CTAs\nDemote “Forgot password?” below the hero action.',
			},
			{
				id: 'anno-verify',
				frameId: id('verify'),
				kind: 'callout',
				target: { kind: 'rect', x: 20, y: 360, w: 280, h: 52 },
				text: 'No progress indicator\nShow Email → Verify → Dashboard steps.',
			},
			{
				id: 'anno-error',
				frameId: id('error'),
				kind: 'callout',
				target: { kind: 'rect', x: 20, y: 280, w: 280, h: 64 },
				text: 'Dead-end error\nOffer retry loop back to signup with context preserved.',
			},
		],
		canvas: { zoom: 0.72, x: 40, y: 20 },
	};
}
