import type { DesignNode, LayoutModel, Page } from './types.js';

/**
 * AI screen designs. The model returns a tree that may only use the components below: the
 * @bareframe/react components the canvas and prototype can render, plus layout containers and
 * text. `repairDesignSpec` drops anything else (raw HTML, invented components) and records it;
 * `designToNodes` turns the default state into page nodes.
 */

export const DESIGN_DEVICES = ['phone', 'tablet', 'desktop'] as const;
export type DesignDevice = (typeof DESIGN_DEVICES)[number];

/** Allowed components and their props (all strings). Keys match @bareframe/react component slugs. */
export const DESIGN_COMPONENTS = {
	button: { props: ['label', 'variant'], variants: ['primary', 'secondary', 'ghost'] },
	input: { props: ['label', 'placeholder'], variants: [] },
	card: { props: ['title', 'body', 'variant'], variants: ['outlined', 'elevated', 'ghost'] },
	badge: { props: ['label', 'variant'], variants: ['default', 'success', 'outline'] },
	alert: { props: ['text', 'variant'], variants: ['info', 'success', 'warning', 'danger'] },
} as const;
export type DesignComponent = keyof typeof DESIGN_COMPONENTS;

export const DESIGN_LAYOUTS = ['stack', 'row', 'section'] as const;
export type DesignLayout = (typeof DESIGN_LAYOUTS)[number];

export type DesignTreeNode =
	| { type: DesignLayout; gap?: number; padding?: number; children: DesignTreeNode[] }
	| { type: 'heading'; text: string; level: 1 | 2 | 3 }
	| { type: 'text'; text: string }
	| { type: DesignComponent; props: Record<string, string> };

export type DesignStateName = 'default' | 'empty' | 'loading' | 'error' | 'success';

export type DesignSpec = {
	/** One tree per state; `default` is always present. */
	states: Partial<Record<DesignStateName, DesignTreeNode>> & { default: DesignTreeNode };
};

export const DESIGN_LIMITS = { maxNodes: 80, maxDepth: 6, textLength: 240, maxChildren: 24 } as const;

export const DESIGN_SPEC_SCHEMA_HINT = `{
  "states": {
    "default": { "type": "stack", "gap": 16, "padding": 24, "children": [
      { "type": "heading", "level": 1, "text": "Screen title" },
      { "type": "text", "text": "Supporting copy" },
      { "type": "input", "props": { "label": "Email", "placeholder": "you@example.com" } },
      { "type": "button", "props": { "label": "Continue", "variant": "primary" } }
    ] },
    "empty": { "...": "same shape; include only states the screen has" }
  }
}
Allowed "type" values ONLY: stack, row, section (layout, with children), heading, text,
button {label, variant: primary|secondary|ghost}, input {label, placeholder},
card {title, body, variant: outlined|elevated|ghost}, badge {label, variant: default|success|outline},
alert {text, variant: info|success|warning|danger}. No HTML, no other components.`;

export class DesignSpecError extends Error {
	constructor(
		message: string,
		public issues: string[],
	) {
		super(message);
		this.name = 'DesignSpecError';
	}
}

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function clean(v: unknown, max: number = DESIGN_LIMITS.textLength): string {
	if (typeof v !== 'string' && typeof v !== 'number') return '';
	// Strip anything tag-like: designs are copy, never markup.
	return String(v).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

function clampNumber(v: unknown, min: number, max: number, fallback: number) {
	const n = typeof v === 'number' ? v : Number(v);
	return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.round(n))) : fallback;
}

/** Validate one state's tree, dropping disallowed nodes. Returns null when nothing usable remains. */
function repairTree(raw: unknown, path: string, repairs: string[], budget: { nodes: number }, depth = 0): DesignTreeNode | null {
	if (!isRecord(raw)) {
		repairs.push(`${path}: dropped (not an object)`);
		return null;
	}
	if (budget.nodes >= DESIGN_LIMITS.maxNodes) {
		repairs.push(`${path}: dropped (more than ${DESIGN_LIMITS.maxNodes} nodes)`);
		return null;
	}
	const type = clean(raw.type ?? raw.component, 40).toLowerCase();
	if ((DESIGN_LAYOUTS as readonly string[]).includes(type)) {
		if (depth >= DESIGN_LIMITS.maxDepth) {
			repairs.push(`${path}: dropped (nested deeper than ${DESIGN_LIMITS.maxDepth})`);
			return null;
		}
		budget.nodes++;
		const rawChildren = Array.isArray(raw.children) ? raw.children : [];
		const children = rawChildren
			.slice(0, DESIGN_LIMITS.maxChildren)
			.map((c, i) => repairTree(c, `${path}.children[${i}]`, repairs, budget, depth + 1))
			.filter((c): c is DesignTreeNode => c !== null);
		if (rawChildren.length > DESIGN_LIMITS.maxChildren) repairs.push(`${path}: kept the first ${DESIGN_LIMITS.maxChildren} children`);
		return {
			type: type as DesignLayout,
			gap: clampNumber(raw.gap, 0, 64, 16),
			padding: clampNumber(raw.padding, 0, 64, type === 'row' ? 0 : 16),
			children,
		};
	}
	if (type === 'heading' || type === 'text') {
		const text = clean(raw.text ?? (isRecord(raw.props) ? raw.props.text : undefined));
		if (!text) {
			repairs.push(`${path}: dropped (empty ${type})`);
			return null;
		}
		budget.nodes++;
		if (type === 'text') return { type, text };
		return { type, text, level: clampNumber(raw.level, 1, 3, 2) as 1 | 2 | 3 };
	}
	const def = (DESIGN_COMPONENTS as Record<string, { props: readonly string[]; variants: readonly string[] }>)[type];
	if (!def) {
		repairs.push(`${path}: dropped "${type || 'unknown'}" (not a Bareframe component)`);
		return null;
	}
	const rawProps = isRecord(raw.props) ? raw.props : raw;
	const props: Record<string, string> = {};
	for (const key of def.props) {
		const value = clean(rawProps[key], key === 'variant' ? 20 : DESIGN_LIMITS.textLength);
		if (!value) continue;
		if (key === 'variant' && !def.variants.includes(value)) {
			repairs.push(`${path}: unknown ${type} variant "${value}" dropped`);
			continue;
		}
		props[key] = value;
	}
	const textKey = def.props.find((k) => k !== 'variant' && k !== 'placeholder') ?? 'label';
	if (!props[textKey] && type !== 'input') {
		repairs.push(`${path}: dropped ${type} without ${textKey}`);
		return null;
	}
	budget.nodes++;
	return { type: type as DesignComponent, props };
}

