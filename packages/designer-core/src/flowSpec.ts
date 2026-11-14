import { layeredFlowLayout } from './flowLayout.js';
import { deviceDimensions, getDevicePreset } from './devicePresets.js';
import type { Connector, DesignNode, Frame, Page, ProjectDocument } from './types.js';

/**
 * "Describe your product" → flow map. The AI returns a FlowSpec (screens and the links between
 * them); `repairFlowSpec` turns whatever came back into a valid spec or rejects it, and
 * `applyFlowSpec` writes it into a project document as pages, frames and connectors.
 */

export const FLOW_PLATFORMS = ['mobile', 'tablet', 'desktop', 'all'] as const;
export type FlowPlatform = (typeof FLOW_PLATFORMS)[number];

/** Device preset used for flow-map frames; `all` maps screens on phone first. */
export const FLOW_PLATFORM_PRESET: Record<FlowPlatform, string> = {
	mobile: 'mobile',
	tablet: 'tablet',
	desktop: 'desktop-1440',
	all: 'mobile',
};

export const SCREEN_STATES = ['default', 'empty', 'loading', 'error', 'success'] as const;
export type ScreenState = (typeof SCREEN_STATES)[number];

export type FlowScreen = {
	id: string;
	name: string;
	purpose: string;
	keyContent: string[];
	states: ScreenState[];
};

export type FlowConnection = { from: string; to: string; trigger: string };

export type FlowSpec = { screens: FlowScreen[]; connections: FlowConnection[] };

export const FLOW_LIMITS = {
	maxScreens: 24,
	maxConnections: 60,
	nameLength: 60,
	purposeLength: 280,
	keyContentItems: 8,
	keyContentLength: 120,
	triggerLength: 40,
	descriptionLength: 4000,
	instructionLength: 1000,
} as const;

/** JSON shape shown to the model. */
export const FLOW_SPEC_SCHEMA_HINT = `{
  "screens": [
    {
      "id": "kebab-case-id",
      "name": "Short screen name",
      "purpose": "One sentence: what the user does here",
      "keyContent": ["main content or controls on the screen"],
      "states": ["default", "empty", "loading", "error", "success"]
    }
  ],
  "connections": [{ "from": "screen-id", "to": "screen-id", "trigger": "Button or action label" }]
}`;

export class FlowSpecError extends Error {
	constructor(
		message: string,
		public issues: string[],
	) {
		super(message);
		this.name = 'FlowSpecError';
	}
}

const STATE_ALIASES: Record<string, ScreenState> = {
	default: 'default',
	normal: 'default',
	populated: 'default',
	ideal: 'default',
	empty: 'empty',
	'no data': 'empty',
	'no results': 'empty',
	'zero state': 'empty',
	loading: 'loading',
	skeleton: 'loading',
	pending: 'loading',
	error: 'error',
	failure: 'error',
	failed: 'error',
	offline: 'error',
	success: 'success',
	done: 'success',
	confirmation: 'success',
	complete: 'success',
};

