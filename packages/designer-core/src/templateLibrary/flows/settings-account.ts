import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'settings-account',
	category: 'app',
	title: 'Settings and account',
	description: 'Dashboard to settings, billing, security, and logout',
	spec: {
	"screens": [
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
		},
		{
			"id": "settings",
			"name": "Settings",
			"purpose": "Template: settings",
			"keyContent": [
				"Settings content"
			],
			"states": [
				"default"
			]
		},
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
			"id": "settings-security",
			"name": "Security",
			"purpose": "Template: settings-security",
			"keyContent": [
				"Security content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "logout",
			"name": "Log out",
			"purpose": "Template: logout",
			"keyContent": [
				"Log out content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "dashboard",
			"to": "settings",
			"trigger": "Settings"
		},
		{
			"from": "settings",
			"to": "settings-billing",
			"trigger": "Billing"
		},
		{
			"from": "settings",
			"to": "settings-security",
			"trigger": "Security"
		},
		{
			"from": "settings",
			"to": "logout",
			"trigger": "Log out"
		}
	]
},
	defaultScreenVariants: {
	"dashboard": "classic",
	"settings": "classic",
	"settings-billing": "classic",
	"settings-security": "classic",
	"logout": "classic"
},
};

export default FLOW;
