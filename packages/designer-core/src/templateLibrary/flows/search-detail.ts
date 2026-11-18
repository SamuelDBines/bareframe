import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'search-detail',
	category: 'content',
	title: 'Search to detail',
	description: 'Search, open a result, and view detail',
	spec: {
	"screens": [
		{
			"id": "search",
			"name": "Search",
			"purpose": "Template: search",
			"keyContent": [
				"Search content"
			],
			"states": [
				"default",
				"empty"
			]
		},
		{
			"id": "search-results",
			"name": "Results",
			"purpose": "Template: search-results",
			"keyContent": [
				"Results content"
			],
			"states": [
				"default"
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
		}
	],
	"connections": [
		{
			"from": "search",
			"to": "search-results",
			"trigger": "Search"
		},
		{
			"from": "search-results",
			"to": "record-detail",
			"trigger": "Open"
		},
		{
			"from": "record-detail",
			"to": "search-results",
			"trigger": "Back"
		}
	]
},
	defaultScreenVariants: {
	"search": "classic",
	"search-results": "classic",
	"record-detail": "classic"
},
};

export default FLOW;
