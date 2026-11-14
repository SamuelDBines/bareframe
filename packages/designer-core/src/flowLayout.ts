/** Visible card width on the flow map (world units). */
export const FLOW_CARD_WIDTH = 272;
export const FLOW_THUMB_HEIGHT = 392;
export const FLOW_LABEL_HEIGHT = 44;
export const FLOW_CARD_HEIGHT = FLOW_THUMB_HEIGHT + FLOW_LABEL_HEIGHT;
export const FLOW_CARD_GAP_X = 200;
export const FLOW_CARD_GAP_Y = 96;
export const FLOW_ORIGIN_X = 96;
export const FLOW_ORIGIN_Y = 88;

type Edge = { fromFrameId: string; toFrameId: string };

/**
 * Layered (left-to-right) layout: each screen goes in the column after the
 * furthest screen that links to it; rows inside a column follow the order of
 * their parents so connectors cross as little as possible. Cycles are broken
 * at the back edge, so "Try again" loops don't push screens rightwards.
 */
export function layeredFlowLayout(
	frameIds: string[],
	edges: Edge[],
	startX = FLOW_ORIGIN_X,
	startY = FLOW_ORIGIN_Y,
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
