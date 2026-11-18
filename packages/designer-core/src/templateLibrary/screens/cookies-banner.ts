import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'cookies-banner',
	category: 'utility',
	title: 'Cookies',
	description: 'Consent banner',
	variants: [
		variant('default', 'Default', 'Standard', ['Accept', 'Manage preferences'], () =>
			n.stack([n.h1('Cookies'), n.copy('Consent banner.'), n.btn('Accept', 'primary')]),
		),
		variant('detailed', 'Detailed', 'More copy', ['Accept all', 'Reject non-essential'], () =>
			n.stack([
				n.h1('Cookies'),
				n.card('Summary', 'Plain language summary of how we use data.'),
				n.btn('Accept all', 'primary'),
				n.btn('Reject non-essential', 'ghost'),
			]),
		),
	],
});
