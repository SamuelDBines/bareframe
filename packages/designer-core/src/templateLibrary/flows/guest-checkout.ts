import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'guest-checkout',
	category: 'commerce',
	title: 'Guest checkout',
	description: 'Checkout without an account',
	spec: {
	"screens": [
		{
			"id": "cart",
			"name": "Cart",
			"purpose": "Template: cart",
			"keyContent": [
				"Cart content"
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
			"id": "payment-failure",
			"name": "Payment failed",
			"purpose": "Template: payment-failure",
			"keyContent": [
				"Payment failed content"
			],
			"states": [
				"error"
			]
		},
		{
			"id": "order-confirmation",
			"name": "Confirmed",
			"purpose": "Template: order-confirmation",
			"keyContent": [
				"Confirmed content"
			],
			"states": [
				"success"
			]
		}
	],
	"connections": [
		{
			"from": "cart",
			"to": "checkout",
			"trigger": "Checkout"
		},
		{
			"from": "checkout",
			"to": "order-confirmation",
			"trigger": "Place order"
		},
		{
			"from": "checkout",
			"to": "payment-failure",
			"trigger": "Pay now"
		},
		{
			"from": "payment-failure",
			"to": "checkout",
			"trigger": "Try again"
		}
	]
},
	defaultScreenVariants: {
	"cart": "classic",
	"checkout": "classic",
	"payment-failure": "classic",
	"order-confirmation": "classic"
},
};

export default FLOW;
