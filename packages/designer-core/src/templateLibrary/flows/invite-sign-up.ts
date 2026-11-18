import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'invite-sign-up',
	category: 'onboarding',
	title: 'Invite acceptance',
	description: 'Accept invite and join workspace',
	spec: {
	"screens": [
		{
			"id": "register",
			"name": "Join team",
			"purpose": "Template: register",
			"keyContent": [
				"Join team content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "workspace-create",
			"name": "Workspace",
			"purpose": "Template: workspace-create",
			"keyContent": [
				"Workspace content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "invite-teammates",
			"name": "Invite",
			"purpose": "Template: invite-teammates",
			"keyContent": [
				"Invite content"
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
			"to": "workspace-create",
			"trigger": "Create account"
		},
		{
			"from": "workspace-create",
			"to": "invite-teammates",
			"trigger": "Continue"
		},
		{
			"from": "invite-teammates",
			"to": "dashboard",
			"trigger": "Skip for now"
		}
	]
},
	defaultScreenVariants: {
	"register": "classic",
	"workspace-create": "classic",
	"invite-teammates": "classic",
	"dashboard": "classic"
},
};

export default FLOW;
