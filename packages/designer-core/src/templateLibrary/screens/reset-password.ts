import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'reset-password',
	category: 'auth',
	title: 'Reset password',
	description: 'Choose a new password',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Save password","Back to sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Reset password'),
					n.copy('Choose a new password'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Reset password.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('reset-password')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('reset-password') ? [n.field('Search')] : []),
					n.btn('Save password', 'primary'),
					n.btn('Back to sign in', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Save password","Back to sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Reset password'),
					n.copy('Choose a new password'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Reset password.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('reset-password')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('reset-password') ? [n.field('Search')] : []),
					n.btn('Save password', 'primary'),
					n.btn('Back to sign in', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Save password","Back to sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Reset password'),
					n.copy('Choose a new password'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Reset password.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('reset-password')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('reset-password') ? [n.field('Search')] : []),
					n.btn('Save password', 'primary'),
					n.btn('Back to sign in', 'secondary'),
				]),
		)
	],
});
