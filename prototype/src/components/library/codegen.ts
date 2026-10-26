import type { ComponentRegistryEntry } from './types';

function formatPropValue(value: unknown): string {
	if (typeof value === 'string') {
		if (value.includes('\n')) {
			return `{\`${value.replace(/`/g, '\\`')}\`}`;
		}
		return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
	}
	if (typeof value === 'boolean') return value ? 'true' : 'false';
	if (typeof value === 'number') return String(value);
	if (value === null || value === undefined) return 'undefined';
	if (Array.isArray(value)) {
		return `[${value.map((v) => formatPropValue(v)).join(', ')}]`;
	}
	return JSON.stringify(value);
}

export function generateComponentSnippet(
	entry: ComponentRegistryEntry,
	props: Record<string, unknown>,
): string {
	const importName = entry.importName ?? entry.name;
	const propLines: string[] = [];
	for (const [key, value] of Object.entries(props)) {
		if (key === 'children' && typeof value === 'string') {
			continue;
		}
		if (value === undefined || value === entry.defaultProps[key]) continue;
		propLines.push(`      ${key}={${formatPropValue(value)}}`);
	}

	const childText =
		typeof props.children === 'string'
			? props.children
			: typeof entry.defaultProps.children === 'string'
				? entry.defaultProps.children
				: `${importName} content`;

	const open = propLines.length
		? `<${importName}\n${propLines.join('\n')}\n    >`
		: `<${importName}>`;

	return `import { ${importName} } from '@bareframe/react';

export function Example() {
  return (
    ${open}
      ${childText}
    </${importName}>
  );
}`;
}

export function registryToComponentDocs(
	entries: ComponentRegistryEntry[],
): import('./types').ComponentDoc[] {
	return entries.map((e) => ({
		slug: e.slug,
		name: e.name,
		description: e.description,
		category: e.category,
		status: e.status,
		variants: e.variants,
		props: e.props,
	}));
}
