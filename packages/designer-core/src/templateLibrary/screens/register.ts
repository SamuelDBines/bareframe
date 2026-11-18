import type { DesignDevice, DesignTreeNode } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'register',
	category: 'auth',
	title: 'Register',
	description: 'Create a new account',
	variants: [
		variant(
			'classic',
			'Single step',
			'Full registration on one screen',
			['Create account', 'Sign in'],
			(device) =>
				n.stack([
					n.h1('Create your account'),
					n.copy('Start with a free workspace. Upgrade any time.'),
					n.field('Full name', 'Your name'),
					n.field('Work email', 'you@company.com'),
					n.field('Password', 'At least 8 characters'),
					n.btn('Create account', 'primary'),
					n.btn('Sign in', 'ghost'),
					...(device !== 'phone'
						? [n.alert('By continuing you agree to our terms and privacy policy.', 'info')]
						: []),
				], 18, 28),
		),
		variant(
			'multi-step',
			'Multi-step',
			'Step one of a short wizard',
			['Continue', 'Sign in'],
			() =>
				n.stack([
					n.badge('Step 1 of 3', 'outline'),
					n.h1('Your details'),
					n.copy('Tell us who you are. You can invite teammates next.'),
					n.field('Full name', 'Your name'),
					n.field('Work email', 'you@company.com'),
					n.field('Password', 'Create a password'),
					n.btn('Continue', 'primary'),
					n.btn('Sign in', 'ghost'),
				], 16, 28),
		),
		variant(
			'social-plus-email',
			'Social plus email',
			'SSO options with email signup below',
			['Continue with Google', 'Create account', 'Sign in'],
			(_device: DesignDevice) =>
				n.stack(
					[
						n.h1('Get started free'),
						n.copy('Unlimited viewers on every plan.'),
						n.btn('Continue with Google', 'primary'),
						n.btn('Continue with Apple', 'secondary'),
						n.copy('Or register with email'),
						n.field('Work email', 'you@company.com'),
						n.field('Password', 'Create a password'),
						n.btn('Create account', 'primary'),
						n.btn('Sign in', 'ghost'),
					],
					16,
					28,
				),
		),
		variant(
			'invite',
			'Invite acceptance',
			'Join a team from an email invite',
			['Join workspace', 'Sign in'],
			() =>
				n.stack([
					n.h1('You are invited'),
					n.card('Acme product team', 'Sam invited you as a designer.', 'elevated'),
					n.field('Full name', 'Your name'),
					n.field('Password', 'Choose a password'),
					n.btn('Join workspace', 'primary'),
					n.btn('Sign in', 'ghost'),
				], 16, 28),
		),
	],
});