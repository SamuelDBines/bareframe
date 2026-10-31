export type PropDef = {
	name: string;
	type: string;
	default?: string;
	description: string;
};

export type ExampleSource = {
	id: string;
	filename: string;
	source: string;
};

export type ComponentRecord = {
	slug: string;
	category: string;
	stability: 'stable' | 'beta' | 'experimental';
	reactExport: string | null;
	props: PropDef[];
	examples: ExampleSource[];
};

export type ThemeRecord = {
	id: string;
	label: string;
	cssImport: string;
	variableCount: number;
	variables: Record<string, string>;
};

export type DocPage = {
	id: string;
	title: string;
	path: string;
	url: string;
	body: string;
};

export type InstallSteps = {
	npm: string;
	styles: string;
	localBeforePublish: string;
	peerDependencies: string;
	packageName: string;
};

export type Catalog = {
	bundledAt: string;
	bareframeVersion: string;
	manifest: { generatedAt: string; componentCount: number; components: string[] };
	tokens: { generatedAt: string; tokens: string[] };
	themes: ThemeRecord[];
	components: ComponentRecord[];
	docPages: DocPage[];
	installSteps: InstallSteps;
	migrationGuideMarkdown: string;
	repkitTokenAliases: Record<string, string>;
};
