import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'order-returns',
	category: 'commerce',
	title: 'Orders and returns',
	description: 'History and return flow',
	spec: {
	"screens": [
		{
			"id": "order-history",
			"name": "Orders",
			"purpose": "Template: order-history",
			"keyContent": [
				"Orders content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "order-confirmation",
			"name": "Order detail",
			"purpose": "Template: order-confirmation",
			"keyContent": [
				"Order detail content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "returns",
			"name": "Return",
			"purpose": "Template: returns",
			"keyContent": [
				"Return content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "order-history",
			"to": "order-confirmation",
			"trigger": "View order"
		},
		{
			"from": "order-confirmation",
			"to": "returns",
			"trigger": "Start return"
		}
	]
},
	defaultScreenVariants: {
	"order-history": "classic",
	"order-confirmation": "classic",
	"returns": "classic"
},
};

export default FLOW;
