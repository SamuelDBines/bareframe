import type { ReactNode } from 'react';

export type ComponentStatus = 'stable' | 'beta' | 'coming';

export type PropDoc = {
	name: string;
	type: string;
	default?: string;
	description: string;
};

export type PreviewInteractionState =
	| 'default'
	| 'hover'
	| 'focus'
	| 'disabled'
	| 'loading'
	| 'dismiss';

export type ControlKind = 'select' | 'text' | 'boolean' | 'number' | 'textarea' | 'interaction';

export type PropControl = {
	prop: string;
	label: string;
	kind: ControlKind;
	options?: string[];
	min?: number;
	max?: number;
	step?: number;
};

export type ComponentExample = {
	title: string;
	description?: string;
	props: Record<string, unknown>;
};

export type A11yDoc = {
	summary: string;
	keyboard?: string[];
	roles?: string[];
};

export type ComponentRegistryEntry = {
	slug: string;
	name: string;
	description: string;
	category: string;
	status: ComponentStatus;
	variants: string[];
	props: PropDoc[];
	defaultProps: Record<string, unknown>;
	controls: PropControl[];
	render: (props: Record<string, unknown>, previewState: PreviewInteractionState) => ReactNode;
	examples: ComponentExample[];
	a11y: A11yDoc;
	importName?: string;
};

export type ComponentDoc = {
	slug: string;
	name: string;
	description: string;
	category: string;
	status: ComponentStatus;
	variants: string[];
	props: PropDoc[];
};
