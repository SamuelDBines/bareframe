import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'sign-in',
	category: 'auth',
	title: 'Sign in',
	description: 'Log in, reset password, and reach the dashboard',
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
				"default",
				"error"
			]
		},
		{
			"id": "forgot-password",
			"name": "Forgot password",
			"purpose": "Template: forgot-password",
			"keyContent": [
				"Forgot password content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "reset-password",
			"name": "Reset password",
			"purpose": "Template: reset-password",
			"keyContent": [
				"Reset password content"
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
			"to": "dashboard",
			"trigger": "Sign in"
		},
		{
			"from": "login",
			"to": "forgot-password",
			"trigger": "Forgot password?"
		},
		{
			"from": "forgot-password",
			"to": "reset-password",
			"trigger": "Send reset link"
		},
		{
			"from": "reset-password",
			"to": "login",
			"trigger": "Save password"
		}
	]
},
	defaultScreenVariants: {
	"login": "classic",
	"forgot-password": "classic",
	"reset-password": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
