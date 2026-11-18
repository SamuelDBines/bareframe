import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'sign-up',
	category: 'auth',
	title: 'Sign up and onboarding',
	description: 'Register, verify, set up profile, and land on dashboard',
	spec: {
	"screens": [
		{
			"id": "register",
			"name": "Register",
			"purpose": "Template: register",
			"keyContent": [
				"Register content"
			],
			"states": [
				"default",
				"error"
			]
		},
		{
			"id": "verify-email",
			"name": "Verify email",
			"purpose": "Template: verify-email",
			"keyContent": [
				"Verify email content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "onboarding",
			"name": "Onboarding",
			"purpose": "Template: onboarding",
			"keyContent": [
				"Onboarding content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "profile-setup",
			"name": "Profile",
			"purpose": "Template: profile-setup",
			"keyContent": [
				"Profile content"
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
			"from": "register",
			"to": "verify-email",
			"trigger": "Create account"
		},
		{
			"from": "verify-email",
			"to": "onboarding",
			"trigger": "Verify"
		},
		{
			"from": "onboarding",
			"to": "profile-setup",
			"trigger": "Continue"
		},
		{
			"from": "profile-setup",
			"to": "dashboard",
			"trigger": "Continue"
		}
	]
},
	defaultScreenVariants: {
	"register": "classic",
	"verify-email": "classic",
	"onboarding": "classic",
	"profile-setup": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
