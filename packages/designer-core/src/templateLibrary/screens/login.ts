import type { DesignDevice, DesignTreeNode } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

function passwordFields(): DesignTreeNode[] {
	return [n.field('Email', 'you@example.com'), n.field('Password', '••••••••')];
}

export default defineScreen({
	id: 'login',
	category: 'auth',
	title: 'Log in',
	description: 'Sign in to an existing account',
	variants: [
		variant(
			'classic',
			'Email and password',
			'Centered form with primary sign-in and account links',
			['Sign in', 'Forgot password?', 'Create account'],
			(device) =>
				n.stack([
					n.h1('Welcome back'),
					n.copy('Sign in to continue to your workspace.'),
					...passwordFields(),
					n.btn('Sign in', 'primary'),
					n.row([n.btn('Forgot password?', 'ghost'), n.btn('Create account', 'ghost')], 8),
					...(device !== 'phone'
						? [n.card('Tip', 'Use your work email if your team invited you.', 'ghost')]
						: []),
				], 20, 28),
		),
		variant(
			'social-first',
			'Social first',
			'SSO buttons above the email form',
			['Continue with Google', 'Continue with Apple', 'Sign in', 'Create account'],
			() =>
				n.stack([
					n.h1('Log in'),
					n.btn('Continue with Google', 'primary'),
					n.btn('Continue with Apple', 'secondary'),
					n.alert('We never post on your behalf.', 'info'),
					n.copy('Or use your email'),
					...passwordFields(),
					n.btn('Sign in', 'primary'),
					n.btn('Create account', 'ghost'),
				], 16, 28),
		),
		variant(
			'magic-link',
			'Magic link',
			'Passwordless email sign-in',
			['Send magic link', 'Use password instead', 'Create account'],
			(device) =>
				n.stack([
					n.h1('Sign in with email'),
					n.copy('We will email you a secure link. No password needed.'),
					n.field('Email', 'you@example.com'),
					n.btn('Send magic link', 'primary'),
					n.btn('Use password instead', 'ghost'),
					n.btn('Create account', 'ghost'),
					...(device === 'desktop'
						? [n.card('Secure login', 'Links expire in 15 minutes.', 'outlined')]
						: []),
				], 18, 28),
		),
		variant(
			'split-hero',
			'Split hero',
			'Marketing panel beside the form on large screens',
			['Sign in', 'Forgot password?', 'Create account'],
			(device) => {
				const hero: DesignTreeNode[] = [
					n.card('Ship faster', 'Bareframe turns flows into clickable prototypes in minutes.', 'elevated'),
					n.badge('Trusted by product teams', 'success'),
				];
				const form: DesignTreeNode[] = [
					n.h1('Log in'),
					...passwordFields(),
					n.btn('Sign in', 'primary'),
					n.btn('Forgot password?', 'ghost'),
					n.btn('Create account', 'secondary'),
				];
				return n.columnOrSplit(device, [...hero, ...form], [hero, form]);
			},
		),
		variant(
			'minimal',
			'Minimal',
			'Compact sign-in for embedded or modal use',
			['Sign in', 'Create account'],
			() =>
				n.stack(
					[
						n.h1('Sign in'),
						n.field('Email', 'Email'),
						n.field('Password', 'Password'),
						n.btn('Sign in', 'primary'),
						n.btn('Create account', 'ghost'),
					],
					12,
					20,
				),
		),
	],
});