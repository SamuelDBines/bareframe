import { defineScreen, variant } from '../screenBuilder.js';
import * as n from '../nodes.js';

export default defineScreen({
	id: 'legal-privacy',
	category: 'utility',
	title: 'Privacy policy',
	description: 'Data use',
	variants: [
		variant('default', 'Default', 'Standard', ['Accept', 'Manage preferences'], () =>
			n.stack([n.h1('Privacy policy'), n.copy('Data use.'), n.btn('Accept', 'primary')]),
		),
		variant('detailed', 'Detailed', 'More copy', ['Accept all', 'Reject non-essential'], () =>
			n.stack([
				n.h1('Privacy policy'),
				n.card('Summary', 'Plain language summary of how we use data.'),
				n.btn('Accept all', 'primary'),
				n.btn('Reject non-essential', 'ghost'),
			]),
		),
	],
});
