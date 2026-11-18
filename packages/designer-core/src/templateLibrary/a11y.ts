import type { DesignTreeNode } from '../designSpec.js';

export type A11yIssue = { path: string; message: string };

function walk(tree: DesignTreeNode, path: string, issues: A11yIssue[]) {
	if (tree.type === 'heading') {
		return;
	}
	if (tree.type === 'input') {
		if (!tree.props.label?.trim()) issues.push({ path, message: 'Input missing label' });
		return;
	}
	if ('props' in tree && tree.type === 'button') {
		if (!tree.props.label?.trim()) issues.push({ path, message: 'Button missing label' });
		return;
	}
	if ('children' in tree) {
		tree.children.forEach((c, i) => walk(c, `${path}.children[${i}]`, issues));
	}
}

/** Basic checks: labelled controls, heading present. */
export function checkDesignTreeA11y(tree: DesignTreeNode): A11yIssue[] {
	const issues: A11yIssue[] = [];
	walk(tree, 'root', issues);
	let hasH1 = false;
	const scan = (n: DesignTreeNode) => {
		if (n.type === 'heading' && n.level === 1) hasH1 = true;
		if ('children' in n) n.children.forEach(scan);
	};
	scan(tree);
	if (!hasH1) issues.push({ path: 'root', message: 'Missing level-1 heading' });
	return issues;
}