/**
 * Sample journey shown in the homepage demo. It is an illustration of how a
 * project looks after an AI review — labelled "Sample project" in the UI.
 */

export type Severity = 'critical' | 'major' | 'minor' | 'info';

export type MockBlock =
	| { t: 'nav' }
	| { t: 'title'; text: string }
	| { t: 'text'; text: string }
	| { t: 'input'; label: string }
	/** `fix`: block only appears once that finding's fix is applied. */
	| { t: 'cta'; to?: string; label: string; secondary?: boolean; fix?: string }
	| { t: 'plans' }
	| { t: 'tiles' }
	| { t: 'helper'; text: string; fix: string }
	| { t: 'icon'; tone: 'ok' | 'mail' | 'warn' };

export type DemoScreen = {
	id: string;
	name: string;
	x: number;
	y: number;
	blocks: MockBlock[];
	/** Only rendered once its fix has been applied. */
	addedBy?: string;
};

export type DemoEdge = {
	id: string;
	from: string;
	to: string;
	label: string;
	addedBy?: string;
};

export type DemoFinding = {
	id: string;
	screenId: string;
	severity: Severity;
	category: string;
	title: string;
	detail: string;
	fix: string;
	applyLabel: string;
};

export const DEMO_WORLD = { w: 1000, h: 640 };
export const DEMO_CARD = { w: 136, h: 182, label: 26 };
export const MOCK_SIZE = { w: 240, h: 321 };

export const DEMO_SCREENS: DemoScreen[] = [
	{
		id: 'landing',
		name: 'Landing',
		x: 24,
		y: 214,
		blocks: [
			{ t: 'nav' },
			{ t: 'title', text: 'Budget like a pro' },
			{ t: 'text', text: 'Track every pound in one calm place.' },
			{ t: 'cta', to: 'signup', label: 'Start free' },
			{ t: 'cta', to: 'pricing', label: 'See pricing', secondary: true },
			{ t: 'tiles' },
		],
	},
	{
		id: 'signup',
		name: 'Sign up',
		x: 290,
		y: 28,
		blocks: [
			{ t: 'nav' },
			{ t: 'title', text: 'Create your account' },
			{ t: 'input', label: 'Email' },
			{ t: 'input', label: 'Password' },
			{ t: 'helper', text: '8+ characters, one number', fix: 'f-signup' },
			{ t: 'cta', to: 'verify', label: 'Create account' },
		],
	},
	{
		id: 'pricing',
		name: 'Pricing',
		x: 290,
		y: 400,
		blocks: [
			{ t: 'nav' },
			{ t: 'title', text: 'Pick a plan' },
			{ t: 'plans' },
			{ t: 'cta', to: 'checkout', label: 'Choose Pro' },
		],
	},
	{
		id: 'verify',
		name: 'Verify email',
		x: 556,
		y: 28,
		blocks: [
			{ t: 'icon', tone: 'mail' },
			{ t: 'title', text: 'Check your inbox' },
			{ t: 'text', text: 'We sent a link to you@studio.co' },
			{ t: 'cta', label: 'Open Gmail', fix: 'f-verify' },
			{ t: 'cta', to: 'dashboard', label: 'I’ve verified', secondary: true },
		],
	},
	{
		id: 'checkout',
		name: 'Checkout',
		x: 556,
		y: 400,
		blocks: [
			{ t: 'nav' },
			{ t: 'title', text: 'Pro · £8/mo' },
			{ t: 'input', label: 'Card number' },
			{ t: 'input', label: 'Expiry · CVC' },
			{ t: 'cta', to: 'dashboard', label: 'Pay now' },
		],
	},
	{
		id: 'dashboard',
		name: 'Dashboard',
		x: 828,
		y: 214,
		blocks: [{ t: 'nav' }, { t: 'title', text: 'Welcome, Sam' }, { t: 'tiles' }, { t: 'tiles' }],
	},
	{
		id: 'failed',
		name: 'Payment failed',
		x: 828,
		y: 440,
		addedBy: 'f-checkout',
		blocks: [
			{ t: 'icon', tone: 'warn' },
			{ t: 'title', text: 'Card declined' },
			{ t: 'text', text: 'Nothing was charged. Try another card.' },
			{ t: 'cta', to: 'checkout', label: 'Try again' },
		],
	},
];

export const DEMO_EDGES: DemoEdge[] = [
	{ id: 'e1', from: 'landing', to: 'signup', label: 'Start free' },
	{ id: 'e2', from: 'landing', to: 'pricing', label: 'See pricing' },
	{ id: 'e3', from: 'signup', to: 'verify', label: 'Create account' },
	{ id: 'e4', from: 'pricing', to: 'checkout', label: 'Choose Pro' },
	{ id: 'e5', from: 'verify', to: 'dashboard', label: 'Verified' },
	{ id: 'e6', from: 'checkout', to: 'dashboard', label: 'Pay now' },
	{ id: 'e7', from: 'checkout', to: 'failed', label: 'Card declined', addedBy: 'f-checkout' },
];

export const DEMO_FINDINGS: DemoFinding[] = [
	{
		id: 'f-checkout',
		screenId: 'checkout',
		severity: 'critical',
		category: 'Missing screen',
		title: 'No screen for a declined card',
		detail: 'If payment fails, people hit a dead end with no way back to checkout.',
		fix: 'Add a “Payment failed” screen with a retry, linked from Checkout.',
		applyLabel: 'Add screen',
	},
	{
		id: 'f-verify',
		screenId: 'verify',
		severity: 'major',
		category: 'Drop-off risk',
		title: 'Likely drop-off while people check email',
		detail: 'Switching apps to find the email is where many sign-ups stall (estimate).',
		fix: 'Add an “Open Gmail” shortcut and a resend link on this step.',
		applyLabel: 'Apply fix',
	},
	{
		id: 'f-signup',
		screenId: 'signup',
		severity: 'major',
		category: 'UX friction',
		title: 'Password rules only appear after an error',
		detail: 'People guess, fail, then retype. It adds a step to the most fragile screen.',
		fix: 'Show the rules under the field before anyone types.',
		applyLabel: 'Apply fix',
	},
	{
		id: 'f-landing',
		screenId: 'landing',
		severity: 'minor',
		category: 'Accessibility',
		title: 'Main button text is hard to read',
		detail: 'White on light teal measures 2.6:1. WCAG AA needs 4.5:1 for this size.',
		fix: 'Darken the button to deep teal (6.1:1).',
		applyLabel: 'Apply fix',
	},
];
