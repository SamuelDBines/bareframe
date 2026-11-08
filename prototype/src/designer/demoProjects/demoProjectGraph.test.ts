import { describe, expect, it } from 'vitest';
import type { DesignerProject } from '../types';
import { buildDemoB2bWorkspaceProject } from './demoB2bWorkspaceProject';
import { buildDemoMarketplaceFulfilmentProject } from './demoMarketplaceFulfilmentProject';
import { buildDemoMedScheduleProject } from './demoMedScheduleProject';
function entryFrameIds(project: DesignerProject): string[] {
	if (project.prototypeEntryFrameId) return [project.prototypeEntryFrameId];
	const targeted = new Set(project.connectors.map((c) => c.toFrameId));
	return project.frames.filter((f) => !targeted.has(f.id)).map((f) => f.id);
}

export function assertDemoGraphIntegrity(project: DesignerProject, opts?: { minScreens?: number; maxScreens?: number }) {
	const min = opts?.minScreens ?? 15;
	const max = opts?.maxScreens ?? 25;
	expect(project.frames.length).toBeGreaterThanOrEqual(min);
	expect(project.frames.length).toBeLessThanOrEqual(max);

	const frameIds = new Set(project.frames.map((f) => f.id));
	for (const c of project.connectors) {
		expect(frameIds.has(c.fromFrameId), `missing from ${c.fromFrameId}`).toBe(true);
		expect(frameIds.has(c.toFrameId), `missing to ${c.toFrameId}`).toBe(true);
		expect(c.label?.length, `connector ${c.id} needs label for prototype`).toBeGreaterThan(0);
	}

	const entries = entryFrameIds(project);
	expect(entries.length).toBeGreaterThanOrEqual(1);

	const reachable = new Set<string>();
	const queue = [...entries];
	while (queue.length) {
		const id = queue.shift()!;
		if (reachable.has(id)) continue;
		reachable.add(id);
		for (const c of project.connectors) {
			if (c.fromFrameId === id) queue.push(c.toFrameId);
		}
	}
	expect(reachable.size).toBe(project.frames.length);

	const branching = project.frames.filter(
		(f) => project.connectors.filter((c) => c.fromFrameId === f.id).length >= 2,
	);
	expect(branching.length).toBeGreaterThanOrEqual(2);

	const terminals = project.frames.filter(
		(f) => !project.connectors.some((c) => c.fromFrameId === f.id),
	);
	expect(terminals.length).toBeGreaterThanOrEqual(1);

	for (const page of project.pages) {
		expect(page.routePath.startsWith('/')).toBe(true);
	}
}

describe('complex public demo graphs', () => {
	const builders = [
		{ name: 'B2B workspace', build: buildDemoB2bWorkspaceProject },
		{ name: 'marketplace fulfilment', build: buildDemoMarketplaceFulfilmentProject },
		{ name: 'MedSchedule', build: buildDemoMedScheduleProject },
	] as const;

	for (const { name, build } of builders) {
		it(`${name} has valid graph, branching, and prototype labels`, () => {
			const project = build();
			assertDemoGraphIntegrity(project);
			const start = entryFrameIds(project)[0];
			expect(start).toBeTruthy();
			const firstHop = project.connectors.filter((c) => c.fromFrameId === start);
			expect(firstHop.length).toBeGreaterThan(0);
		});
	}
});
