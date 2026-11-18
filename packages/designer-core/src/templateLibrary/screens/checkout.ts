import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'checkout',
	category: 'commerce',
	title: 'Checkout',
	description: 'Shipping and payment',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Continue","Place order","Pay now"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Checkout'),
					n.copy('Shipping and payment'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Checkout.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('checkout')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('checkout') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Place order', 'secondary'),
					n.btn('Pay now', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Continue","Place order"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Checkout'),
					n.copy('Shipping and payment'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Checkout.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('checkout')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('checkout') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Place order', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Continue","Place order"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Checkout'),
					n.copy('Shipping and payment'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Checkout.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('checkout')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('checkout') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Place order', 'secondary'),
				]),
		)
	],
});
