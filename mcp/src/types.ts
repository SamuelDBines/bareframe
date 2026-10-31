export type PropDef = {
	name: string;
	type: string;
	default?: string;
	description: string;
};

export type ComponentRecord = {
	slug: string;
	category: string;
	stability: 'stable' | 'beta' | 'experimental';
	reactExport: string | null;
	props: PropDef[];
};

export type ThemeRecord = {
	id: string;
	label: string;
	cssImport: string;
	variableCount: number;
	variables: Record<string, string>;
};

export type Catalog = {
	bundledAt: string;
	bareframeVersion: string;
	manifest: { generatedAt: string; componentCount: number; components: string[] };
	tokens: { generatedAt: string; tokens: string[] };
	themes: ThemeRecord[];
	components: ComponentRecord[];
};

export type McpScope = 'components:read' | 'themes:read' | 'designer:write';

export type TokenRecord = {
	id: string;
	token: string;
	scopes: McpScope[];
};
