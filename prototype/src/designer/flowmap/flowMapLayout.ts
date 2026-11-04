import type { DesignerProject } from '../types';

/** Visible card width on the flow map (world units). */
export const FLOW_CARD_WIDTH = 272;
export const FLOW_THUMB_HEIGHT = 392;
export const FLOW_LABEL_HEIGHT = 44;
export const FLOW_CARD_HEIGHT = FLOW_THUMB_HEIGHT + FLOW_LABEL_HEIGHT;
export const FLOW_CARD_GAP_X = 200;
export const FLOW_CARD_GAP_Y = 96;

/** Port spacing when several connectors leave or enter the same side of a card. */
const PORT_SPACING = 34;
/** Vertical distance between parallel long-edge channels. */
const CHANNEL_SPACING = 22;
const LABEL_H = 30;

export function cardPosition(frame: { x: number; y: number }) {
	return { left: frame.x, top: frame.y };
}

export function layoutFlowMapRow(
	frames: { x: number; y: number }[],
	startX = 96,
	startY = 88,
): void {
	let x = startX;
	for (const f of frames) {
		f.x = x;
		f.y = startY;
		x += FLOW_CARD_WIDTH + FLOW_CARD_GAP_X;
	}
}

type Edge = { fromFrameId: string; toFrameId: string };

/**
 * Layered (left-to-right) layout: each screen goes in the column after the
 * furthest screen that links to it; rows inside a column follow the order of
 * their parents so connectors cross as little as possible. Cycles are broken
 * at the back edge, so "Try again" loops don't push screens rightwards.
 */
export function layeredLayout(
	frameIds: string[],
	edges: Edge[],
	startX = 96,
	startY = 88,
): Map<string, { x: number; y: number }> {
	const ids = new Set(frameIds);
	const out = new Map<string, string[]>();
	for (const id of frameIds) out.set(id, []);
	for (const e of edges) {
		if (ids.has(e.fromFrameId) && ids.has(e.toFrameId) && e.fromFrameId !== e.toFrameId) {
			out.get(e.fromFrameId)!.push(e.toFrameId);
		}
	}

	// DFS from roots (in given order) to drop back edges and get a DAG.
	const state = new Map<string, 0 | 1 | 2>();
	const dag = new Map<string, string[]>(frameIds.map((id) => [id, []]));
	const visit = (id: string) => {
		state.set(id, 1);
		for (const to of out.get(id)!) {
			const s = state.get(to) ?? 0;
			if (s === 1) continue; // back edge
			dag.get(id)!.push(to);
			if (s === 0) visit(to);
		}
		state.set(id, 2);
	};
	const incoming = new Map<string, number>(frameIds.map((id) => [id, 0]));
	for (const e of edges) {
		if (ids.has(e.toFrameId) && e.fromFrameId !== e.toFrameId && ids.has(e.fromFrameId)) {
			incoming.set(e.toFrameId, (incoming.get(e.toFrameId) ?? 0) + 1);
		}
	}
	for (const id of frameIds) if ((incoming.get(id) ?? 0) === 0 && !state.get(id)) visit(id);
	for (const id of frameIds) if (!state.get(id)) visit(id);

	// Longest-path ranking over the DAG (Kahn order).
	const indeg = new Map<string, number>(frameIds.map((id) => [id, 0]));
	for (const tos of dag.values()) for (const to of tos) indeg.set(to, indeg.get(to)! + 1);
	const rank = new Map<string, number>(frameIds.map((id) => [id, 0]));
	const queue = frameIds.filter((id) => indeg.get(id) === 0);
	while (queue.length) {
		const id = queue.shift()!;
		for (const to of dag.get(id)!) {
			rank.set(to, Math.max(rank.get(to)!, rank.get(id)! + 1));
			indeg.set(to, indeg.get(to)! - 1);
			if (indeg.get(to) === 0) queue.push(to);
		}
	}

	const columns: string[][] = [];
	for (const id of frameIds) {
		const r = rank.get(id)!;
		(columns[r] ??= []).push(id);
	}

	// Barycenter ordering: sort each column by the mean row of its parents.
	const parents = new Map<string, string[]>(frameIds.map((id) => [id, []]));
	for (const [from, tos] of dag) for (const to of tos) parents.get(to)!.push(from);
	const rowOf = new Map<string, number>();
	columns.forEach((col) => col.forEach((id, i) => rowOf.set(id, i)));
	for (let pass = 0; pass < 2; pass++) {
		for (let c = 1; c < columns.length; c++) {
			const col = columns[c] ?? [];
			const score = (id: string) => {
				const ps = parents.get(id)!;
				if (ps.length === 0) return rowOf.get(id)!;
				return ps.reduce((sum, p) => sum + rowOf.get(p)!, 0) / ps.length;
			};
			col.sort((a, b) => score(a) - score(b));
			col.forEach((id, i) => rowOf.set(id, i));
		}
	}

	const maxRows = Math.max(1, ...columns.map((c) => c?.length ?? 0));
	const pitchY = FLOW_CARD_HEIGHT + FLOW_CARD_GAP_Y;
	const positions = new Map<string, { x: number; y: number }>();
	columns.forEach((col, c) => {
		if (!col) return;
		const offset = ((maxRows - col.length) * pitchY) / 2;
		col.forEach((id, i) => {
			positions.set(id, {
				x: startX + c * (FLOW_CARD_WIDTH + FLOW_CARD_GAP_X),
				y: startY + offset + i * pitchY,
			});
		});
	});
	return positions;
}

