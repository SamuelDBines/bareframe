import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'cart',
	category: 'commerce',
	title: 'Cart',
	description: 'Review basket before checkout',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Checkout","Keep shopping"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Cart'),
					n.copy('Review basket before checkout'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Cart.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('cart')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('cart') ? [n.field('Search')] : []),
					n.btn('Checkout', 'primary'),
					n.btn('Keep shopping', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Checkout","Keep shopping"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Cart'),
					n.copy('Review basket before checkout'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Cart.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('cart')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('cart') ? [n.field('Search')] : []),
					n.btn('Checkout', 'primary'),
					n.btn('Keep shopping', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Checkout","Keep shopping"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Cart'),
					n.copy('Review basket before checkout'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Cart.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('cart')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('cart') ? [n.field('Search')] : []),
					n.btn('Checkout', 'primary'),
					n.btn('Keep shopping', 'secondary'),
				]),
		)
	],
});
