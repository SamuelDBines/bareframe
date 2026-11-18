import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'blog',
	category: 'utility',
	title: 'Blog',
	description: 'List and read articles',
	spec: {
	"screens": [
		{
			"id": "blog-list",
			"name": "Blog",
			"purpose": "Template: blog-list",
			"keyContent": [
				"Blog content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "blog-post",
			"name": "Article",
			"purpose": "Template: blog-post",
			"keyContent": [
				"Article content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "blog-list",
			"to": "blog-post",
			"trigger": "Read more"
		}
	]
},
	defaultScreenVariants: {
	"blog-list": "classic",
	"blog-post": "classic"
},
};

export default FLOW;
