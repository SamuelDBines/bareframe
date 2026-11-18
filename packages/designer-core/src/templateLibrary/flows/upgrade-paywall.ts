import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'upgrade-paywall',
	category: 'app',
	title: 'Upgrade flow',
	description: 'Hit paywall and upgrade',
	spec: {
	"screens": [
		{
			"id": "dashboard",
			"name": "Dashboard",
			"purpose": "Template: dashboard",
			"keyContent": [
				"Dashboard content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "upgrade-paywall",
			"name": "Upgrade",
			"purpose": "Template: upgrade-paywall",
			"keyContent": [
				"Upgrade content"
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
			"id": "checkout",
			"name": "Checkout",
			"purpose": "Template: checkout",
			"keyContent": [
				"Checkout content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "dashboard",
			"to": "upgrade-paywall",
			"trigger": "Upgrade"
		},
		{
			"from": "upgrade-paywall",
			"to": "pricing",
			"trigger": "See plans"
		},
		{
			"from": "pricing",
			"to": "checkout",
			"trigger": "Choose plan"
		}
	]
},
	defaultScreenVariants: {
	"dashboard": "classic",
	"upgrade-paywall": "classic",
	"pricing": "classic",
	"checkout": "classic"
},
};

export default FLOW;
