import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'booking',
	category: 'commerce',
	title: 'Book appointment',
	description: 'Search, slot, details, confirm',
	spec: {
	"screens": [
		{
			"id": "booking-search",
			"name": "Services",
			"purpose": "Template: booking-search",
			"keyContent": [
				"Services content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "booking-slot",
			"name": "Pick time",
			"purpose": "Template: booking-slot",
			"keyContent": [
				"Pick time content"
			],
			"states": [
				"default",
				"empty"
			]
		},
		{
			"id": "booking-details",
			"name": "Details",
			"purpose": "Template: booking-details",
			"keyContent": [
				"Details content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "booking-confirm",
			"name": "Confirm",
			"purpose": "Template: booking-confirm",
			"keyContent": [
				"Confirm content"
			],
			"states": [
				"default",
				"success"
			]
		}
	],
	"connections": [
		{
			"from": "booking-search",
			"to": "booking-slot",
			"trigger": "Continue"
		},
		{
			"from": "booking-slot",
			"to": "booking-details",
			"trigger": "Select time"
		},
		{
			"from": "booking-details",
			"to": "booking-confirm",
			"trigger": "Continue"
		}
	]
},
	defaultScreenVariants: {
	"booking-search": "classic",
	"booking-slot": "classic",
	"booking-details": "classic",
	"booking-confirm": "classic"
},
};

export default FLOW;
