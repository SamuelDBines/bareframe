import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'saas-crud',
	category: 'app',
	title: 'List, detail, edit',
	description: 'Core SaaS CRUD journey',
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
			"id": "list",
			"name": "List",
			"purpose": "Template: list",
			"keyContent": [
				"List content"
			],
			"states": [
				"default",
				"empty"
			]
		},
		{
			"id": "record-detail",
			"name": "Detail",
			"purpose": "Template: record-detail",
			"keyContent": [
				"Detail content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "form-create",
			"name": "Edit",
			"purpose": "Template: form-create",
			"keyContent": [
				"Edit content"
			],
			"states": [
				"default",
				"error"
			]
		}
	],
	"connections": [
		{
			"from": "dashboard",
			"to": "list",
			"trigger": "View all"
		},
		{
			"from": "list",
			"to": "record-detail",
			"trigger": "Open"
		},
		{
			"from": "record-detail",
			"to": "form-create",
			"trigger": "Edit"
		},
		{
			"from": "form-create",
			"to": "list",
			"trigger": "Save"
		}
	]
},
	defaultScreenVariants: {
	"dashboard": "classic",
	"list": "classic",
	"record-detail": "classic",
	"form-create": "classic"
},
};

export default FLOW;
