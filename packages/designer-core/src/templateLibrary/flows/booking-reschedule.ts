import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'booking-reschedule',
	category: 'commerce',
	title: 'Reschedule booking',
	description: 'Change an appointment',
	spec: {
	"screens": [
		{
			"id": "booking-confirm",
			"name": "Booking",
			"purpose": "Template: booking-confirm",
			"keyContent": [
				"Booking content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "booking-reschedule",
			"name": "Reschedule",
			"purpose": "Template: booking-reschedule",
			"keyContent": [
				"Reschedule content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "booking-slot",
			"name": "New time",
			"purpose": "Template: booking-slot",
			"keyContent": [
				"New time content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "booking-confirm",
			"to": "booking-reschedule",
			"trigger": "Reschedule"
		},
		{
			"from": "booking-reschedule",
			"to": "booking-slot",
			"trigger": "Choose new time"
		},
		{
			"from": "booking-slot",
			"to": "booking-confirm",
			"trigger": "Confirm"
		}
	]
},
	defaultScreenVariants: {
	"booking-confirm": "classic",
	"booking-reschedule": "classic",
	"booking-slot": "classic"
},
};

export default FLOW;
