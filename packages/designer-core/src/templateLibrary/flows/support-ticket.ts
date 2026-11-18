import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'support-ticket',
	category: 'utility',
	title: 'Support request',
	description: 'Help centre to ticket',
	spec: {
	"screens": [
		{
			"id": "help-center",
			"name": "Help",
			"purpose": "Template: help-center",
			"keyContent": [
				"Help content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "help-article",
			"name": "Article",
			"purpose": "Template: help-article",
			"keyContent": [
				"Article content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "contact-support",
			"name": "Contact",
			"purpose": "Template: contact-support",
			"keyContent": [
				"Contact content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "ticket-submitted",
			"name": "Sent",
			"purpose": "Template: ticket-submitted",
			"keyContent": [
				"Sent content"
			],
			"states": [
				"success"
			]
		},
		{
			"id": "my-tickets",
			"name": "My tickets",
			"purpose": "Template: my-tickets",
			"keyContent": [
				"My tickets content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "help-center",
			"to": "help-article",
			"trigger": "Open article"
		},
		{
			"from": "help-article",
			"to": "contact-support",
			"trigger": "Still need help"
		},
		{
			"from": "contact-support",
			"to": "ticket-submitted",
			"trigger": "Send"
		},
		{
			"from": "ticket-submitted",
			"to": "my-tickets",
			"trigger": "View my requests"
		}
	]
},
	defaultScreenVariants: {
	"help-center": "classic",
	"help-article": "classic",
	"contact-support": "classic",
	"ticket-submitted": "classic",
	"my-tickets": "classic"
},
};

export default FLOW;
