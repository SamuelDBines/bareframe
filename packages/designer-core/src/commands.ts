import { z } from 'zod';
import { deviceDimensions, getDevicePreset } from './devicePresets.js';
import { autoPlaceFrame, layoutFramesInFlowRow } from './placement.js';
import type { DesignerProject, ProjectDocument } from './types.js';

const layoutPatchSchema = z
	.object({
		mode: z.enum(['free', 'stack', 'row', 'column', 'grid']).optional(),
		gap: z.number().optional(),
		padding: z.tuple([z.number(), z.number(), z.number(), z.number()]).optional(),
		align: z.enum(['start', 'center', 'end', 'stretch']).optional(),
		justify: z.enum(['start', 'center', 'end', 'space-between']).optional(),
		widthMode: z.enum(['fixed', 'fill', 'hug', 'percent']).optional(),
		heightMode: z.enum(['fixed', 'fill', 'hug', 'percent']).optional(),
		width: z.number().optional(),
		height: z.number().optional(),
		minWidth: z.number().optional(),
		maxWidth: z.number().optional(),
	})
	.strict();

export const projectCommandSchema = z.discriminatedUnion('type', [
	z.object({
		type: z.literal('add_frame'),
		pageId: z.string().optional(),
		presetId: z.string().optional(),
		name: z.string().optional(),
		x: z.number().optional(),
		y: z.number().optional(),
		themeId: z.string().nullable().optional(),
	}),
	z.object({
		type: z.literal('add_screen'),
		pageId: z.string().optional(),
		name: z.string(),
		routePath: z.string().optional(),
		presetId: z.string().optional(),
	}),
	z.object({
		type: z.literal('create_canvas'),
		name: z.string(),
		routePath: z.string().optional(),
		presetId: z.string().optional(),
	}),
	z.object({
		type: z.literal('add_component'),
		pageId: z.string(),
		parentNodeId: z.string(),
		slug: z.string(),
		variantKey: z.string().optional(),
		props: z.record(z.unknown()).optional(),
		index: z.number().int().nonnegative().optional(),
	}),
	z.object({
		type: z.literal('add_image_node'),
		pageId: z.string(),
		parentNodeId: z.string(),
		assetId: z.string(),
		name: z.string().optional(),
		alt: z.string().optional(),
	}),
	z.object({
		type: z.literal('add_connector'),
		fromFrameId: z.string(),
		toFrameId: z.string(),
		label: z.string().optional(),
		trigger: z.string().optional(),
	}),
	z.object({
		type: z.literal('add_annotation'),
		frameId: z.string(),
		kind: z.enum(['callout', 'arrow', 'box', 'note']),
		target: z.union([
			z.object({ kind: z.literal('node'), nodeId: z.string() }),
			z.object({ kind: z.literal('rect'), x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
		]),
		text: z.string(),
		index: z.number().int().optional(),
	}),
	z.object({
		type: z.literal('update_node'),
		pageId: z.string(),
		nodeId: z.string(),
		layout: layoutPatchSchema.optional(),
		content: z.object({ text: z.string().optional() }).optional(),
		variantKey: z.string().optional(),
		props: z.record(z.unknown()).optional(),
		name: z.string().optional(),
	}),
	z.object({
		type: z.literal('delete_node'),
		pageId: z.string(),
		nodeId: z.string(),
	}),
]);

export type ProjectCommand = z.infer<typeof projectCommandSchema>;

export type CommandContext = {
	isValidComponentSlug: (slug: string) => boolean;
	newId: (prefix: string) => string;
};

export type CommandResult = {
	document: ProjectDocument;
	effects: Record<string, unknown>;
};

export class CommandError extends Error {
	constructor(
		message: string,
		public code: string,
	) {
		super(message);
		this.name = 'CommandError';
	}
}

export function parseProjectCommand(input: unknown): ProjectCommand {
	return projectCommandSchema.parse(input);
}

export function createEmptyProjectDocument(
	id: string,
	name: string,
	themeId = 'light',
	ctx: Pick<CommandContext, 'newId'>,
): ProjectDocument {
	const pageId = ctx.newId('page');
	const rootId = ctx.newId('node');
	const baseLayout = {
		mode: 'stack' as const,
		gap: 16,
		padding: [0, 0, 0, 0] as [number, number, number, number],
		align: 'stretch' as const,
		justify: 'start' as const,
		widthMode: 'fill' as const,
		heightMode: 'hug' as const,
	};
	return {
		schemaVersion: 1,
		project: {
			id,
			name,
			defaultThemeId: themeId,
			pages: [
				{
					id: pageId,
					name: 'Home',
					routePath: '/',
					rootNodeId: rootId,
					nodes: {
						[rootId]: {
							id: rootId,
							name: 'Page root',
							type: 'stack',
							parentId: null,
							children: [],
							layout: baseLayout,
						},
					},
				},
			],
			frames: [],
			trials: [],
			customTokenOverrides: {},
			canvas: { x: 0, y: 0, zoom: 1 },
			connectors: [],
			annotations: [],
		},
	};
}

function cloneDocument(doc: ProjectDocument): ProjectDocument {
	return JSON.parse(JSON.stringify(doc)) as ProjectDocument;
}

function findPage(project: DesignerProject, pageId: string) {
	const page = project.pages.find((p) => p.id === pageId);
	if (!page) throw new CommandError(`Unknown page: ${pageId}`, 'page_not_found');
	return page;
}

function removeNodeTree(page: { nodes: Record<string, import('./types.js').DesignNode> }, nodeId: string) {
	const node = page.nodes[nodeId];
	if (!node) return;
	for (const childId of [...node.children]) {
		removeNodeTree(page, childId);
	}
	if (node.parentId) {
		const parent = page.nodes[node.parentId];
		if (parent) parent.children = parent.children.filter((id) => id !== nodeId);
	}
	delete page.nodes[nodeId];
}

export function applyProjectCommand(
	document: ProjectDocument,
	command: ProjectCommand,
	ctx: CommandContext,
): CommandResult {
	const parsed = projectCommandSchema.parse(command);
	const doc = cloneDocument(document);
	const project = doc.project;
	const effects: Record<string, unknown> = {};

	switch (parsed.type) {
		case 'create_canvas': {
			const pageId = ctx.newId('page');
			const rootId = ctx.newId('node');
			const page = {
				id: pageId,
				name: parsed.name,
				routePath: parsed.routePath ?? `/${pageId.slice(-6)}`,
				rootNodeId: rootId,
				nodes: {
					[rootId]: {
						id: rootId,
						name: 'Page root',
						type: 'stack' as const,
						parentId: null,
						children: [] as string[],
						layout: {
							mode: 'stack' as const,
							gap: 16,
							padding: [0, 0, 0, 0] as [number, number, number, number],
							align: 'stretch' as const,
							justify: 'start' as const,
							widthMode: 'fill' as const,
							heightMode: 'hug' as const,
						},
					},
				},
			};
			project.pages.push(page);
			effects.pageId = pageId;
			effects.rootNodeId = rootId;

			const frameResult = applyProjectCommand(
				doc,
				{
					type: 'add_frame',
					pageId,
					presetId: parsed.presetId ?? 'iphone-15',
					name: parsed.name,
				},
				ctx,
			);
			return { document: frameResult.document, effects: { ...effects, ...frameResult.effects } };
		}
		case 'add_screen': {
			const pageId = parsed.pageId ?? project.pages[0]?.id;
			if (!pageId) throw new CommandError('Project has no pages', 'no_pages');
			const page = findPage(project, pageId);
			page.name = parsed.name;
			if (parsed.routePath) page.routePath = parsed.routePath;
			return applyProjectCommand(
				doc,
				{
					type: 'add_frame',
					pageId,
					presetId: parsed.presetId ?? 'iphone-15',
					name: parsed.name,
				},
				ctx,
			);
		}
		case 'add_frame': {
			const pageId = parsed.pageId ?? project.pages[0]?.id;
			if (!pageId) throw new CommandError('Project has no pages', 'no_pages');
			findPage(project, pageId);
			const preset = getDevicePreset(parsed.presetId ?? 'iphone-15');
			if (!preset) throw new CommandError(`Unknown device preset: ${parsed.presetId}`, 'invalid_preset');
			const dim = deviceDimensions(preset);
			const place =
				parsed.x != null && parsed.y != null
					? { x: parsed.x, y: parsed.y }
					: autoPlaceFrame(project.frames, dim.width, dim.height);
			const frameId = ctx.newId('frame');
			project.frames.push({
				id: frameId,
				name: parsed.name ?? 'New frame',
				pageId,
				x: place.x,
				y: place.y,
				width: dim.width,
				height: dim.height,
				devicePresetId: preset.id,
				heightMode: 'fixed',
				themeId: parsed.themeId ?? undefined,
			});
			effects.frameId = frameId;
			return { document: doc, effects };
		}
		case 'add_component': {
			const page = findPage(project, parsed.pageId);
			if (!ctx.isValidComponentSlug(parsed.slug)) {
				throw new CommandError(`Unknown component slug: ${parsed.slug}`, 'invalid_component');
			}
			const parent = page.nodes[parsed.parentNodeId];
			if (!parent) throw new CommandError(`Unknown parent node: ${parsed.parentNodeId}`, 'node_not_found');
			const id = ctx.newId('node');
			const node = {
				id,
				name: parsed.slug,
				type: 'instance' as const,
				parentId: parsed.parentNodeId,
				children: [] as string[],
				instance: {
					definitionId: parsed.slug,
				 variantKey: parsed.variantKey ?? 'primary',
				 props: parsed.props ?? { children: 'Label' },
				},
				layout: {
					mode: 'stack' as const,
					gap: 0,
					padding: [0, 0, 0, 0] as [number, number, number, number],
					align: 'start' as const,
					justify: 'start' as const,
					widthMode: 'hug' as const,
					heightMode: 'hug' as const,
				},
			};
			page.nodes[id] = node;
			const index = parsed.index ?? parent.children.length;
			parent.children.splice(index, 0, id);
			effects.nodeId = id;
		 return { document: doc, effects };
		}
		case 'add_image_node': {
			const page = findPage(project, parsed.pageId);
			const parent = page.nodes[parsed.parentNodeId];
			if (!parent) throw new CommandError(`Unknown parent node: ${parsed.parentNodeId}`, 'node_not_found');
			const id = ctx.newId('node');
			page.nodes[id] = {
				id,
				name: parsed.name ?? 'Image',
				type: 'image',
				parentId: parsed.parentNodeId,
				children: [],
				image: { assetId: parsed.assetId, alt: parsed.alt },
				layout: {
					mode: 'stack',
					gap: 0,
					padding: [0, 0, 0, 0],
					align: 'start',
					justify: 'start',
					widthMode: 'fill',
					heightMode: 'hug',
				},
			};
			parent.children.push(id);
			effects.nodeId = id;
			return { document: doc, effects };
		}
		case 'add_connector': {
			if (parsed.fromFrameId === parsed.toFrameId) {
				throw new CommandError('Connector endpoints must differ', 'invalid_connector');
			}
			const from = project.frames.find((f) => f.id === parsed.fromFrameId);
			const to = project.frames.find((f) => f.id === parsed.toFrameId);
			if (!from || !to) throw new CommandError('Unknown frame endpoint', 'frame_not_found');
			const id = ctx.newId('conn');
			project.connectors.push({
				id,
				fromFrameId: parsed.fromFrameId,
				toFrameId: parsed.toFrameId,
				label: parsed.label,
				trigger: parsed.trigger,
			});
			effects.connectorId = id;
			return { document: doc, effects };
		}
		case 'add_annotation': {
			const frame = project.frames.find((f) => f.id === parsed.frameId);
			if (!frame) throw new CommandError(`Unknown frame: ${parsed.frameId}`, 'frame_not_found');
			const id = ctx.newId('anno');
			project.annotations.push({
				id,
				frameId: parsed.frameId,
				kind: parsed.kind,
				target: parsed.target,
				text: parsed.text,
				index: parsed.index,
			});
			effects.annotationId = id;
			return { document: doc, effects };
		}
		case 'update_node': {
			const page = findPage(project, parsed.pageId);
			const node = page.nodes[parsed.nodeId];
			if (!node) throw new CommandError(`Unknown node: ${parsed.nodeId}`, 'node_not_found');
			if (parsed.name) node.name = parsed.name;
			if (parsed.layout) node.layout = { ...node.layout, ...parsed.layout };
			if (parsed.content?.text != null) {
				node.content = { ...node.content, text: parsed.content.text };
			}
			if (parsed.variantKey && node.instance) node.instance.variantKey = parsed.variantKey;
			if (parsed.props && node.instance) {
				node.instance.props = { ...node.instance.props, ...parsed.props };
			}
			effects.nodeId = node.id;
			return { document: doc, effects };
		}
		case 'delete_node': {
			const page = findPage(project, parsed.pageId);
			if (page.rootNodeId === parsed.nodeId) {
				throw new CommandError('Cannot delete page root node', 'root_protected');
			}
			if (!page.nodes[parsed.nodeId]) {
				throw new CommandError(`Unknown node: ${parsed.nodeId}`, 'node_not_found');
			}
			removeNodeTree(page, parsed.nodeId);
			effects.nodeId = parsed.nodeId;
			return { document: doc, effects };
		}
		default:
			throw new CommandError('Unsupported command', 'unsupported');
	}
}

export type ImportScreenshotShot = {
	assetId: string;
	title?: string;
	url?: string;
};

export type ImportScreenshotLink = {
	fromAssetId: string;
	toAssetId: string;
	label?: string;
	trigger?: string;
};

export function applyImportScreenshots(
	document: ProjectDocument,
	shots: ImportScreenshotShot[],
	links: ImportScreenshotLink[],
	ctx: CommandContext,
): CommandResult {
	let doc = document;
	const frameByAsset = new Map<string, string>();

	for (const shot of shots) {
		const pageId = doc.project.pages[0]?.id;
		if (!pageId) throw new CommandError('Project has no pages', 'no_pages');
		const page = findPage(doc.project, pageId);
		const frameRes = applyProjectCommand(
			doc,
			{
				type: 'add_frame',
				pageId,
				name: shot.title ?? shot.url ?? 'Screen',
				presetId: 'mobile',
			},
			ctx,
		);
		doc = frameRes.document;
		const frameId = frameRes.effects.frameId as string;
		frameByAsset.set(shot.assetId, frameId);
		const imageRes = applyProjectCommand(
			doc,
			{
				type: 'add_image_node',
				pageId,
				parentNodeId: page.rootNodeId,
				assetId: shot.assetId,
				name: shot.title ?? 'Screenshot',
			},
			ctx,
		);
		doc = imageRes.document;
	}

	const newFrames = shots
		.map((s) => frameByAsset.get(s.assetId))
		.filter(Boolean)
		.map((id) => doc.project.frames.find((f) => f.id === id)!);
	layoutFramesInFlowRow(newFrames);

	for (const link of links) {
		const from = frameByAsset.get(link.fromAssetId);
		const to = frameByAsset.get(link.toAssetId);
		if (!from || !to) continue;
		const res = applyProjectCommand(
			doc,
			{
				type: 'add_connector',
				fromFrameId: from,
				toFrameId: to,
				label: link.label,
				trigger: link.trigger,
			},
			ctx,
		);
		doc = res.document;
	}

	return { document: doc, effects: { frameIds: [...frameByAsset.values()] } };
}
