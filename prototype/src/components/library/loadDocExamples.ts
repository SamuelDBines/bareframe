import type { ComponentType } from 'react';

const componentModules = import.meta.glob('../../docs/examples/**/*.example.tsx');
const sourceModules = import.meta.glob('../../docs/examples/**/*.example.tsx', {
	query: '?raw',
	import: 'default',
});

export type LoadedDocExample = {
	title: string;
	description?: string;
	Component: ComponentType;
	source: string;
};

export async function loadDocExamples(
	slug: string,
	defs: { title: string; description?: string; file: string }[],
): Promise<LoadedDocExample[]> {
	return Promise.all(
		defs.map(async (def) => {
			const path = `../../docs/examples/${slug}/${def.file}.example.tsx`;
			const loadComponent = componentModules[path];
			const loadSource = sourceModules[path];
			if (!loadComponent || !loadSource) {
				throw new Error(`Missing doc example module: ${path}`);
			}
			const [mod, source] = await Promise.all([loadComponent(), loadSource()]);
			const Component = (mod as { default: ComponentType }).default;
			return {
				title: def.title,
				description: def.description,
				Component,
				source: source as string,
			};
		}),
	);
}
