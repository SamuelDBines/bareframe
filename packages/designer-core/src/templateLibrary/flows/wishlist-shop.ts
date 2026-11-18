import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'wishlist-shop',
	category: 'commerce',
	title: 'Wishlist',
	description: 'Save items and buy',
	spec: {
	"screens": [
		{
			"id": "wishlist",
			"name": "Wishlist",
			"purpose": "Template: wishlist",
			"keyContent": [
				"Wishlist content"
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
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "wishlist",
			"to": "product-detail",
			"trigger": "Open product"
		},
		{
			"from": "product-detail",
			"to": "cart",
			"trigger": "Add to basket"
		}
	]
},
	defaultScreenVariants: {
	"wishlist": "classic",
	"product-detail": "classic",
	"cart": "classic"
},
};

export default FLOW;
