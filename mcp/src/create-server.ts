import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import {
	getComponent,
	getDesignTokens,
	getTheme,
	listComponents,
	listThemes,
	loadCatalog,
	searchDocs,
	usageSnippet,
} from './catalog.js';
import { compactComponentListItem } from './component-summary.js';
import { scaffoldScreen } from './scaffold-screen.js';

export function createBareframeMcpServer(): McpServer {
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
				'List Bareframe components with stability, one-line description, category, and compact props summaries. Use detail=full only when you need full prop tables.',
			inputSchema: {
				category: z.string().optional().describe('Optional category filter (forms, actions, …)'),
				stability: z
					.enum(['stable', 'beta', 'experimental'])
					.optional()
					.describe('Optional stability filter'),
				detail: z
					.enum(['summary', 'full'])
					.optional()
					.default('summary')
					.describe('summary (default) keeps payloads small; full adds prop tables'),
			},
		},
		async ({ category, stability, detail }) => {
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
								components: items.map((c) => compactComponentListItem(c, detail)),
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
			description:
				'Props, real docs .example.tsx sources, and usage for one component slug.',
			inputSchema: {
				slug: z.string().describe('Component slug, e.g. button or date-picker'),
			},
		},
		async ({ slug }) => {
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
								slug: component.slug,
								description: component.description,
								category: component.category,
								stability: component.stability,
								reactExport: component.reactExport,
								propsSummary: component.propsSummary,
								props: component.props,
								examples: component.examples,
								suggestedUsage: usageSnippet(component),
								docsUrl: `https://bareframe.org/#/components/${component.slug}`,
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
		'get_design_tokens',
		{
			description:
				'Structured design tokens for a Bareframe theme (colors, spacing, typography, radii, shadows) sourced from themes/*.css. Defaults to the light theme.',
			inputSchema: {
				themeId: z
					.string()
					.optional()
					.describe('Theme id from list_themes (default: catalog default, usually light)'),
				includeCssVariables: z
					.boolean()
					.optional()
					.default(false)
					.describe('When true, include raw --bf-theme-* maps alongside grouped tokens'),
			},
		},
		async ({ themeId, includeCssVariables }) => {
			const payload = getDesignTokens(catalog, themeId, includeCssVariables);
			if (!payload) {
				return {
					isError: true,
					content: [
						{
							type: 'text',
							text: `Unknown theme id: ${themeId ?? catalog.defaultThemeId}`,
						},
					],
				};
			}
			return {
				content: [{ type: 'text', text: JSON.stringify(payload, null, 2) }],
			};
		},
	);

	server.registerTool(
		'scaffold_screen',
		{
			description:
				'Generate a type-safe @bareframe/react page layout (TSX) from a screen intent and/or component slugs. Uses real exports and theme CSS imports.',
			inputSchema: {
				intent: z
					.string()
					.optional()
					.describe('Short description of the screen, e.g. "delivery dashboard" or "login form"'),
				components: z
					.array(z.string())
					.optional()
					.describe('Component slugs with @bareframe/react exports (see list_components)'),
				themeId: z.string().optional().describe('Theme id (default light)'),
				title: z.string().optional().describe('Page heading shown in the scaffold'),
			},
		},
		async ({ intent, components, themeId, title }) => {
			try {
				const result = scaffoldScreen(catalog, { intent, components, themeId, title });
				return {
					content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
				};
			} catch (err) {
				const message = err instanceof Error ? err.message : String(err);
				return {
					isError: true,
					content: [{ type: 'text', text: message }],
				};
			}
		},
	);

	server.registerTool(
		'export_tokens',
		{
			description:
				'Legacy flat token export (tokens.json names or per-theme --bf-theme-* map). Prefer get_design_tokens for structured color/spacing/typography.',
			inputSchema: {
				themeId: z
					.string()
					.optional()
					.describe('When set, return resolved values for one theme instead of token names only'),
			},
		},
		async ({ themeId }) => {
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

	server.registerTool(
		'search_docs',
		{
			description: 'Search Bareframe docs pages (markdown guides and component reference text).',
			inputSchema: {
				query: z.string().min(1).describe('Search phrase'),
				limit: z.number().int().min(1).max(25).optional().default(10),
			},
		},
		async ({ query, limit }) => {
			const hits = searchDocs(catalog, query, limit);
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(
							{
								query,
								count: hits.length,
								results: hits.map((p) => ({
									id: p.id,
									title: p.title,
									path: p.path,
									url: p.url,
									excerpt: p.body.slice(0, 400),
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
		'get_install_steps',
		{
			description: 'Install and CSS import steps for @bareframe/react from the published README.',
			inputSchema: z.object({}),
		},
		async () => {
			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify(catalog.installSteps, null, 2),
					},
				],
			};
		},
	);

	server.registerTool(
		'get_migration_guide',
		{
			description:
				'Full “Migrating to @bareframe/react” guide for apps moving from @repkit/components or repkit-components.',
			inputSchema: {
				format: z.enum(['markdown', 'json']).optional().default('markdown'),
			},
		},
		async ({ format }) => {
			if (format === 'json') {
				return {
					content: [
						{
							type: 'text',
							text: JSON.stringify(
								{
									title: 'Migrating to @bareframe/react',
									markdown: catalog.migrationGuideMarkdown,
									repkitTokenAliases: catalog.repkitTokenAliases,
								},
								null,
								2,
							),
						},
					],
				};
			}
			return {
				content: [{ type: 'text', text: catalog.migrationGuideMarkdown }],
			};
		},
	);

	return server;
}

export const TOOL_NAMES = [
	'list_components',
	'get_component',
	'list_themes',
	'get_design_tokens',
	'scaffold_screen',
	'export_tokens',
	'search_docs',
	'get_install_steps',
	'get_migration_guide',
] as const;
