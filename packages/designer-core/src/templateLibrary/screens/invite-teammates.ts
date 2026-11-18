import type { DesignDevice } from '../../designSpec.js';
import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'invite-teammates',
	category: 'onboarding',
	title: 'Invite teammates',
	description: 'Send invites by email',
	variants: [
		variant(
			'classic',
			'Classic',
			'Standard layout',
			["Continue","Back","Save"],
			(device: DesignDevice) =>
				n.stack([
					n.h1('Invite teammates'),
					n.copy('Send invites by email'),
					...(device !== 'phone' && 'classic' === 'split'
						? [n.card('Highlight', 'Visual or summary for Invite teammates.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('invite-teammates')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('invite-teammates') ? [n.field('Search')] : []),
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
					n.h1('Invite teammates'),
					n.copy('Send invites by email'),
					...(device !== 'phone' && 'compact' === 'split'
						? [n.card('Highlight', 'Visual or summary for Invite teammates.', 'elevated')]
						: []),
					...(['login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'change-credentials', 'profile-setup', 'booking-details', 'contact-support', 'form-create', 'checkout', 'payment', 'generic-form'].includes('invite-teammates')
						? [n.field('Email'), n.field('Password')]
						: []),
					...(['search', 'product-catalog', 'help-center', 'feed', 'list'].includes('invite-teammates') ? [n.field('Search')] : []),
					n.btn('Continue', 'primary'),
					n.btn('Back', 'secondary'),
				]),
		)
	],
});