export function autoLayoutFlowMap(project: DesignerProject): { frameId: string; x: number; y: number }[] {
	const frames = project.frames.filter((f) => !f.ghost);
	const ordered = [...frames].sort((a, b) => a.x - b.x || a.y - b.y);
	const positions = layeredLayout(
		ordered.map((f) => f.id),
		project.connectors,
	);
	return ordered.map((f) => ({ frameId: f.id, ...positions.get(f.id)! }));
}

export function boundsForFlowMapFrames(
	frames: { x: number; y: number }[],
): { x: number; y: number; w: number; h: number } | null {
	if (frames.length === 0) return null;
	const xs = frames.map((f) => f.x);
	const ys = frames.map((f) => f.y);
	const minX = Math.min(...xs);
	const minY = Math.min(...ys);
	const maxX = Math.max(...xs.map((x) => x + FLOW_CARD_WIDTH));
	const maxY = Math.max(...ys.map((y) => y + FLOW_CARD_HEIGHT));
	return { x: minX - 64, y: minY - 64, w: maxX - minX + 128, h: maxY - minY + 128 };
}

export function connectorPath(
	from: { x: number; y: number },
	to: { x: number; y: number },
): string {
	const x1 = from.x + FLOW_CARD_WIDTH;
	const y1 = from.y + FLOW_THUMB_HEIGHT / 2;
	const x2 = to.x;
	const y2 = to.y + FLOW_THUMB_HEIGHT / 2;
	const dx = Math.max(48, (x2 - x1) * 0.45);
	const c1x = x1 + dx;
	const c2x = x2 - dx;
	return `M ${x1} ${y1} C ${c1x} ${y1}, ${c2x} ${y2}, ${x2} ${y2}`;
}

export function connectorMidpoint(
	from: { x: number; y: number },
	to: { x: number; y: number },
): { x: number; y: number } {
	const x1 = from.x + FLOW_CARD_WIDTH;
	const y1 = from.y + FLOW_THUMB_HEIGHT / 2;
	const x2 = to.x;
	const y2 = to.y + FLOW_THUMB_HEIGHT / 2;
	return { x: (x1 + x2) / 2, y: (y1 + y2) / 2 - 6 };
}

export type RoutedConnector = {
	id: string;
	d: string;
	label: { x: number; y: number; w: number; text: string };
	kind: 'forward' | 'long' | 'back' | 'down';
};

type Box = { x: number; y: number; w: number; h: number };

const overlaps = (a: Box, b: Box, pad = 6) =>
	a.x < b.x + b.w + pad && a.x + a.w + pad > b.x && a.y < b.y + b.h + pad && a.y + a.h + pad > b.y;

