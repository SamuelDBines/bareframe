import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'magic-link-sign-in',
	category: 'auth',
	title: 'Magic link sign in',
	description: 'Email link login and dashboard',
	spec: {
	"screens": [
		{
			"id": "login",
			"name": "Log in",
			"purpose": "Template: login",
			"keyContent": [
				"Log in content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "verify-email",
			"name": "Check email",
			"purpose": "Template: verify-email",
			"keyContent": [
				"Check email content"
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
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "login",
			"to": "verify-email",
			"trigger": "Send magic link"
		},
		{
			"from": "verify-email",
			"to": "dashboard",
			"trigger": "Continue"
		}
	]
},
	defaultScreenVariants: {
	"login": "classic",
	"verify-email": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
