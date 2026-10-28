import type { ComponentType } from 'react';

const modules = import.meta.glob('../../docs/examples/**/*.example.tsx', {
	eager: true,
	import: 'default',
});

const sources = import.meta.glob('../../docs/examples/**/*.example.tsx', {
	eager: true,
	query: '?raw',
	import: 'default',
});

export type LoadedDocExample = {
	title: string;
	description?: string;
	Component: ComponentType;
	source: string;
};

export function loadDocExamples(
	slug: string,
	defs: { title: string; description?: string; file: string }[],
): LoadedDocExample[] {
	return defs.map((def) => {
		const path = `../../docs/examples/${slug}/${def.file}.example.tsx`;
		const Component = modules[path] as ComponentType | undefined;
		const source = sources[path] as string | undefined;
		if (!Component || !source) {
			throw new Error(`Missing doc example module: ${path}`);
		}
		return {
			title: def.title,
			description: def.description,
			Component,
			source,
		};
	});
}
