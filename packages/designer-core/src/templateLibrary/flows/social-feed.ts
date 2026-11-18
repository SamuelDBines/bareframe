import type { FlowTemplateMeta } from '../types.js';

const FLOW: FlowTemplateMeta = {
	id: 'social-feed',
	category: 'content',
	title: 'Social feed',
	description: 'Feed, post, comments, profile',
	spec: {
	"screens": [
		{
			"id": "feed",
			"name": "Feed",
			"purpose": "Template: feed",
			"keyContent": [
				"Feed content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "compose-post",
			"name": "Compose",
			"purpose": "Template: compose-post",
			"keyContent": [
				"Compose content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "post-detail",
			"name": "Post",
			"purpose": "Template: post-detail",
			"keyContent": [
				"Post content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "comments",
			"name": "Comments",
			"purpose": "Template: comments",
			"keyContent": [
				"Comments content"
			],
			"states": [
				"default"
			]
		},
		{
			"id": "user-profile",
			"name": "Profile",
			"purpose": "Template: user-profile",
			"keyContent": [
				"Profile content"
			],
			"states": [
				"default"
			]
		}
	],
	"connections": [
		{
			"from": "feed",
			"to": "compose-post",
			"trigger": "New post"
		},
		{
			"from": "feed",
			"to": "post-detail",
			"trigger": "Open post"
		},
		{
			"from": "post-detail",
			"to": "comments",
			"trigger": "View comments"
		},
		{
			"from": "post-detail",
			"to": "user-profile",
			"trigger": "View profile"
		}
	]
},
	defaultScreenVariants: {
	"feed": "classic",
	"compose-post": "classic",
	"post-detail": "classic",
	"comments": "classic",
	"user-profile": "classic"
},
};

export default FLOW;