export function repairDesignSpec(raw: unknown, wantedStates: DesignStateName[] = ['default']): { spec: DesignSpec; repairs: string[] } {
	const repairs: string[] = [];
	if (!isRecord(raw)) throw new DesignSpecError('Response is not a JSON object', ['root: expected an object']);
	const rawStates = isRecord(raw.states) ? raw.states : isRecord(raw.root) || raw.type ? { default: raw.root ?? raw } : null;
	if (!rawStates) throw new DesignSpecError('Response has no states', ['states: expected an object']);
	const states: Partial<Record<DesignStateName, DesignTreeNode>> = {};
	for (const name of ['default', 'empty', 'loading', 'error', 'success'] as DesignStateName[]) {
		if (rawStates[name] === undefined) continue;
		const budget = { nodes: 0 };
		const tree = repairTree(rawStates[name], `states.${name}`, repairs, budget);
		if (tree) states[name] = wrapRoot(tree);
	}
	for (const extra of Object.keys(rawStates)) {
		if (!['default', 'empty', 'loading', 'error', 'success'].includes(extra)) repairs.push(`states.${extra}: unknown state dropped`);
	}
	if (!states.default) throw new DesignSpecError('Response has no usable default state', ['states.default: missing or empty']);
	for (const name of wantedStates) {
		if (!states[name]) repairs.push(`states.${name}: not designed`);
	}
	return { spec: { states: states as DesignSpec['states'] }, repairs };
}

function wrapRoot(tree: DesignTreeNode): DesignTreeNode {
	return tree.type === 'stack' ? tree : { type: 'stack', gap: 16, padding: 16, children: [tree] };
}

function baseLayout(patch: Partial<LayoutModel> = {}): LayoutModel {
	return {
		mode: 'stack',
		gap: 0,
		padding: [0, 0, 0, 0],
		align: 'stretch',
		justify: 'start',
		widthMode: 'fill',
		heightMode: 'hug',
		...patch,
	};
}

const PROP_FOR_RENDER: Record<DesignComponent, (p: Record<string, string>) => { variantKey: string; props: Record<string, unknown> }> = {
	button: (p) => ({ variantKey: p.variant ?? 'primary', props: { children: p.label } }),
	input: (p) => ({ variantKey: 'default', props: { placeholder: p.placeholder ?? p.label, label: p.label } }),
	card: (p) => ({ variantKey: p.variant ?? 'outlined', props: { title: p.title, children: p.body ?? '' } }),
	badge: (p) => ({ variantKey: p.variant ?? 'default', props: { children: p.label } }),
	alert: (p) => ({ variantKey: p.variant ?? 'info', props: { children: p.text } }),
};

/** Replace a page's nodes with a design tree (the screen's default state). */
export function designToNodes(page: Page, tree: DesignTreeNode, newId: (prefix: string) => string): Page {
	const nodes: Record<string, DesignNode> = {};
	const build = (node: DesignTreeNode, parentId: string | null): string => {
		const id = parentId === null ? page.rootNodeId : newId('node');
		if (node.type === 'stack' || node.type === 'row' || node.type === 'section') {
			const pad = node.padding ?? 0;
			nodes[id] = {
				id,
				name: parentId === null ? 'Page root' : node.type,
				type: node.type,
				parentId,
				children: [],
				layout: baseLayout({
					mode: node.type === 'row' ? 'row' : 'stack',
					gap: node.gap ?? 16,
					padding: [pad, pad, pad, pad],
					align: node.type === 'row' ? 'center' : 'stretch',
				}),
			};
			nodes[id].children = node.children.map((c) => build(c, id));
			return id;
		}
		if (node.type === 'heading' || node.type === 'text') {
			nodes[id] = {
				id,
				name: node.type === 'heading' ? 'Heading' : 'Text',
				type: 'text',
				parentId,
				children: [],
				content: { text: node.text, textTag: node.type === 'heading' ? (`h${node.level}` as 'h1') : 'p' },
				layout: baseLayout(),
			};
			return id;
		}
		const comp = node as Extract<DesignTreeNode, { props: Record<string, string> }>;
		const { variantKey, props } = PROP_FOR_RENDER[comp.type](comp.props);
		nodes[id] = {
			id,
			name: comp.type,
			type: 'instance',
			parentId,
			children: [],
			instance: { definitionId: comp.type, variantKey, props },
			layout: baseLayout({ widthMode: comp.type === 'button' || comp.type === 'badge' ? 'hug' : 'fill' }),
		};
		return id;
	};
	build(tree, null);
	return { ...page, nodes };
}

export function countDesignNodes(tree: DesignTreeNode): number {
	return 'children' in tree ? 1 + tree.children.reduce((n, c) => n + countDesignNodes(c), 0) : 1;
}
