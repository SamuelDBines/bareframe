import type { DesignDevice, DesignTreeNode } from '../designSpec.js';

export function h1(text: string): DesignTreeNode {
	return { type: 'heading', level: 1, text };
}

export function h2(text: string): DesignTreeNode {
	return { type: 'heading', level: 2, text };
}

export function copy(text: string): DesignTreeNode {
	return { type: 'text', text };
}

export function field(label: string, placeholder?: string): DesignTreeNode {
	return { type: 'input', props: { label, placeholder: placeholder ?? label } };
}

export function btn(label: string, variant: 'primary' | 'secondary' | 'ghost' = 'primary'): DesignTreeNode {
	return { type: 'button', props: { label, variant } };
}

export function card(title: string, body: string, variant: 'outlined' | 'elevated' | 'ghost' = 'outlined'): DesignTreeNode {
	return { type: 'card', props: { title, body, variant } };
}

export function alert(text: string, variant: 'info' | 'success' | 'warning' | 'danger' = 'info'): DesignTreeNode {
	return { type: 'alert', props: { text, variant } };
}

export function badge(label: string, variant: 'default' | 'success' | 'outline' = 'default'): DesignTreeNode {
	return { type: 'badge', props: { label, variant } };
}

export function stack(children: DesignTreeNode[], gap = 16, padding = 24): DesignTreeNode {
	return { type: 'stack', gap, padding, children };
}

export function row(children: DesignTreeNode[], gap = 16, padding = 0): DesignTreeNode {
	return { type: 'row', gap, padding, children };
}

export function section(children: DesignTreeNode[], gap = 12, padding = 16): DesignTreeNode {
	return { type: 'section', gap, padding, children };
}

/** Wider layouts use a row on tablet and desktop when split is requested. */
export function columnOrSplit(
	device: DesignDevice,
	single: DesignTreeNode[],
	split: [DesignTreeNode[], DesignTreeNode[]],
): DesignTreeNode {
	if (device === 'phone') return stack(single);
	return row([stack(split[0]), stack(split[1])], 24);
}

export function primaryActions(labels: string[]): DesignTreeNode {
	const buttons = labels.map((label, i) => btn(label, i === 0 ? 'primary' : 'secondary'));
	return labels.length > 1 ? row(buttons, 12) : stack(buttons);
}