import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'login',
	category: 'auth',
	title: 'Log in',
	description: 'Sign in to an existing account',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Sign in","Forgot password?","Create account"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Log in'),
					n.copy('Sign in to an existing account'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Log in.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('login')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('login') ? [n.field('Search')] : []),
					n.btn('Sign in', 'primary'),
					n.btn('Forgot password?', 'secondary'),
					n.btn('Create account', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Sign in","Forgot password?"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Log in'),
					n.copy('Sign in to an existing account'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Log in.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('login')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('login') ? [n.field('Search')] : []),
					n.btn('Sign in', 'primary'),
					n.btn('Forgot password?', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Sign in","Forgot password?"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Log in'),
					n.copy('Sign in to an existing account'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Log in.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('login')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('login') ? [n.field('Search')] : []),
					n.btn('Sign in', 'primary'),
					n.btn('Forgot password?', 'secondary'),
				]),
		),
		variant(
			'social-first',
			'Social first',
			'SSO buttons prominent',
			["Continue with Google","Continue with Apple","Sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Log in'),
					n.copy('Sign in to an existing account'),
					...(device !== 'phone' && 'social-first' === 'split'
						? [n.card('Highlight', 'Visual or summary for Log in.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('login')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('login') ? [n.field('Search')] : []),
					n.btn('Continue with Google', 'primary'),
					n.btn('Continue with Apple', 'secondary'),
					n.btn('Sign in', 'secondary'),
				]),
		),
		variant(
			'minimal',
			'Minimal',
			'Fewest elements',
			["Sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Log in'),
					n.copy('Sign in to an existing account'),
					...(device !== 'phone' && 'minimal' === 'split'
						? [n.card('Highlight', 'Visual or summary for Log in.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('login')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('login') ? [n.field('Search')] : []),
					n.btn('Sign in', 'primary'),
				]),
		)
	],
});
