import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'pricing',
	category: 'utility',
	title: 'Pricing',
	description: 'Plans and tiers',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Choose plan","Contact sales"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Pricing'),
					n.copy('Plans and tiers'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Pricing.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('pricing')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('pricing') ? [n.field('Search')] : []),
					n.btn('Choose plan', 'primary'),
					n.btn('Contact sales', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Choose plan","Contact sales"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Pricing'),
					n.copy('Plans and tiers'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Pricing.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('pricing')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('pricing') ? [n.field('Search')] : []),
					n.btn('Choose plan', 'primary'),
					n.btn('Contact sales', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Choose plan","Contact sales"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Pricing'),
					n.copy('Plans and tiers'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Pricing.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('pricing')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('pricing') ? [n.field('Search')] : []),
					n.btn('Choose plan', 'primary'),
					n.btn('Contact sales', 'secondary'),
				]),
		)
	],
});
