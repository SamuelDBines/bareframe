import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'cancel-subscription',
	category: 'app',
	title: 'Cancel subscription',
	description: 'Leave paid plan',
	spec: {
	"screens": [
		{
			"id": "settings-billing",
			"name": "Billing",
			"purpose": "Template: settings-billing",
			"keyContent": [
				"Billing content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "subscription-cancel",
			"name": "Cancel",
			"purpose": "Template: subscription-cancel",
			"keyContent": [
				"Cancel content"
			],
			"states": [
				"default"
			]
		},
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
		}
	],
	"connections": [
		{
			"from": "settings-billing",
			"to": "subscription-cancel",
			"trigger": "Cancel plan"
		},
		{
			"from": "subscription-cancel",
			"to": "dashboard",
			"trigger": "Confirm cancellation"
		}
	]
},
	defaultScreenVariants: {
	"settings-billing": "classic",
	"subscription-cancel": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
