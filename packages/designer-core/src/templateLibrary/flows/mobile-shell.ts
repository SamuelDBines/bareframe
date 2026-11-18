import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'mobile-shell',
	category: 'utility',
	title: 'Mobile app shell',
	description: 'Splash and tab shell',
	spec: {
	"screens": [
		{
			"id": "splash",
			"name": "Splash",
			"purpose": "Template: splash",
			"keyContent": [
				"Splash content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "tab-shell",
			"name": "Home",
			"purpose": "Template: tab-shell",
			"keyContent": [
				"Home content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "pull-refresh-list",
			"name": "List",
			"purpose": "Template: pull-refresh-list",
			"keyContent": [
				"List content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "splash",
			"to": "tab-shell",
			"trigger": "Continue"
		},
		{
			"from": "tab-shell",
			"to": "pull-refresh-list",
			"trigger": "Open list"
		}
	]
},
	defaultScreenVariants: {
	"splash": "classic",
	"tab-shell": "classic",
	"pull-refresh-list": "classic"
},
};

export default FLOW;
