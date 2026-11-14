import { describe, expect, it } from 'vitest';
import {
	applyFlowSpec,
	createEmptyProjectDocument,
	flowSpecFromDocument,
	FlowSpecError,
	isEmptyFlow,
	repairFlowSpec,
} from '../src/index.js';

let n = 0;
const newId = (prefix: string) => `${prefix}-${++n}`;

const good = {
	screens: [
		{ id: 'welcome', name: 'Welcome', purpose: 'Explain the app', keyContent: ['Hero', 'Get started'], states: ['default'] },
		{ id: 'sign-up', name: 'Sign up', purpose: 'Create an account', keyContent: ['Email', 'Password'], states: ['error', 'loading'] },
		{ id: 'home', name: 'Home', purpose: 'See today', keyContent: ['List'], states: ['empty'] },
	],
	connections: [
		{ from: 'welcome', to: 'sign-up', trigger: 'Get started' },
		{ from: 'sign-up', to: 'home', trigger: 'Create account' },
	],
};

describe('repairFlowSpec', () => {
	it('accepts valid output unchanged', () => {
		const { spec, repairs } = repairFlowSpec(good);
		expect(repairs).toEqual([]);
		expect(spec.screens.map((s) => s.id)).toEqual(['welcome', 'sign-up', 'home']);
		expect(spec.screens[1]!.states).toEqual(['default', 'loading', 'error']);
		expect(spec.connections).toHaveLength(2);
	});

	it('repairs ids, duplicates, states and bad links', () => {
		const { spec, repairs } = repairFlowSpec({
			screens: [
				{ name: 'Sign In' },
				{ id: 'Sign In', name: 'Sign in again' },
				{ id: 'list', name: 'List', states: ['no data', 'wobbly'], key_content: 'Rows' },
				'nonsense',
				{},
			],
			connections: [
				{ from: 'sign-in', to: 'list' },
				{ source: 'list', target: 'missing' },
				{ from: 'list', to: 'list' },
				{ from: 'sign-in', to: 'list' },
			],
		});
		expect(spec.screens.map((s) => s.id)).toEqual(['sign-in', 'sign-in-2', 'list']);
		expect(spec.screens[2]!.states).toEqual(['default', 'empty']);
		expect(spec.screens[2]!.keyContent).toEqual(['Rows']);
		expect(spec.connections).toEqual([{ from: 'sign-in', to: 'list', trigger: 'Next' }]);
		expect(repairs.join('\n')).toMatch(/duplicate id/);
		expect(repairs.join('\n')).toMatch(/unknown state "wobbly"/);
		expect(repairs.join('\n')).toMatch(/unknown screen "missing"/);
	});

	it('caps the number of screens', () => {
		const screens = Array.from({ length: 30 }, (_, i) => ({ id: `s${i}`, name: `S${i}` }));
		const { spec, repairs } = repairFlowSpec({ screens, connections: [] });
		expect(spec.screens).toHaveLength(24);
		expect(repairs.filter((r) => r.includes('more than 24'))).toHaveLength(6);
	});

	it('rejects output with no usable screens', () => {
		expect(() => repairFlowSpec('hello')).toThrow(FlowSpecError);
		expect(() => repairFlowSpec({ screens: 'x' })).toThrow(FlowSpecError);
		expect(() => repairFlowSpec({ screens: [{}, 1] })).toThrow(FlowSpecError);
	});
});

describe('applyFlowSpec', () => {
	it('replaces an empty project with a laid-out flow', () => {
		const empty = createEmptyProjectDocument('p1', 'Test', 'light', { newId });
		expect(isEmptyFlow(empty)).toBe(true);
		const { spec } = repairFlowSpec(good);
		const { document, screenFrameIds } = applyFlowSpec(empty, spec, { platform: 'tablet', description: 'A habit app', newId });
		const { project } = document;
		expect(project.pages.map((p) => p.name)).toEqual(['Welcome', 'Sign up', 'Home']);
		expect(project.frames.every((f) => f.devicePresetId === 'tablet')).toBe(true);
		expect(project.connectors.map((c) => c.label)).toEqual(['Get started', 'Create account']);
		const xs = ['welcome', 'sign-up', 'home'].map((id) => project.frames.find((f) => f.id === screenFrameIds[id])!.x);
		expect(xs[0]).toBeLessThan(xs[1]!);
		expect(xs[1]).toBeLessThan(xs[2]!);
		expect(project.productBrief).toMatchObject({ description: 'A habit app', platform: 'tablet' });
		expect(isEmptyFlow(document)).toBe(false);
	});

	it('keeps pages, designs and frames of screens that survive a refine', () => {
		const empty = createEmptyProjectDocument('p1', 'Test', 'light', { newId });
		const first = applyFlowSpec(empty, repairFlowSpec(good).spec, { platform: 'mobile', description: 'x', newId }).document;
		const home = first.project.pages.find((p) => p.brief?.key === 'home')!;
		home.nodes[home.rootNodeId]!.children.push('designed');
		const homeFrameId = first.project.frames.find((f) => f.pageId === home.id)!.id;
		first.project.annotations.push({ id: 'a1', frameId: homeFrameId, kind: 'note', target: { kind: 'rect', x: 0, y: 0, w: 1, h: 1 }, text: 'hi' });

		const current = flowSpecFromDocument(first);
		expect(current.screens.map((s) => s.id)).toEqual(['welcome', 'sign-up', 'home']);
		const refined = repairFlowSpec({
			screens: [...current.screens.filter((s) => s.id !== 'welcome'), { id: 'settings', name: 'Settings' }],
			connections: [
				{ from: 'sign-up', to: 'home', trigger: 'Create account' },
				{ from: 'home', to: 'settings', trigger: 'Settings' },
			],
		}).spec;
		const second = applyFlowSpec(first, refined, { platform: 'mobile', description: 'x', newId }).document;
		const keptHome = second.project.pages.find((p) => p.brief?.key === 'home')!;
		expect(keptHome.id).toBe(home.id);
		expect(keptHome.nodes[keptHome.rootNodeId]!.children).toContain('designed');
		expect(second.project.frames.find((f) => f.pageId === home.id)!.id).toBe(homeFrameId);
		expect(second.project.annotations.map((a) => a.id)).toEqual(['a1']);
		expect(second.project.pages.some((p) => p.brief?.key === 'welcome')).toBe(false);
		expect(second.project.connectors).toHaveLength(2);
	});
});
