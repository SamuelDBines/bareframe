import { describe, expect, it } from 'vitest';
import { duplicatePageTree } from './duplicatePage';
import type { Page } from '../types';

const sample: Page = {
	id: 'page-a',
	name: 'Home',
	routePath: '/home',
	rootNodeId: 'n-root',
	nodes: {
		'n-root': {
			id: 'n-root',
			name: 'root',
			type: 'stack',
			parentId: null,
			children: ['n-child'],
			layout: {
				mode: 'stack',
				gap: 8,
				padding: [0, 0, 0, 0],
				align: 'stretch',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
		},
		'n-child': {
			id: 'n-child',
			name: 'text',
			type: 'text',
			parentId: 'n-root',
			children: [],
			content: { text: 'Hi', textTag: 'p' },
			layout: {
				mode: 'stack',
				gap: 0,
				padding: [0, 0, 0, 0],
				align: 'start',
				justify: 'start',
				widthMode: 'fill',
				heightMode: 'hug',
			},
		},
	},
};

describe('duplicatePageTree', () => {
	it('clones nodes with fresh ids and rewires parent/child links', () => {
		const copy = duplicatePageTree(sample, 'Home copy');
		expect(copy.id).not.toBe(sample.id);
		expect(copy.name).toBe('Home copy');
		expect(copy.rootNodeId).not.toBe(sample.rootNodeId);
		const root = copy.nodes[copy.rootNodeId];
		expect(root.children).toHaveLength(1);
		const childId = root.children[0];
		expect(copy.nodes[childId].parentId).toBe(copy.rootNodeId);
		expect(copy.nodes[childId].content?.text).toBe('Hi');
	});
});
