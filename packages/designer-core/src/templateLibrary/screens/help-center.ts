import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'help-center',
	category: 'utility',
	title: 'Help center',
	description: 'Search help articles',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Search","Contact us"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Help center'),
					n.copy('Search help articles'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Help center.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('help-center')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('help-center') ? [n.field('Search')] : []),
					n.btn('Search', 'primary'),
					n.btn('Contact us', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Search","Contact us"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Help center'),
					n.copy('Search help articles'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Help center.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('help-center')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('help-center') ? [n.field('Search')] : []),
					n.btn('Search', 'primary'),
					n.btn('Contact us', 'secondary'),
				]),
		)
	],
});
