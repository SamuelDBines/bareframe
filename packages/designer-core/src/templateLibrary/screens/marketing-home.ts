import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'marketing-home',
	category: 'utility',
	title: 'Marketing home',
	description: 'Landing hero and CTA',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Get started","Sign in","See pricing"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Marketing home'),
					n.copy('Landing hero and CTA'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Marketing home.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('marketing-home')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('marketing-home') ? [n.field('Search')] : []),
					n.btn('Get started', 'primary'),
					n.btn('Sign in', 'secondary'),
					n.btn('See pricing', 'secondary'),
				]),
		),
		variant(
			'compact',
			'Compact',
			'Tighter spacing',
			["Get started","Sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Marketing home'),
					n.copy('Landing hero and CTA'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Marketing home.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('marketing-home')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('marketing-home') ? [n.field('Search')] : []),
					n.btn('Get started', 'primary'),
					n.btn('Sign in', 'secondary'),
				]),
		),
		variant(
			'split',
			'Split view',
			'Hero beside form on large screens',
			["Get started","Sign in"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Marketing home'),
					n.copy('Landing hero and CTA'),
					...(device !== 'phone' && 'split' === 'split'
						? [n.card('Highlight', 'Visual or summary for Marketing home.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('marketing-home')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('marketing-home') ? [n.field('Search')] : []),
					n.btn('Get started', 'primary'),
					n.btn('Sign in', 'secondary'),
				]),
		)
	],
});
