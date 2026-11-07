import type { DesignNode, Page } from '../types';

function newId(prefix: string) {
	return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Deep-clone a page tree with fresh node and page ids. */
export function duplicatePageTree(source: Page, name: string): Page {
	const idMap = new Map<string, string>();
	for (const nodeId of Object.keys(source.nodes)) {
		idMap.set(nodeId, newId('node'));
	}
	const pageId = newId('page');
	const nodes: Record<string, DesignNode> = {};
	for (const node of Object.values(source.nodes)) {
		const nextId = idMap.get(node.id)!;
		nodes[nextId] = {
			...JSON.parse(JSON.stringify(node)) as DesignNode,
			id: nextId,
			parentId: node.parentId ? (idMap.get(node.parentId) ?? null) : null,
			children: node.children.map((c) => idMap.get(c)!),
		};
	}
	const slug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');
	return {
		id: pageId,
		name,
		routePath: `/${slug || pageId}`,
		rootNodeId: idMap.get(source.rootNodeId)!,
		nodes,
	};
}
