import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'checkout',
	category: 'commerce',
	title: 'Shop checkout',
	description: 'Browse, cart, checkout, and confirmation',
	spec: {
	"screens": [
		{
			"id": "product-catalog",
			"name": "Catalog",
			"purpose": "Template: product-catalog",
			"keyContent": [
				"Catalog content"
			],
			"states": [
				"default",
				"empty"
			]
		},
		{
			"id": "product-detail",
			"name": "Product",
			"purpose": "Template: product-detail",
			"keyContent": [
				"Product content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "cart",
			"name": "Cart",
			"purpose": "Template: cart",
			"keyContent": [
				"Cart content"
			],
			"states": [
				"default",
				"empty"
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
				"default",
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
			"from": "product-catalog",
			"to": "product-detail",
			"trigger": "Open product"
		},
		{
			"from": "product-detail",
			"to": "cart",
			"trigger": "Add to basket"
		},
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
			"from": "cart",
			"to": "product-catalog",
			"trigger": "Keep shopping"
		}
	]
},
	defaultScreenVariants: {
	"product-catalog": "classic",
	"product-detail": "classic",
	"cart": "classic",
	"checkout": "classic",
	"order-confirmation": "classic"
},
};

export default FLOW;