function isRecord(v: unknown): v is Record<string, unknown> {
	return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function text(v: unknown, max: number): string {
	if (typeof v !== 'string' && typeof v !== 'number') return '';
	return String(v).replace(/\s+/g, ' ').trim().slice(0, max);
}

export function slugifyScreenId(value: string): string {
	return (
		value
			.toLowerCase()
			.normalize('NFKD')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
			.slice(0, 40) || 'screen'
	);
}

/**
 * Validate model output, repairing what can be repaired (missing ids, duplicate ids, unknown
 * states, links to screens that don't exist, over-long text) and recording each repair.
 * Throws FlowSpecError when nothing usable is left.
 */
export function repairFlowSpec(raw: unknown): { spec: FlowSpec; repairs: string[] } {
	const repairs: string[] = [];
	if (!isRecord(raw)) throw new FlowSpecError('Response is not a JSON object', ['root: expected an object']);
	const rawScreens = raw.screens;
	if (!Array.isArray(rawScreens)) {
		throw new FlowSpecError('Response has no screens', ['screens: expected an array']);
	}

	const screens: FlowScreen[] = [];
	const idMap = new Map<string, string>();
	const used = new Set<string>();
	rawScreens.forEach((item, index) => {
		if (!isRecord(item)) {
			repairs.push(`screens[${index}]: dropped (not an object)`);
			return;
		}
		const name = text(item.name ?? item.title, FLOW_LIMITS.nameLength);
		const rawId = text(item.id ?? item.key, 80);
		if (!name && !rawId) {
			repairs.push(`screens[${index}]: dropped (no id or name)`);
			return;
		}
		if (screens.length >= FLOW_LIMITS.maxScreens) {
			repairs.push(`screens[${index}]: dropped (more than ${FLOW_LIMITS.maxScreens} screens)`);
			return;
		}
		let id = slugifyScreenId(rawId || name);
		if (rawId && id !== rawId) repairs.push(`screens[${index}]: id "${rawId}" normalised to "${id}"`);
		if (!rawId) repairs.push(`screens[${index}]: missing id, derived "${id}" from name`);
		if (used.has(id)) {
			let n = 2;
			while (used.has(`${id}-${n}`)) n++;
			repairs.push(`screens[${index}]: duplicate id "${id}" renamed to "${id}-${n}"`);
			id = `${id}-${n}`;
		}
		used.add(id);
		if (rawId && !idMap.has(rawId)) idMap.set(rawId, id);
		if (!idMap.has(id)) idMap.set(id, id);

		const rawContent = item.keyContent ?? item.key_content ?? item.content;
		const keyContent = (Array.isArray(rawContent) ? rawContent : typeof rawContent === 'string' ? [rawContent] : [])
			.map((c) => text(c, FLOW_LIMITS.keyContentLength))
			.filter(Boolean)
			.slice(0, FLOW_LIMITS.keyContentItems);

		const states = new Set<ScreenState>(['default']);
		const rawStates = Array.isArray(item.states) ? item.states : [];
		for (const s of rawStates) {
			const mapped = STATE_ALIASES[text(s, 40).toLowerCase()];
			if (mapped) states.add(mapped);
			else repairs.push(`screens[${index}]: unknown state "${text(s, 40)}" dropped`);
		}

		screens.push({
			id,
			name: name || id.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase()),
			purpose: text(item.purpose ?? item.description, FLOW_LIMITS.purposeLength),
			keyContent,
			states: SCREEN_STATES.filter((s) => states.has(s)),
		});
	});

	if (screens.length === 0) throw new FlowSpecError('Response has no usable screens', ['screens: empty']);

	const connections: FlowConnection[] = [];
	const seen = new Set<string>();
	const rawConnections = Array.isArray(raw.connections) ? raw.connections : Array.isArray(raw.links) ? raw.links : [];
	if (raw.connections !== undefined && !Array.isArray(raw.connections)) repairs.push('connections: not an array, ignored');
	rawConnections.forEach((item, index) => {
		if (!isRecord(item)) {
			repairs.push(`connections[${index}]: dropped (not an object)`);
			return;
		}
		const fromRaw = text(item.from ?? item.source, 80);
		const toRaw = text(item.to ?? item.target, 80);
		const from = idMap.get(fromRaw) ?? (used.has(slugifyScreenId(fromRaw)) ? slugifyScreenId(fromRaw) : undefined);
		const to = idMap.get(toRaw) ?? (used.has(slugifyScreenId(toRaw)) ? slugifyScreenId(toRaw) : undefined);
		if (!from || !to) {
			repairs.push(`connections[${index}]: dropped (unknown screen "${!from ? fromRaw : toRaw}")`);
			return;
		}
		if (from === to) {
			repairs.push(`connections[${index}]: dropped (links a screen to itself)`);
			return;
		}
		const trigger = text(item.trigger ?? item.label, FLOW_LIMITS.triggerLength) || 'Next';
		const key = `${from}>${to}>${trigger.toLowerCase()}`;
		if (seen.has(key)) {
			repairs.push(`connections[${index}]: dropped (duplicate)`);
			return;
		}
		if (connections.length >= FLOW_LIMITS.maxConnections) {
			repairs.push(`connections[${index}]: dropped (more than ${FLOW_LIMITS.maxConnections} links)`);
			return;
		}
		seen.add(key);
		connections.push({ from, to, trigger });
	});

	return { spec: { screens, connections }, repairs };
}

/** Stable key linking a page to a flow screen id (pages added by hand use their page id). */
export function screenKeyForPage(page: Page): string {
	return page.brief?.key ?? page.id;
}

/** The current flow, in FlowSpec terms, for refine prompts. */
export function flowSpecFromDocument(document: ProjectDocument): FlowSpec {
	const { project } = document;
	const frames = project.frames.filter((f) => !f.ghost);
	const pageByFrame = new Map(frames.map((f) => [f.id, project.pages.find((p) => p.id === f.pageId)]));
	const screens: FlowScreen[] = [];
	const seen = new Set<string>();
	for (const frame of [...frames].sort((a, b) => a.x - b.x || a.y - b.y)) {
		const page = pageByFrame.get(frame.id);
		if (!page) continue;
		const key = screenKeyForPage(page);
		if (seen.has(key)) continue;
		seen.add(key);
		screens.push({
			id: key,
			name: page.name || frame.name,
			purpose: page.brief?.purpose ?? '',
			keyContent: page.brief?.keyContent ?? [],
			states: page.brief?.states ?? ['default'],
		});
	}
	const keyOfFrame = (id: string) => {
		const page = pageByFrame.get(id);
		return page ? screenKeyForPage(page) : undefined;
	};
	const connections = project.connectors.flatMap((c) => {
		const from = keyOfFrame(c.fromFrameId);
		const to = keyOfFrame(c.toFrameId);
		return from && to && from !== to ? [{ from, to, trigger: c.label ?? c.trigger ?? 'Next' }] : [];
	});
	return { screens, connections };
}

