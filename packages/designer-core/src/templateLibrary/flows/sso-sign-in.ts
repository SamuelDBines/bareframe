import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'sso-sign-in',
	category: 'auth',
	title: 'SSO sign in',
	description: 'Social login path',
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
			"id": "two-factor",
			"name": "2FA",
			"purpose": "Template: two-factor",
			"keyContent": [
				"2FA content"
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
			"to": "two-factor",
			"trigger": "Continue with Google"
		},
		{
			"from": "two-factor",
			"to": "dashboard",
			"trigger": "Verify"
		}
	]
},
	defaultScreenVariants: {
	"login": "classic",
	"two-factor": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
