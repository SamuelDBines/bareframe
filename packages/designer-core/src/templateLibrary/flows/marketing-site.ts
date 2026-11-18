import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'marketing-site',
	category: 'utility',
	title: 'Marketing site',
	description: 'Home, features, pricing, contact',
	spec: {
	"screens": [
		{
			"id": "marketing-home",
			"name": "Home",
			"purpose": "Template: marketing-home",
			"keyContent": [
				"Home content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "features",
			"name": "Features",
			"purpose": "Template: features",
			"keyContent": [
				"Features content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "pricing",
			"name": "Pricing",
			"purpose": "Template: pricing",
			"keyContent": [
				"Pricing content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "contact",
			"name": "Contact",
			"purpose": "Template: contact",
			"keyContent": [
				"Contact content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "legal-terms",
			"name": "Terms",
			"purpose": "Template: legal-terms",
			"keyContent": [
				"Terms content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "marketing-home",
			"to": "features",
			"trigger": "See features"
		},
		{
			"from": "marketing-home",
			"to": "pricing",
			"trigger": "See pricing"
		},
		{
			"from": "features",
			"to": "contact",
			"trigger": "Contact"
		},
		{
			"from": "pricing",
			"to": "marketing-home",
			"trigger": "Get started"
		}
	]
},
	defaultScreenVariants: {
	"marketing-home": "classic",
	"features": "classic",
	"pricing": "classic",
	"contact": "classic",
	"legal-terms": "classic"
},
};

export default FLOW;
