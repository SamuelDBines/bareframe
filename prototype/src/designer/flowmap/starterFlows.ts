import {
	applyFlowSpec,
	defaultNewId,
	platformForDevices,
	repairFlowSpec,
	type FlowDevice,
	type FlowSpec,
} from '@bareframe/designer-core';
import { fromProjectDocument, toProjectDocument } from '../projectApi';
import type { DesignerProject } from '../types';

type Starter = { name: string; spec: FlowSpec };

/** Common journeys to start from without AI. Screens and links stay fully editable. */
export const STARTER_FLOWS: Starter[] = [
	{
		name: 'Sign-up and onboarding',
		spec: {
			screens: [
				{ id: 'welcome', name: 'Welcome', purpose: 'Explain the product and invite people in', keyContent: ['Headline', 'Get started button', 'Sign in link'], states: ['default'] },
				{ id: 'sign-up', name: 'Sign up', purpose: 'Create an account', keyContent: ['Email field', 'Password field', 'Create account button'], states: ['default', 'error', 'loading'] },
				{ id: 'verify-email', name: 'Verify email', purpose: 'Confirm the email address', keyContent: ['Code field', 'Resend link'], states: ['default', 'error'] },
				{ id: 'profile', name: 'Set up profile', purpose: 'Collect the basics', keyContent: ['Name field', 'Role', 'Continue button'], states: ['default'] },
				{ id: 'home', name: 'Home', purpose: 'First look at the product', keyContent: ['Getting started checklist'], states: ['default', 'empty'] },
				{ id: 'sign-in', name: 'Sign in', purpose: 'Return to an existing account', keyContent: ['Email field', 'Password field', 'Forgot password link'], states: ['default', 'error'] },
			],
			connections: [
				{ from: 'welcome', to: 'sign-up', trigger: 'Get started' },
				{ from: 'welcome', to: 'sign-in', trigger: 'Sign in' },
				{ from: 'sign-up', to: 'verify-email', trigger: 'Create account' },
				{ from: 'verify-email', to: 'profile', trigger: 'Verify' },
				{ from: 'profile', to: 'home', trigger: 'Continue' },
				{ from: 'sign-in', to: 'home', trigger: 'Sign in' },
			],
		},
	},
	{
		name: 'Shop and checkout',
		spec: {
			screens: [
				{ id: 'catalogue', name: 'Catalogue', purpose: 'Browse products', keyContent: ['Search field', 'Product grid', 'Filters'], states: ['default', 'empty', 'loading'] },
				{ id: 'product', name: 'Product', purpose: 'Decide whether to buy', keyContent: ['Photos', 'Price', 'Add to basket button'], states: ['default'] },
				{ id: 'basket', name: 'Basket', purpose: 'Review items before paying', keyContent: ['Item list', 'Total', 'Checkout button'], states: ['default', 'empty'] },
				{ id: 'delivery', name: 'Delivery', purpose: 'Enter the delivery address', keyContent: ['Address fields', 'Delivery options'], states: ['default', 'error'] },
				{ id: 'payment', name: 'Payment', purpose: 'Pay for the order', keyContent: ['Card fields', 'Pay button'], states: ['default', 'error', 'loading'] },
				{ id: 'confirmation', name: 'Order confirmed', purpose: 'Reassure and set expectations', keyContent: ['Order number', 'Delivery date'], states: ['success'] },
			],
			connections: [
				{ from: 'catalogue', to: 'product', trigger: 'View product' },
				{ from: 'product', to: 'basket', trigger: 'Add to basket' },
				{ from: 'basket', to: 'delivery', trigger: 'Checkout' },
				{ from: 'delivery', to: 'payment', trigger: 'Continue to payment' },
				{ from: 'payment', to: 'confirmation', trigger: 'Pay' },
				{ from: 'basket', to: 'catalogue', trigger: 'Keep shopping' },
			],
		},
	},
	{
		name: 'Book an appointment',
		spec: {
			screens: [
				{ id: 'services', name: 'Choose a service', purpose: 'Pick what to book', keyContent: ['Service list', 'Prices'], states: ['default', 'loading'] },
				{ id: 'time', name: 'Pick a time', purpose: 'Choose an available slot', keyContent: ['Calendar', 'Time slots'], states: ['default', 'empty'] },
				{ id: 'details', name: 'Your details', purpose: 'Collect contact details', keyContent: ['Name field', 'Email field', 'Phone field'], states: ['default', 'error'] },
				{ id: 'review', name: 'Review booking', purpose: 'Check before confirming', keyContent: ['Summary', 'Cancellation policy', 'Confirm button'], states: ['default', 'loading'] },
				{ id: 'booked', name: 'Booked', purpose: 'Confirm the booking', keyContent: ['Booking reference', 'Add to calendar'], states: ['success'] },
			],
			connections: [
				{ from: 'services', to: 'time', trigger: 'Choose' },
				{ from: 'time', to: 'details', trigger: 'Select time' },
				{ from: 'details', to: 'review', trigger: 'Continue' },
				{ from: 'review', to: 'booked', trigger: 'Confirm booking' },
				{ from: 'review', to: 'time', trigger: 'Change time' },
			],
		},
	},
	{
		name: 'Support request',
		spec: {
			screens: [
				{ id: 'help', name: 'Help centre', purpose: 'Find an answer', keyContent: ['Search field', 'Popular articles'], states: ['default', 'empty'] },
				{ id: 'article', name: 'Article', purpose: 'Read an answer', keyContent: ['Article text', 'Was this helpful?'], states: ['default'] },
				{ id: 'contact', name: 'Contact support', purpose: 'Describe the problem', keyContent: ['Topic', 'Message field', 'Attach file', 'Send button'], states: ['default', 'error', 'loading'] },
				{ id: 'sent', name: 'Request sent', purpose: 'Confirm and set expectations', keyContent: ['Reference number', 'Reply time'], states: ['success'] },
				{ id: 'tickets', name: 'My requests', purpose: 'Track open requests', keyContent: ['Request list', 'Status'], states: ['default', 'empty'] },
			],
			connections: [
				{ from: 'help', to: 'article', trigger: 'Open article' },
				{ from: 'article', to: 'contact', trigger: 'Still need help' },
				{ from: 'help', to: 'contact', trigger: 'Contact us' },
				{ from: 'contact', to: 'sent', trigger: 'Send' },
				{ from: 'sent', to: 'tickets', trigger: 'View my requests' },
			],
		},
	},
];

export function randomStarterIndex(exclude?: number): number {
	if (STARTER_FLOWS.length < 2) return 0;
	let i = Math.floor(Math.random() * STARTER_FLOWS.length);
	if (i === exclude) i = (i + 1) % STARTER_FLOWS.length;
	return i;
}

/** The project with a starter flow laid out on the chosen devices, ready to hydrate (and autosave). */
export function projectWithStarterFlow(project: DesignerProject, index: number, devices: FlowDevice[]): DesignerProject {
	const starter = STARTER_FLOWS[index] ?? STARTER_FLOWS[0]!;
	const { spec } = repairFlowSpec(starter.spec);
	const { document } = applyFlowSpec(toProjectDocument(project), spec, {
		platform: platformForDevices(devices),
		platforms: devices,
		description: starter.name,
		newId: defaultNewId,
	});
	return fromProjectDocument(document);
}
