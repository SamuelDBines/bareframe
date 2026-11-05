import type { ThemeId } from '../theme/themes';
import { createDemoFlowScreen } from './demoFlowMapScreen';
import type { DesignerProject } from './types';
import { autoLayoutFlowMap } from './flowmap/flowMapLayout';

export const demoCommerceBookingProjectId = 'demo-commerce-booking';

const PRODUCT = 'ReserveKit';

const SCREEN_SPECS = [
	{
		key: 'services',
		name: 'Choose service',
		routePath: '/services',
		headline: 'Pick a service',
		body: 'Haircut · Color · Beard trim · Packages from $35. Tap a card to continue.',
		primaryCta: 'Haircut · 45 min',
	},
	{
		key: 'identity',
		name: 'Guest or account',
		routePath: '/identity',
		headline: 'How should we save this booking?',
		body: 'Guests checkout faster. Accounts earn loyalty and can rebook in one tap.',
		primaryCta: 'Continue as guest',
		secondaryCta: 'Sign in to account',
	},
	{
		key: 'guest',
		name: 'Guest details',
		routePath: '/guest',
		headline: 'Your details',
		body: 'We will text reminders 24 hours before your appointment.',
		fieldPlaceholder: 'Mobile number',
		primaryCta: 'Continue',
	},
	{
		key: 'signin',
		name: 'Account sign-in',
		routePath: '/sign-in',
		headline: 'Welcome back',
		body: 'Sign in to apply loyalty credits and skip re-entering payment.',
		fieldPlaceholder: 'you@email.com',
		primaryCta: 'Sign in',
	},
	{
		key: 'schedule',
		name: 'Date & time',
		routePath: '/schedule',
		headline: 'Select a time',
		body: 'Next available: Tue 3:30 PM with Jordan · Downtown studio.',
		primaryCta: 'Tue · 3:30 PM',
		secondaryCta: 'See more times',
	},
	{
		key: 'payment',
		name: 'Payment',
		routePath: '/payment',
		headline: 'Hold with card',
		body: 'Pay at the chair or hold $15 now — free cancellation until 2 hours before.',
		primaryCta: 'Confirm hold',
	},
	{
		key: 'confirmed',
		name: 'Confirmation',
		routePath: '/confirmed',
		headline: 'You are booked',
		body: 'Tue 3:30 PM · Haircut with Jordan · Downtown. Add to calendar or share with a friend.',
		primaryCta: 'Add to calendar',
		secondaryCta: 'Book another',
	},
	{
		key: 'slot-error',
		name: 'Slot unavailable',
		routePath: '/slot-error',
		headline: 'That time was just taken',
		body: 'Another guest grabbed 3:30 PM. Pick a nearby slot or join the waitlist.',
		primaryCta: 'Pick another time',
	},
] as const;

function id(key: string) {
	return `frame-${key}`;
}

export function buildDemoCommerceBookingProject(): DesignerProject {
	const built = SCREEN_SPECS.map((spec) =>
		createDemoFlowScreen({
			...spec,
			productName: PRODUCT,
		}),
	);
	const pages = built.map((b) => b.page);
	let frames = built.map((b) => ({ ...b.frame }));

	const connectors = [
		{ id: 'c-services-identity', fromFrameId: id('services'), toFrameId: id('identity'), label: 'Select service', trigger: 'tap' },
		{ id: 'c-identity-guest', fromFrameId: id('identity'), toFrameId: id('guest'), label: 'Continue as guest', trigger: 'tap' },
		{ id: 'c-identity-signin', fromFrameId: id('identity'), toFrameId: id('signin'), label: 'Sign in', trigger: 'tap' },
		{ id: 'c-guest-schedule', fromFrameId: id('guest'), toFrameId: id('schedule'), label: 'Continue', trigger: 'tap' },
		{ id: 'c-signin-schedule', fromFrameId: id('signin'), toFrameId: id('schedule'), label: 'Sign in', trigger: 'tap' },
		{ id: 'c-schedule-payment', fromFrameId: id('schedule'), toFrameId: id('payment'), label: 'Tue · 3:30 PM', trigger: 'tap' },
		{ id: 'c-schedule-error', fromFrameId: id('schedule'), toFrameId: id('slot-error'), label: 'Slot taken', trigger: 'tap' },
		{ id: 'c-error-schedule', fromFrameId: id('slot-error'), toFrameId: id('schedule'), label: 'Pick another time', trigger: 'tap' },
		{ id: 'c-payment-confirmed', fromFrameId: id('payment'), toFrameId: id('confirmed'), label: 'Confirm hold', trigger: 'tap' },
		{ id: 'c-confirmed-services', fromFrameId: id('confirmed'), toFrameId: id('services'), label: 'Book another', trigger: 'tap' },
	];

	for (const u of autoLayoutFlowMap({ frames, connectors, pages } as DesignerProject)) {
		const f = frames.find((fr) => fr.id === u.frameId);
		if (f) {
			f.x = u.x;
			f.y = u.y;
		}
	}

	return {
		id: demoCommerceBookingProjectId,
		name: 'ReserveKit — studio booking',
		defaultThemeId: 'desert' as ThemeId,
		pages,
		frames,
		trials: [],
		customTokenOverrides: {},
		connectors,
		annotations: [
			{
				id: 'anno-identity',
				frameId: id('identity'),
				kind: 'callout',
				target: { kind: 'rect', x: 20, y: 400, w: 280, h: 56 },
				text: 'Guest vs account parity\nHighlight loyalty value on the account path.',
			},
			{
				id: 'anno-schedule',
				frameId: id('schedule'),
				kind: 'callout',
				target: { kind: 'rect', x: 20, y: 320, w: 280, h: 52 },
				text: 'Race on hot slots\nShow soft hold timer before payment.',
			},
			{
				id: 'anno-error',
				frameId: id('slot-error'),
				kind: 'callout',
				target: { kind: 'rect', x: 20, y: 300, w: 280, h: 64 },
				text: 'Retry loop\nSend users back to schedule with nearby times pre-selected.',
			},
		],
		canvas: { zoom: 0.68, x: 32, y: 16 },
	};
}
