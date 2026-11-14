import { describe, expect, it } from 'vitest';
import { createEmptyProjectDocument, designToNodes, DesignSpecError, repairDesignSpec } from '../src/index.js';

let n = 0;
const newId = (p: string) => `${p}-${++n}`;

describe('repairDesignSpec', () => {
	it('keeps allowed components and states', () => {
		const { spec, repairs } = repairDesignSpec(
			{
				states: {
					default: {
						type: 'stack',
						children: [
							{ type: 'heading', level: 1, text: 'Sign in' },
							{ type: 'input', props: { label: 'Email', placeholder: 'you@example.com' } },
							{ type: 'button', props: { label: 'Continue', variant: 'primary' } },
						],
					},
					error: { type: 'alert', props: { text: 'Wrong password', variant: 'danger' } },
				},
			},
			['default', 'error', 'loading'],
		);
		expect(spec.states.default.type).toBe('stack');
		expect(spec.states.error?.type).toBe('stack');
		expect(repairs).toEqual(['states.loading: not designed']);
	});

	it('drops raw HTML, invented components and bad variants', () => {
		const { spec, repairs } = repairDesignSpec({
			states: {
				default: {
					type: 'stack',
					children: [
						{ type: 'div', children: [] },
						{ type: 'Carousel', props: { label: 'x' } },
						{ type: 'text', text: '<script>alert(1)</script>Hello <b>there</b>' },
						{ type: 'button', props: { label: 'Go', variant: 'neon' } },
						{ type: 'button', props: {} },
					],
				},
				hover: { type: 'text', text: 'nope' },
			},
		});
		const root = spec.states.default as { children: unknown[] };
		expect(root.children).toEqual([
			{ type: 'text', text: 'alert(1)Hello there' },
			{ type: 'button', props: { label: 'Go' } },
		]);
		const all = repairs.join('\n');
		expect(all).toMatch(/"div" \(not a Bareframe component\)/);
		expect(all).toMatch(/"carousel" \(not a Bareframe component\)/);
		expect(all).toMatch(/variant "neon"/);
		expect(all).toMatch(/states.hover: unknown state/);
	});

	it('rejects output without a usable default state', () => {
		expect(() => repairDesignSpec('x')).toThrow(DesignSpecError);
		expect(() => repairDesignSpec({ states: { default: { type: 'iframe' } } })).toThrow(DesignSpecError);
	});
});

describe('designToNodes', () => {
	it('writes the tree into the page, reusing the root node id', () => {
		const doc = createEmptyProjectDocument('p', 'P', 'light', { newId });
		const page = doc.project.pages[0]!;
		const { spec } = repairDesignSpec({
			states: { default: { type: 'stack', children: [{ type: 'heading', level: 2, text: 'Hi' }, { type: 'button', props: { label: 'Go' } }] } },
		});
		const next = designToNodes(page, spec.states.default, newId);
		const root = next.nodes[page.rootNodeId]!;
		expect(root.children).toHaveLength(2);
		const [heading, button] = root.children.map((id) => next.nodes[id]!);
		expect(heading).toMatchObject({ type: 'text', content: { text: 'Hi', textTag: 'h2' } });
		expect(button).toMatchObject({ type: 'instance', instance: { definitionId: 'button', variantKey: 'primary', props: { children: 'Go' } } });
	});
});
