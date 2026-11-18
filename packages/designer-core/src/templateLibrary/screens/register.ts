import type { DesignDevice } from '../../designSpec.js';
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
			'Classic',
			'Standard layout',
			["Create account","Sign in","Continue with Google"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Register'),
					n.copy('Create a new account'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Register.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('register')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('register') ? [n.field('Search')] : []),
					n.btn('Create account', 'primary'),
					n.btn('Sign in', 'secondary'),
					n.btn('Continue with Google', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Create account","Sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Register'),
					n.copy('Create a new account'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Register.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('register')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('register') ? [n.field('Search')] : []),
					n.btn('Create account', 'primary'),
					n.btn('Sign in', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Create account","Sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Register'),
					n.copy('Create a new account'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Register.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('register')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('register') ? [n.field('Search')] : []),
					n.btn('Create account', 'primary'),
					n.btn('Sign in', 'secondary'),
				]),
		),
		variant(
			'social-first',
			'Social first',
			'SSO buttons prominent',
			["Continue with Google","Continue with Apple","Create account"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Register'),
					n.copy('Create a new account'),
					...(device !== 'phone' && 'social-first' === 'split'
						? [n.card('Highlight', 'Visual or summary for Register.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('register')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('register') ? [n.field('Search')] : []),
					n.btn('Continue with Google', 'primary'),
					n.btn('Continue with Apple', 'secondary'),
					n.btn('Create account', 'secondary'),
				]),
		)
	],
});