/** No real screens yet: no frames, or only untouched starter pages without content or links. */
export function isEmptyFlow(document: ProjectDocument): boolean {
	const { project } = document;
	const frames = project.frames.filter((f) => !f.ghost);
	if (frames.length === 0) return true;
	if (project.connectors.length > 0 || frames.length > 1) return false;
	return project.pages.every((p) => (p.nodes[p.rootNodeId]?.children.length ?? 0) === 0);
}

function rootNode(id: string): DesignNode {
	return {
		id,
		name: 'Page root',
		type: 'stack',
		parentId: null,
		children: [],
		layout: {
			mode: 'stack',
			gap: 16,
			padding: [0, 0, 0, 0],
			align: 'stretch',
			justify: 'start',
			widthMode: 'fill',
			heightMode: 'hug',
		},
	};
}

export type ApplyFlowSpecOptions = {
	platform: FlowPlatform;
	description: string;
	newId: (prefix: string) => string;
	now?: () => Date;
};

/**
 * Replace the project's flow with `spec`. Screens whose id matches an existing page (by brief key
 * or page id) keep that page and its design nodes; everything not in the spec is removed, along
 * with annotations on removed frames. Frames are laid out with the flow-map layered layout.
 */
export function applyFlowSpec(
	document: ProjectDocument,
	spec: FlowSpec,
	options: ApplyFlowSpecOptions,
): { document: ProjectDocument; screenFrameIds: Record<string, string> } {
	const doc = JSON.parse(JSON.stringify(document)) as ProjectDocument;
	const project = doc.project;
	const presetId = FLOW_PLATFORM_PRESET[options.platform];
	const preset = getDevicePreset(presetId)!;
	const dim = deviceDimensions(preset);

	const existingByKey = new Map(project.pages.map((p) => [screenKeyForPage(p), p]));
	const pages: Page[] = [];
	const frames: Frame[] = [];
	const screenFrameIds: Record<string, string> = {};

	spec.screens.forEach((screen, index) => {
		const brief = {
			key: screen.id,
			purpose: screen.purpose,
			keyContent: screen.keyContent,
			states: screen.states,
		};
		let page = existingByKey.get(screen.id);
		if (page) {
			page.name = screen.name;
			page.brief = brief;
		} else {
			const rootId = options.newId('node');
			page = {
				id: options.newId('page'),
				name: screen.name,
				routePath: index === 0 ? '/' : `/${screen.id}`,
				rootNodeId: rootId,
				nodes: { [rootId]: rootNode(rootId) },
				brief,
			};
		}
		pages.push(page);
		const pageId = page.id;
		const existingFrame =
			project.frames.find((f) => !f.ghost && f.pageId === pageId && f.devicePresetId === presetId) ??
			project.frames.find((f) => !f.ghost && f.pageId === pageId);
		const frame: Frame = existingFrame
			? { ...existingFrame, name: screen.name }
			: {
					id: options.newId('frame'),
					name: screen.name,
					pageId,
					x: 0,
					y: 0,
					width: dim.width,
					height: dim.height,
					devicePresetId: preset.id,
					heightMode: 'fixed',
				};
		frames.push(frame);
		screenFrameIds[screen.id] = frame.id;
	});

	const connectors: Connector[] = spec.connections.map((c) => ({
		id: options.newId('conn'),
		fromFrameId: screenFrameIds[c.from]!,
		toFrameId: screenFrameIds[c.to]!,
		label: c.trigger,
		trigger: 'click',
	}));

	const positions = layeredFlowLayout(
		frames.map((f) => f.id),
		connectors,
	);
	for (const f of frames) Object.assign(f, positions.get(f.id));

	const frameIds = new Set(frames.map((f) => f.id));
	project.pages = pages;
	project.frames = frames;
	project.connectors = connectors;
	project.annotations = project.annotations.filter((a) => frameIds.has(a.frameId));
	project.trials = project.trials.filter((t) => pages.some((p) => p.id === t.pageId));
	if (project.prototypeEntryFrameId && !frameIds.has(project.prototypeEntryFrameId)) {
		project.prototypeEntryFrameId = null;
	}
	project.productBrief = {
		description: options.description,
		platform: options.platform,
		updatedAt: (options.now?.() ?? new Date()).toISOString(),
	};
	return { document: doc, screenFrameIds };
}
