import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import {
	getComponent,
	getTheme,
	listComponents,
	listThemes,
	loadCatalog,
	usageSnippet,
} from './catalog.js';
import type { McpScope } from './types.js';

export type ToolAuth = {
	scopes: McpScope[];
};

export class ScopeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ScopeError';
	}
}

function assertScope(auth: ToolAuth, scope: McpScope) {
	if (!auth.scopes.includes(scope)) {
		throw new ScopeError(`This tool requires the ${scope} scope`);
	}
}

export function createBareframeMcpServer(auth: ToolAuth): McpServer {
	const catalog = loadCatalog();
	const server = new McpServer(
		{
			name: 'bareframe',
			version: catalog.bareframeVersion,
		},
		{ capabilities: { logging: {} } },
	);

	server.registerTool(
		'list_components',
		{
			description:
				'Returns slugs, categories, and stability for Bareframe web components and @bareframe/react exports.',
			inputSchema: {
				category: z.string().optional().describe('Optional category filter (forms, actions, …)'),
				stability: z
					.enum(['stable', 'beta', 'experimental'])
					.optional()
					.describe('Optional stability filter'),
			},
		},
		async ({ category, stability }) => {
			assertScope(auth, 'components:read');
			let items = listComponents(catalog);
			if (category) items = items.filter((c) => c.category === category);
			if (stability) items = items.filter((c) => c.stability === stability);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								generatedAt: catalog.manifest.generatedAt,
								count: items.length,
								components: items.map(({ slug, category: cat, stability: stab, reactExport }) => ({
									slug,
									category: cat,
									stability: stab,
									reactExport,
								})),
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	server.registerTool(
		'get_component',
		{
			description: 'Props table, variants, and usage snippet for one component slug.',
			inputSchema: {
				slug: z.string().describe('Component slug, e.g. button or date-picker'),
			},
		},
		async ({ slug }) => {
			assertScope(auth, 'components:read');
			const component = getComponent(catalog, slug);
			if (!component) {
				return {
					isError: true,
					content: [{ type: 'text', text: `Unknown component slug: ${slug}` }],
				};
			}
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								...component,
								usage: usageSnippet(component),
								docsUrl: `https://bareframe.org/${slug}/`,
							},
							null,
							2,
						),
					},
				],
			};
		},
	);

	server.registerTool(
		'list_themes',
		{
			description: 'Theme ids and CSS variable bundles for Bareframe themes.',
			inputSchema: {
				includeVariables: z
					.boolean()
					.optional()
					.default(false)
					.describe('When true, include full --bf-theme-* maps (large payload)'),
			},
		},
		async ({ includeVariables }) => {
			assertScope(auth, 'themes:read');
			const themes = listThemes(catalog).map((theme) => ({
				id: theme.id,
				label: theme.label,
				cssImport: theme.cssImport,
				variableCount: theme.variableCount,
				...(includeVariables ? { variables: theme.variables } : {}),
			}));
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ count: themes.length, themes }, null, 2),
					},
				],
			};
		},
	);

	server.registerTool(
		'export_tokens',
		{
			description: 'JSON token manifest aligned with bareframe/tokens.json.',
			inputSchema: {
				themeId: z
					.string()
					.optional()
					.describe('When set, return resolved values for one theme instead of token names only'),
			},
		},
		async ({ themeId }) => {
			assertScope(auth, 'themes:read');
			if (themeId) {
				const theme = getTheme(catalog, themeId);
				if (!theme) {
					return {
						isError: true,
						content: [{ type: 'text', text: `Unknown theme id: ${themeId}` }],
					};
				}
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									themeId: theme.id,
									cssImport: theme.cssImport,
									variables: theme.variables,
								},
								null,
								2,
							),
						},
					],
				};
			}
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(catalog.tokens, null, 2),
					},
				],
			};
		},
	);

	return server;
}
