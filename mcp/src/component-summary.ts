import type { ComponentRecord, PropDef, PropsSummary } from './types.js';

const SKIP_PROPS = new Set(['className', 'style', 'id', 'ref', 'as', 'slot']);

const KEY_PROPS = new Set([
	'variant',
	'size',
	'disabled',
	'loading',
	'dismissible',
	'open',
	'defaultOpen',
	'visible',
	'defaultVisible',
	'label',
	'title',
	'name',
	'type',
	'placeholder',
	'options',
	'value',
	'defaultValue',
	'onChange',
	'onPress',
	'onClick',
]);

export function summarizeProps(props: PropDef[], variantNames: string[] = []): PropsSummary {
	const required: string[] = [];
	const optional: PropsSummary['optional'] = [];
	let variants = [...variantNames];

	for (const prop of props) {
		if (SKIP_PROPS.has(prop.name)) continue;
		const isRequired =
			!prop.default &&
			prop.type !== 'boolean' &&
			!prop.type.includes('undefined') &&
			!prop.type.includes('?') &&
			prop.name !== 'children';

		const entry = {
			name: prop.name,
			type: prop.type,
			...(prop.default ? { default: prop.default } : {}),
		};

		if (prop.name === 'variant' && prop.type.includes('|')) {
			const fromType = prop.type
				.replace(/"/g, '')
				.split('|')
				.map((s) => s.trim())
				.filter(Boolean);
			if (fromType.length > 0) variants = fromType;
		}

		if (KEY_PROPS.has(prop.name) || prop.name === 'children') {
			if (isRequired && prop.name !== 'children') required.push(prop.name);
			else optional.push(entry);
		}
	}

	// Cap optional list for compact MCP payloads
	const capped = optional.slice(0, 12);

	return {
		required,
		optional: capped,
		...(variants.length > 0 ? { variants } : {}),
	};
}

export function mapRegistryCategory(category: string): string {
	const map: Record<string, string> = {
		Feedback: 'feedback',
		Display: 'data-display',
		Actions: 'actions',
		Layout: 'layout',
		Forms: 'forms',
		Navigation: 'navigation',
		Data: 'data-display',
		Overlay: 'feedback',
	};
	return map[category] ?? 'misc';
}

export function mapRegistryStatus(status: string): ComponentRecord['stability'] {
	if (status === 'stable') return 'stable';
	if (status === 'beta') return 'beta';
	return 'experimental';
}

export function compactComponentListItem(
	component: ComponentRecord,
	detail: 'summary' | 'full',
) {
	const base = {
		slug: component.slug,
		description: component.description,
		category: component.category,
		stability: component.stability,
		reactExport: component.reactExport,
		propsSummary: component.propsSummary,
	};

	if (detail === 'summary') return base;

	return {
		...base,
		props: component.props,
		exampleCount: component.examples.length,
	};
}
