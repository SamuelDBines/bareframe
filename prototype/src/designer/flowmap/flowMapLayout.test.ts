import { describe, expect, it } from 'vitest';
import {
	FLOW_CARD_HEIGHT,
	FLOW_CARD_WIDTH,
	FLOW_LABEL_BOX_HEIGHT,
	layeredLayout,
	routeConnectors,
} from './flowMapLayout';

const edge = (id: string, from: string, to: string, label = id) => ({
	id,
	fromFrameId: from,
	toFrameId: to,
	label,
});

describe('layeredLayout', () => {
	it('places each screen one column after its furthest parent', () => {
		const pos = layeredLayout(['a', 'b', 'c', 'd'], [edge('1', 'a', 'b'), edge('2', 'b', 'c'), edge('3', 'a', 'c'), edge('4', 'c', 'd')]);
		const col = (id: string) => pos.get(id)!.x;
		expect(col('a')).toBeLessThan(col('b'));
		expect(col('b')).toBeLessThan(col('c'));
		expect(col('c')).toBeLessThan(col('d'));
	});

	it('stacks siblings in one column without overlap', () => {
		const pos = layeredLayout(['a', 'b', 'c'], [edge('1', 'a', 'b'), edge('2', 'a', 'c')]);
		const b = pos.get('b')!;
		const c = pos.get('c')!;
		expect(b.x).toBe(c.x);
		expect(Math.abs(b.y - c.y)).toBeGreaterThanOrEqual(FLOW_CARD_HEIGHT);
	});

	it('breaks cycles instead of looping forever', () => {
		const pos = layeredLayout(['a', 'b'], [edge('1', 'a', 'b'), edge('2', 'b', 'a')]);
		expect(pos.get('a')!.x).toBeLessThan(pos.get('b')!.x);
	});

	it('keeps disconnected screens on the map', () => {
		const pos = layeredLayout(['a', 'lonely'], []);
		expect(pos.size).toBe(2);
	});
});

describe('routeConnectors', () => {
	const boxes = (routed: ReturnType<typeof routeConnectors>) =>
		routed.map((r) => ({ x: r.label.x - r.label.w / 2, y: r.label.y - FLOW_LABEL_BOX_HEIGHT / 2, w: r.label.w, h: FLOW_LABEL_BOX_HEIGHT }));

	it('never stacks labels on top of each other', () => {
		const ids = ['a', 'b', 'c', 'd', 'e'];
		const edges = [
			edge('1', 'a', 'b', 'Sign up'),
			edge('2', 'a', 'c', 'Pricing'),
			edge('3', 'a', 'd', 'Log in'),
			edge('4', 'b', 'e', 'Continue'),
			edge('5', 'c', 'e', 'Buy'),
			edge('6', 'd', 'e', 'Open'),
		];
		const pos = layeredLayout(ids, edges);
		const frames = ids.map((id) => ({ id, ...pos.get(id)! }));
		const b = boxes(routeConnectors(frames, edges));
		for (let i = 0; i < b.length; i++) {
			for (let j = i + 1; j < b.length; j++) {
				const p = b[i]!;
				const q = b[j]!;
				const hit = p.x < q.x + q.w && p.x + p.w > q.x && p.y < q.y + q.h && p.y + p.h > q.y;
				expect(hit, `labels ${i} and ${j} overlap`).toBe(false);
			}
		}
	});

	it('keeps labels off screen cards', () => {
		const ids = ['a', 'b', 'c'];
		const edges = [edge('1', 'a', 'b'), edge('2', 'a', 'c'), edge('3', 'b', 'c')];
		const pos = layeredLayout(ids, edges);
		const frames = ids.map((id) => ({ id, ...pos.get(id)! }));
		for (const l of boxes(routeConnectors(frames, edges))) {
			for (const f of frames) {
				const hit = l.x < f.x + FLOW_CARD_WIDTH && l.x + l.w > f.x && l.y < f.y + FLOW_CARD_HEIGHT && l.y + l.h > f.y;
				expect(hit).toBe(false);
			}
		}
	});

	it('routes connectors that skip a column around the cards in between', () => {
		const ids = ['a', 'b', 'c'];
		const edges = [edge('1', 'a', 'b'), edge('2', 'b', 'c'), edge('3', 'a', 'c')];
		const frames = ids.map((id, i) => ({ id, x: i * 500, y: 0 }));
		const routed = routeConnectors(frames, edges);
		expect(routed.find((r) => r.id === '3')!.kind).toBe('long');
		expect(routed.find((r) => r.id === '1')!.kind).toBe('forward');
	});

	it('loops back edges underneath', () => {
		const frames = [
			{ id: 'a', x: 0, y: 0 },
			{ id: 'b', x: 500, y: 0 },
		];
		const routed = routeConnectors(frames, [edge('1', 'a', 'b'), edge('2', 'b', 'a', 'Try again')]);
		const back = routed.find((r) => r.id === '2')!;
		expect(back.kind).toBe('back');
		expect(back.label.y).toBeGreaterThan(FLOW_CARD_HEIGHT);
	});
});

describe('routeConnectors — vertical', () => {
	it('routes a screen added below its parent straight down, label between the cards', () => {
		const frames = [
			{ id: 'a', x: 0, y: 0 },
			{ id: 'b', x: 0, y: FLOW_CARD_HEIGHT + 96 },
		];
		const [r] = routeConnectors(frames, [edge('1', 'a', 'b', 'Edge case')]);
		expect(r!.kind).toBe('down');
		expect(r!.label.y).toBeGreaterThan(FLOW_CARD_HEIGHT);
		expect(r!.label.y).toBeLessThan(FLOW_CARD_HEIGHT + 96);
	});
});
