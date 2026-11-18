import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'plan-onboarding',
	category: 'onboarding',
	title: 'Plan selection onboarding',
	description: 'Pick a plan after signup',
	spec: {
	"screens": [
		{
			"id": "plan-select",
			"name": "Choose plan",
			"purpose": "Template: plan-select",
			"keyContent": [
				"Choose plan content"
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
		},
		{
			"id": "dashboard",
			"name": "Dashboard",
			"purpose": "Template: dashboard",
			"keyContent": [
				"Dashboard content"
			],
			"states": [
				"success"
			]
		}
	],
	"connections": [
		{
			"from": "plan-select",
			"to": "pricing",
			"trigger": "See all plans"
		},
		{
			"from": "pricing",
			"to": "checkout",
			"trigger": "Choose plan"
		},
		{
			"from": "checkout",
			"to": "dashboard",
			"trigger": "Place order"
		}
	]
},
	defaultScreenVariants: {
	"plan-select": "classic",
	"pricing": "classic",
	"checkout": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
