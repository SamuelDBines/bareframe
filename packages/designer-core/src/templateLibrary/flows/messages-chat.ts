import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'messages-chat',
	category: 'content',
	title: 'Messages',
	description: 'Inbox and thread',
	spec: {
	"screens": [
		{
			"id": "messages",
			"name": "Inbox",
			"purpose": "Template: messages",
			"keyContent": [
				"Inbox content"
			],
			"states": [
				"default",
				"empty"
			]
		},
		{
			"id": "user-profile",
			"name": "Contact",
			"purpose": "Template: user-profile",
			"keyContent": [
				"Contact content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "messages",
			"to": "user-profile",
			"trigger": "Open contact"
		}
	]
},
	defaultScreenVariants: {
	"messages": "classic",
	"user-profile": "classic"
},
};

export default FLOW;
