import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'settings',
	category: 'app',
	title: 'Settings',
	description: 'Account preferences',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Continue","Back","Save"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Settings'),
					n.copy('Account preferences'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Settings.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('settings')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('settings') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Back', 'secondary'),
					n.btn('Save', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Continue","Back"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Settings'),
					n.copy('Account preferences'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Settings.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('settings')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('settings') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Back', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Continue","Back"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Settings'),
					n.copy('Account preferences'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Settings.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('settings')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('settings') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Back', 'secondary'),
				]),
		)
	],
});
