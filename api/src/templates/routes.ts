import { Hono } from 'hono';
import type pg from 'pg';
import { z } from 'zod';
import {
	TEMPLATE_CATEGORIES,
	TEMPLATE_LIBRARY_VERSION,
	defaultNewId,
	deviceDimensions,
	getDevicePreset,
	getFlowTemplate,
	getScreenTemplate,
	insertFlowTemplate,
	listFlowTemplates,
	listScreenTemplates,
	platformForDevices,
	buildScreenVariantTree,
	pickVariantId,
	designToNodes,
	type DesignDevice,
	type FlowDevice,
	type FlowTemplateId,
	type ScreenTemplateId,
} from '@bareframe/designer-core';
import type { Config } from '../config.js';
import { DEVICE_PRESET } from '../design-gen/routes.js';
import { assertProjectAccess, replaceProjectDocument, tokenHasScope } from '../db/projects.js';
import { attachConnectorButtonNodes } from '@bareframe/designer-core';
import { createProjectAuthMiddleware, getActor, handleProjectError } from '../projects/auth.js';
import { publishProjectUpdate } from '../projects/events.js';

export function createTemplatesRouter(pool: pg.Pool, _config: Config) {
	const auth = createProjectAuthMiddleware(pool, _config);
	const router = new Hono();
	router.use('/templates', auth);
	router.use('/projects/:projectId/templates/*', auth);

	router.get('/templates', async (c) => {
		const category = c.req.query('category');
		const screens = listScreenTemplates()
			.filter((s) => !category || s.category === category)
			.map((s) => ({
				libraryVersion: TEMPLATE_LIBRARY_VERSION,
				id: s.id,
				category: s.category,
				title: s.title,
				description: s.description,
				variants: s.variants.map((v) => ({ id: v.id, title: v.title, summary: v.summary, hotspots: [...v.hotspots] })),
			}));
		const flows = listFlowTemplates()
			.filter((f) => !category || f.category === category)
			.map((f) => ({
				libraryVersion: TEMPLATE_LIBRARY_VERSION,
				id: f.id,
				category: f.category,
				title: f.title,
				description: f.description,
				screenCount: f.spec.screens.length,
				connectionCount: f.spec.connections.length,
			}));
		return c.json({ libraryVersion: TEMPLATE_LIBRARY_VERSION, categories: TEMPLATE_CATEGORIES, screens, flows });
	});

	const insertSchema = z.discriminatedUnion('kind', [
		z.object({
			kind: z.literal('screen'),
			baseVersion: z.number().int().nonnegative(),
			screenTemplateId: z.string(),
			variantId: z.string().optional(),
			device: z.enum(['phone', 'tablet', 'desktop']).default('phone'),
			pageId: z.string().optional(),
			name: z.string().optional(),
		}),
		z.object({
			kind: z.literal('flow'),
			baseVersion: z.number().int().nonnegative(),
			flowTemplateId: z.string(),
			devices: z.array(z.enum(['mobile', 'tablet', 'desktop'])).min(1).optional(),
			merge: z.boolean().optional(),
		}),
	]);

	router.post('/projects/:projectId/templates/insert', async (c) => {
		const actor = getActor(c);
		if (actor.kind === 'token' && !tokenHasScope(actor.scopes, 'projects:write')) {
			return c.json({ error: 'Forbidden' }, 403);
		}
		try {
			const projectId = c.req.param('projectId');
			const project = await assertProjectAccess(pool, projectId, actor, 'projects:write');
			const parsed = insertSchema.safeParse(await c.req.json().catch(() => null));
			if (!parsed.success) {
				return c.json({ error: 'invalid_request', issues: parsed.error.issues.map((i) => i.message) }, 400);
			}
			const body = parsed.data;
			if (project.version !== body.baseVersion) {
				return c.json({ error: 'Version conflict', currentVersion: project.version }, 409);
			}
			let document = structuredClone(project.document);

			if (body.kind === 'flow') {
				const devices = (body.devices ?? ['mobile']) as FlowDevice[];
				const next = insertFlowTemplate(document, {
					flowTemplateId: body.flowTemplateId as FlowTemplateId,
					platform: platformForDevices(devices),
					platforms: devices,
					description: getFlowTemplate(body.flowTemplateId as FlowTemplateId).title,
					newId: defaultNewId,
					merge: body.merge ?? document.project.frames.filter((f) => !f.ghost).length > 0,
				});
				document = next.document;
				for (const frame of document.project.frames) {
					if (!frame.ghost) attachConnectorButtonNodes(document, frame.pageId, frame.id);
				}
			} else {
				const tpl = getScreenTemplate(body.screenTemplateId as ScreenTemplateId);
				const device = body.device as DesignDevice;
				let page = body.pageId ? document.project.pages.find((p) => p.id === body.pageId) : undefined;
				if (!page) {
					const rootId = defaultNewId('node');
					page = {
						id: defaultNewId('page'),
						name: body.name ?? tpl.title,
						routePath: '/',
						rootNodeId: rootId,
						nodes: {
							[rootId]: {
								id: rootId,
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
							},
						},
						brief: {
							key: tpl.id,
							purpose: tpl.description,
							keyContent: tpl.variants[0]!.hotspots.map(String),
							states: ['default'],
						},
					};
					document.project.pages.push(page);
					const preset = getDevicePreset(DEVICE_PRESET[device])!;
					const dim = deviceDimensions(preset);
					document.project.frames.push({
						id: defaultNewId('frame'),
						name: page.name,
						pageId: page.id,
						x: 96,
						y: 88,
						width: dim.width,
						height: dim.height,
						devicePresetId: preset.id,
						heightMode: 'fixed',
					});
				}
				const brief = page.brief ?? { key: page.id, purpose: '', keyContent: [], states: ['default'] };
				const variantId = pickVariantId(tpl.id, brief, brief.keyContent, body.variantId);
				const tree = buildScreenVariantTree(tpl.id, variantId, device);
				const idx = document.project.pages.findIndex((p) => p.id === page!.id);
				document.project.pages[idx] = {
					...designToNodes(page!, tree, defaultNewId),
					brief: {
						...(page!.brief ?? { key: tpl.id, purpose: tpl.description, keyContent: [], states: ['default'] as const }),
						templateId: tpl.id,
						templateVariant: variantId,
					},
				};
			}

			const version = await replaceProjectDocument(pool, projectId, actor.userId, document, body.baseVersion);
			publishProjectUpdate(projectId, version);
			return c.json({ version, document });
		} catch (err) {
			return handleProjectError(c, err);
		}
	});

	return router;
}