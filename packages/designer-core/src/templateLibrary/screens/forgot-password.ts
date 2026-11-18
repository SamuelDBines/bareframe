import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'forgot-password',
	category: 'auth',
	title: 'Forgot password',
	description: 'Request a password reset',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Send reset link","Back to sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Forgot password'),
					n.copy('Request a password reset'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Forgot password.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('forgot-password')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('forgot-password') ? [n.field('Search')] : []),
					n.btn('Send reset link', 'primary'),
					n.btn('Back to sign in', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Send reset link","Back to sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Forgot password'),
					n.copy('Request a password reset'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Forgot password.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('forgot-password')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('forgot-password') ? [n.field('Search')] : []),
					n.btn('Send reset link', 'primary'),
					n.btn('Back to sign in', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Send reset link","Back to sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Forgot password'),
					n.copy('Request a password reset'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Forgot password.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('forgot-password')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('forgot-password') ? [n.field('Search')] : []),
					n.btn('Send reset link', 'primary'),
					n.btn('Back to sign in', 'secondary'),
				]),
		)
	],
});
