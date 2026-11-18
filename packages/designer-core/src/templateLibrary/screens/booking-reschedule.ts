import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'booking-reschedule',
	category: 'commerce',
	title: 'Reschedule',
	description: 'Change appointment',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Continue","Back","Save"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Reschedule'),
					n.copy('Change appointment'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Reschedule.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('booking-reschedule')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('booking-reschedule') ? [n.field('Search')] : []),
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
					n.h1('Reschedule'),
					n.copy('Change appointment'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Reschedule.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('booking-reschedule')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('booking-reschedule') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Back', 'secondary'),
				]),
		)
	],
});