export function labelWidth(text: string) {
	return Math.min(220, Math.max(84, text.length * 7.4 + 30));
}

function fitLabel(full: string, maxW: number): { w: number; text: string } {
	let text = truncateLabel(full);
	if (labelWidth(text) <= maxW) return { w: labelWidth(text), text };
	const chars = Math.max(4, Math.floor((maxW - 30) / 7.4) - 1);
	text = `${full.slice(0, chars).trimEnd()}…`;
	return { w: Math.min(labelWidth(text), Math.max(84, maxW)), text };
}

export function truncateLabel(text: string) {
	return text.length > 28 ? `${text.slice(0, 26)}…` : text;
}

/**
 * Route every connector so lines and labels don't sit on top of each other:
 * - ports are spread along a card's side when several connectors share it;
 * - connectors that would pass behind other cards run in a channel above the map;
 * - back edges loop underneath;
 * - labels are nudged until they clear other labels and cards.
 */
export function routeConnectors(
	frames: { id: string; x: number; y: number }[],
	connectors: { id: string; fromFrameId: string; toFrameId: string; label?: string; trigger?: string }[],
): RoutedConnector[] {
	const byId = new Map(frames.map((f) => [f.id, f]));
	const valid = connectors.filter(
		(c) => byId.has(c.fromFrameId) && byId.has(c.toFrameId) && c.fromFrameId !== c.toFrameId,
	);
	const cards: Box[] = frames.map((f) => ({ x: f.x, y: f.y, w: FLOW_CARD_WIDTH, h: FLOW_CARD_HEIGHT }));
	const minY = Math.min(...frames.map((f) => f.y));
	const maxY = Math.max(...frames.map((f) => f.y + FLOW_CARD_HEIGHT));

	const blocked = (x1: number, x2: number, yA: number, yB: number, skip: Set<string>) =>
		frames.some((f) => {
			if (skip.has(f.id)) return false;
			const lo = Math.min(yA, yB) - 20;
			const hi = Math.max(yA, yB) + 20;
			return f.x + FLOW_CARD_WIDTH > x1 && f.x < x2 && f.y < hi && f.y + FLOW_THUMB_HEIGHT > lo;
		});

	const kinds = new Map<string, RoutedConnector['kind']>();
	for (const c of valid) {
		const a = byId.get(c.fromFrameId)!;
		const b = byId.get(c.toFrameId)!;
		if (Math.abs(b.x - a.x) < FLOW_CARD_WIDTH / 2 && b.y > a.y + FLOW_CARD_HEIGHT) kinds.set(c.id, 'down');
		else if (b.x <= a.x + FLOW_CARD_WIDTH / 2) kinds.set(c.id, 'back');
		else {
			const y1 = a.y + FLOW_THUMB_HEIGHT / 2;
			const y2 = b.y + FLOW_THUMB_HEIGHT / 2;
			const skip = new Set([a.id, b.id]);
			kinds.set(c.id, blocked(a.x + FLOW_CARD_WIDTH, b.x, y1, y2, skip) ? 'long' : 'forward');
		}
	}

	// Spread ports: outgoing on the right side, incoming on the left, sorted by the other end's y.
	const portY = new Map<string, { out: number; in: number }>();
	const spread = (frameId: string, list: typeof valid, side: 'out' | 'in') => {
		const f = byId.get(frameId)!;
		const sorted = [...list].sort((p, q) => {
			const op = byId.get(side === 'out' ? p.toFrameId : p.fromFrameId)!;
			const oq = byId.get(side === 'out' ? q.toFrameId : q.fromFrameId)!;
			return op.y - oq.y || op.x - oq.x;
		});
		const mid = f.y + FLOW_THUMB_HEIGHT / 2;
		sorted.forEach((c, i) => {
			const y = mid + (i - (sorted.length - 1) / 2) * PORT_SPACING;
			const cur = portY.get(c.id) ?? { out: mid, in: mid };
			cur[side] = y;
			portY.set(c.id, cur);
		});
	};
	for (const f of frames) {
		const sideways = (c: (typeof valid)[number]) => kinds.get(c.id) === 'forward' || kinds.get(c.id) === 'long';
		spread(f.id, valid.filter((c) => c.fromFrameId === f.id && sideways(c)), 'out');
		spread(f.id, valid.filter((c) => c.toFrameId === f.id && sideways(c)), 'in');
	}

	let longIndex = 0;
	let backIndex = 0;
	const routed: RoutedConnector[] = valid.map((c) => {
		const a = byId.get(c.fromFrameId)!;
		const b = byId.get(c.toFrameId)!;
		const kind = kinds.get(c.id)!;
		const text = truncateLabel(c.label ?? c.trigger ?? 'Next');
		const w = labelWidth(text);
		if (kind === 'down') {
			// Same column, straight down: bottom edge to top edge, label in the gap.
			const sx = a.x + FLOW_CARD_WIDTH / 2;
			const tx = b.x + FLOW_CARD_WIDTH / 2;
			const sy = a.y + FLOW_CARD_HEIGHT;
			const ty = b.y;
			const midY = (sy + ty) / 2;
			const d = `M ${sx} ${sy} C ${sx} ${midY}, ${tx} ${midY}, ${tx} ${ty - 4}`;
			return { id: c.id, d, kind, label: { x: (sx + tx) / 2, y: midY, w, text } };
		}
		if (kind === 'back') {
			const sx = a.x + FLOW_CARD_WIDTH / 2;
			const tx = b.x + FLOW_CARD_WIDTH / 2;
			const sy = a.y + FLOW_CARD_HEIGHT;
			const ty = b.y + FLOW_CARD_HEIGHT;
			const lane = maxY + 56 + backIndex++ * CHANNEL_SPACING * 2;
			const d = `M ${sx} ${sy} C ${sx} ${lane}, ${tx} ${lane}, ${tx} ${ty + 4}`;
			return { id: c.id, d, kind, label: { x: (sx + tx) / 2, y: lane - 8, w, text } };
		}
		const p = portY.get(c.id)!;
		const x1 = a.x + FLOW_CARD_WIDTH;
		const x2 = b.x;
		if (kind === 'long') {
			const ch = minY - 56 - longIndex++ * CHANNEL_SPACING;
			const r = Math.min(80, (x2 - x1) / 4);
			const d = `M ${x1} ${p.out} C ${x1 + r} ${p.out}, ${x1 + r} ${ch}, ${x1 + r * 2} ${ch} L ${x2 - r * 2} ${ch} C ${x2 - r} ${ch}, ${x2 - r} ${p.in}, ${x2} ${p.in}`;
			return { id: c.id, d, kind, label: { x: (x1 + x2) / 2, y: ch, w, text } };
		}
		const dx = Math.max(48, (x2 - x1) * 0.5);
		const d = `M ${x1} ${p.out} C ${x1 + dx} ${p.out}, ${x2 - dx} ${p.in}, ${x2} ${p.in}`;
		// Keep the label inside the gap between the two cards so it stays on its line.
		const fit = fitLabel(c.label ?? c.trigger ?? 'Next', x2 - x1 - 16);
		return { id: c.id, d, kind, label: { x: (x1 + x2) / 2, y: (p.out + p.in) / 2, ...fit } };
	});

	// Nudge labels apart (and off cards) — alternate down/up until clear.
	const placed: Box[] = [];
	for (const r of [...routed].sort((p, q) => p.label.y - q.label.y)) {
		const base = r.label.y;
		for (let i = 0; i < 24; i++) {
			const step = Math.ceil(i / 2) * (LABEL_H + 4) * (i % 2 === 1 ? 1 : -1);
			const box = { x: r.label.x - r.label.w / 2, y: base + step - LABEL_H / 2, w: r.label.w, h: LABEL_H };
			if (!placed.some((p) => overlaps(p, box)) && !cards.some((cBox) => overlaps(cBox, box, 2))) {
				r.label.y = base + step;
				break;
			}
		}
		placed.push({ x: r.label.x - r.label.w / 2, y: r.label.y - LABEL_H / 2, w: r.label.w, h: LABEL_H });
	}
	return routed;
}

export const FLOW_LABEL_BOX_HEIGHT = LABEL_H;
