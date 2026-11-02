import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { getComponent, listComponents, loadCatalog } from '../catalog.js';
import { createStudioApiClient, type StudioApiClient } from './api-client.js';

export const STUDIO_TOOL_NAMES = [
	'list_projects',
	'get_project',
	'create_canvas',
	'add_screen',
	'add_component',
	'add_connector',
	'add_annotation',
	'update_node',
	'delete_node',
	'import_screenshots',
	'get_upload_url',
	'create_flow_map',
	'screenshot_url',
	'render_frame',
	'list_recordings',
	'build_flow_from_recording',
	'review_project',
	'check_url',
] as const;

type ProjectSummary = { id: string; name: string; version: number; updatedAt?: string };

export function createBareframeStudioMcpServer(api: StudioApiClient): McpServer {
	const catalog = loadCatalog();
	const server = new McpServer(
		{
			name: 'bareframe-studio',
			version: catalog.bareframeVersion,
		},
		{ capabilities: { logging: {} } },
	);

	async function loadProject(projectId: string) {
		return api.request<{
			id: string;
			name: string;
			version: number;
			document: { project: { pages: { id: string; rootNodeId: string }[] } };
		}>(`/api/projects/${projectId}`);
	}

	server.registerTool(
		'list_projects',
		{
			description: 'List Bareframe Designer projects visible to the current project token or user session.',
			inputSchema: z.object({}),
		},
		async () => {
			const data = await api.request<{ projects: ProjectSummary[] }>('/api/projects');
			return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
		},
	);

	server.registerTool(
		'get_project',
		{
			description: 'Fetch a project document and optimistic-concurrency version.',
			inputSchema: {
				projectId: z.string().describe('Project UUID'),
			},
		},
		async ({ projectId }) => {
			const data = await loadProject(projectId);
			return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
		},
	);

	server.registerTool(
		'create_canvas',
		{
			description: 'Add a canvas page with an initial device frame.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				name: z.string(),
				routePath: z.string().optional(),
				presetId: z.string().optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: {
						type: 'create_canvas',
						name: args.name,
						routePath: args.routePath,
						presetId: args.presetId,
					},
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'add_screen',
		{
			description: 'Add a named screen (device frame) to a page.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				name: z.string(),
				pageId: z.string().optional(),
				routePath: z.string().optional(),
				presetId: z.string().optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: {
						type: 'add_screen',
						name: args.name,
						pageId: args.pageId,
						routePath: args.routePath,
						presetId: args.presetId,
					},
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'add_component',
		{
			description: 'Insert a catalog component instance into the page tree.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				pageId: z.string(),
				parentNodeId: z.string(),
				slug: z.string(),
				variantKey: z.string().optional(),
				props: z.record(z.unknown()).optional(),
				index: z.number().int().optional(),
			},
		},
		async (args) => {
			if (!getComponent(catalog, args.slug)) {
				return {
					isError: true,
					content: [{ type: 'text', text: `Unknown component slug: ${args.slug}` }],
				};
			}
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: {
						type: 'add_component',
						pageId: args.pageId,
						parentNodeId: args.parentNodeId,
						slug: args.slug,
						variantKey: args.variantKey,
						props: args.props,
						index: args.index,
					},
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'add_connector',
		{
			description: 'Add a flow arrow between two frames.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				fromFrameId: z.string(),
				toFrameId: z.string(),
				label: z.string().optional(),
				trigger: z.string().optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: {
						type: 'add_connector',
						fromFrameId: args.fromFrameId,
						toFrameId: args.toFrameId,
						label: args.label,
						trigger: args.trigger,
					},
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'add_annotation',
		{
			description: 'Add a callout, arrow, box, or note anchored to a frame.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				frameId: z.string(),
				kind: z.enum(['callout', 'arrow', 'box', 'note']),
				target: z.union([
					z.object({ kind: z.literal('node'), nodeId: z.string() }),
					z.object({ kind: z.literal('rect'), x: z.number(), y: z.number(), w: z.number(), h: z.number() }),
				]),
				text: z.string(),
				index: z.number().int().optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: {
						type: 'add_annotation',
						frameId: args.frameId,
						kind: args.kind,
						target: args.target,
						text: args.text,
						index: args.index,
					},
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'update_node',
		{
			description: 'Patch layout, content, variant, or props on a node.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				pageId: z.string(),
				nodeId: z.string(),
				layout: z.record(z.unknown()).optional(),
				content: z.object({ text: z.string().optional() }).optional(),
				variantKey: z.string().optional(),
				props: z.record(z.unknown()).optional(),
				name: z.string().optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: {
						type: 'update_node',
						pageId: args.pageId,
						nodeId: args.nodeId,
						layout: args.layout,
						content: args.content,
						variantKey: args.variantKey,
						props: args.props,
						name: args.name,
					},
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'delete_node',
		{
			description: 'Remove a node and its subtree from a page.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				pageId: z.string(),
				nodeId: z.string(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/commands`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					command: { type: 'delete_node', pageId: args.pageId, nodeId: args.nodeId },
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'import_screenshots',
		{
			description:
				'Lay out uploaded screenshot assets as image frames and optional flow connectors. Upload images via get_upload_url first.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				shots: z.array(
					z.object({
						assetId: z.string(),
						title: z.string().optional(),
						url: z.string().optional(),
					}),
				),
				links: z
					.array(
						z.object({
							fromAssetId: z.string(),
							toAssetId: z.string(),
							label: z.string().optional(),
							trigger: z.string().optional(),
						}),
					)
					.optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/import-screenshots`, {
				method: 'POST',
				body: JSON.stringify({
					baseVersion: args.baseVersion,
					shots: args.shots,
					links: args.links ?? [],
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'get_upload_url',
		{
			description: 'Returns the authenticated asset upload endpoint for large binary payloads.',
			inputSchema: {
				projectId: z.string(),
				contentType: z.string().optional(),
				size: z.number().int().optional(),
			},
		},
		async (args) => {
			const result = await api.request(`/api/projects/${args.projectId}/upload-url`, {
				method: 'POST',
				body: JSON.stringify({
					contentType: args.contentType,
					size: args.size,
				}),
			});
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'create_flow_map',
		{
			description:
				'Crawl a URL (or route list), screenshot pages, build a flow canvas with connectors, and run a consistency audit.',
			inputSchema: {
				projectId: z.string(),
				baseVersion: z.number().int().positive(),
				url: z.string().optional(),
				routes: z.array(z.string()).optional(),
				viewports: z.array(z.enum(['mobile', 'desktop'])).optional(),
				maxPages: z.number().int().optional(),
			},
		},
		async (args) => {
			const created = await api.request<{ jobId: string; renderJobId: string }>(
				`/api/projects/${args.projectId}/flow-maps`,
				{
					method: 'POST',
					body: JSON.stringify({
						baseVersion: args.baseVersion,
						url: args.url,
						routes: args.routes,
						viewports: args.viewports,
						maxPages: args.maxPages,
					}),
				},
			);
			let status = 'queued';
			let result: unknown = null;
			for (let i = 0; i < 60; i++) {
				const job = await api.request<{ status: string; result: unknown }>(
					`/api/projects/${args.projectId}/flow-maps/${created.jobId}`,
				);
				status = job.status;
				result = job.result;
				if (status === 'completed' || status === 'failed') break;
				await new Promise((r) => setTimeout(r, 500));
			}
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ jobId: created.jobId, status, result }, null, 2),
					},
				],
			};
		},
	);

	server.registerTool(
		'screenshot_url',
		{
			description: 'Capture a live URL to PNG at a mobile or desktop viewport preset.',
			inputSchema: {
				projectId: z.string(),
				url: z.string(),
				viewport: z.enum(['mobile', 'desktop']).optional(),
			},
		},
		async (args) => {
			const { jobId } = await api.request<{ jobId: string }>(
				`/api/projects/${args.projectId}/render-jobs`,
				{
					method: 'POST',
					body: JSON.stringify({
						kind: 'screenshot_url',
						url: args.url,
						viewport: args.viewport ?? 'mobile',
					}),
				},
			);
			for (let i = 0; i < 40; i++) {
				const job = await api.request<{ status: string; result: unknown }>(
					`/api/projects/${args.projectId}/render-jobs/${jobId}`,
				);
				if (job.status === 'completed' || job.status === 'failed') {
					return { content: [{ type: 'text', text: JSON.stringify(job, null, 2) }] };
				}
				await new Promise((r) => setTimeout(r, 300));
			}
			return { isError: true, content: [{ type: 'text', text: 'Screenshot timed out' }] };
		},
	);

	server.registerTool(
		'render_frame',
		{
			description: 'Render a Designer frame to PNG, optionally including annotation overlays.',
			inputSchema: {
				projectId: z.string(),
				frameId: z.string(),
				withAnnotations: z.boolean().optional(),
			},
		},
		async (args) => {
			const { jobId } = await api.request<{ jobId: string }>(
				`/api/projects/${args.projectId}/render-jobs`,
				{
					method: 'POST',
					body: JSON.stringify({
						kind: 'render_frame',
						frameId: args.frameId,
						withAnnotations: args.withAnnotations ?? true,
					}),
				},
			);
			for (let i = 0; i < 40; i++) {
				const job = await api.request<{ status: string; result: unknown }>(
					`/api/projects/${args.projectId}/render-jobs/${jobId}`,
				);
				if (job.status === 'completed' || job.status === 'failed') {
					return { content: [{ type: 'text', text: JSON.stringify(job, null, 2) }] };
				}
				await new Promise((r) => setTimeout(r, 300));
			}
			return { isError: true, content: [{ type: 'text', text: 'Render timed out' }] };
		},
	);

	server.registerTool(
		'list_recordings',
		{
			description: 'List flow recordings uploaded for a project.',
			inputSchema: { projectId: z.string() },
		},
		async ({ projectId }) => {
			const data = await api.request(`/api/projects/${projectId}/recordings`);
			return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
		},
	);

	server.registerTool(
		'build_flow_from_recording',
		{
			description: 'Build a canvas journey from a completed recording.',
			inputSchema: {
				projectId: z.string(),
				recordingId: z.string(),
				baseVersion: z.number().int().positive(),
			},
		},
		async (args) => {
			const result = await api.request(
				`/api/projects/${args.projectId}/recordings/${args.recordingId}/build`,
				{
					method: 'POST',
					body: JSON.stringify({ baseVersion: args.baseVersion }),
				},
			);
			return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
		},
	);

	server.registerTool(
		'review_project',
		{
			description:
				'Run an AI UX review pass on a project canvas. Adds callouts and returns structured issues (requires Pro MCP access).',
			inputSchema: {
				projectId: z.string(),
				waitSeconds: z.number().int().min(1).max(120).optional().default(45),
			},
		},
		async ({ projectId, waitSeconds }) => {
			const started = await api.request<{ runId: string; status: string }>(
				`/api/projects/${projectId}/reviews`,
				{ method: 'POST' },
			);
			const deadline = Date.now() + waitSeconds * 1000;
			let last = started;
			while (Date.now() < deadline && last.status !== 'completed' && last.status !== 'failed') {
				await new Promise((r) => setTimeout(r, 800));
				last = await api.request<{ id: string; status: string; issues: unknown[]; summary: unknown }>(
					`/api/projects/${projectId}/reviews/${started.runId}`,
				);
			}
			return { content: [{ type: 'text', text: JSON.stringify(last, null, 2) }] };
		},
	);

	server.registerTool(
		'check_url',
		{
			description:
				'Public-style URL check: screenshot metrics and flow-map audit findings for a single page (uses studio API credentials).',
			inputSchema: { url: z.string().url() },
		},
		async ({ url }) => {
			const data = await api.request(`/api/public/check-url`, {
				method: 'POST',
				body: JSON.stringify({ url }),
			});
			return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
		},
	);

	// Expose catalog helper for tests
	void listComponents;

	return server;
}

export { createStudioApiClient };
