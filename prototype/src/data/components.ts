export type ComponentDoc = {
	slug: string;
	name: string;
	description: string;
	category: string;
	status: 'stable' | 'beta' | 'coming';
	variants: string[];
	props: { name: string; type: string; default?: string; description: string }[];
};

export const COMPONENT_LIBRARY: ComponentDoc[] = [
	{
		slug: 'alert',
		name: 'Alert',
		description: 'Inline feedback for success, warning, and error states.',
		category: 'Feedback',
		status: 'stable',
		variants: ['info', 'success', 'warning', 'error'],
		props: [
			{ name: 'variant', type: 'string', default: 'info', description: 'Visual tone' },
			{ name: 'title', type: 'string', description: 'Optional heading' },
			{ name: 'children', type: 'ReactNode', description: 'Alert body' },
		],
	},
	{
		slug: 'badge',
		name: 'Badge',
		description: 'Compact labels for counts and status.',
		category: 'Display',
		status: 'stable',
		variants: ['default', 'success', 'warning', 'outline'],
		props: [
			{ name: 'variant', type: 'string', default: 'default', description: 'Color style' },
			{ name: 'children', type: 'ReactNode', description: 'Badge text' },
		],
	},
	{
		slug: 'button',
		name: 'Button',
		description: 'Primary actions with multiple visual weights.',
		category: 'Actions',
		status: 'stable',
		variants: ['primary', 'secondary', 'ghost', 'destructive'],
		props: [
			{ name: 'variant', type: 'string', default: 'primary', description: 'Button style' },
			{ name: 'size', type: "'sm' | 'md' | 'lg'", default: 'md', description: 'Padding scale' },
			{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disable interaction' },
		],
	},
	{
		slug: 'card',
		name: 'Card',
		description: 'Grouped content with optional header and footer.',
		category: 'Layout',
		status: 'stable',
		variants: ['elevated', 'outlined', 'ghost'],
		props: [
			{ name: 'title', type: 'string', description: 'Card title' },
			{ name: 'children', type: 'ReactNode', description: 'Card body' },
		],
	},
	{
		slug: 'checkbox',
		name: 'Checkbox',
		description: 'Binary choice with accessible labeling.',
		category: 'Forms',
		status: 'stable',
		variants: ['default'],
		props: [
			{ name: 'checked', type: 'boolean', description: 'Controlled checked state' },
			{ name: 'label', type: 'string', description: 'Visible label' },
		],
	},
	{
		slug: 'drawer',
		name: 'Drawer',
		description: 'Slide-over panel for secondary workflows.',
		category: 'Overlays',
		status: 'stable',
		variants: ['left', 'right'],
		props: [
			{ name: 'open', type: 'boolean', description: 'Visibility' },
			{ name: 'side', type: "'left' | 'right'", default: 'right', description: 'Edge anchor' },
		],
	},
	{
		slug: 'field',
		name: 'Field',
		description: 'Label, hint, and error wrapper for form controls.',
		category: 'Forms',
		status: 'stable',
		variants: ['default'],
		props: [
			{ name: 'label', type: 'string', description: 'Field label' },
			{ name: 'error', type: 'string', description: 'Error message' },
		],
	},
	{
		slug: 'input',
		name: 'Input',
		description: 'Text input with sizes and validation states.',
		category: 'Forms',
		status: 'stable',
		variants: ['default', 'error'],
		props: [
			{ name: 'type', type: 'string', default: 'text', description: 'HTML input type' },
			{ name: 'placeholder', type: 'string', description: 'Placeholder text' },
		],
	},
	{
		slug: 'modal',
		name: 'Modal',
		description: 'Focused dialog overlay for critical tasks.',
		category: 'Overlays',
		status: 'stable',
		variants: ['default', 'fullscreen'],
		props: [
			{ name: 'open', type: 'boolean', description: 'Visibility' },
			{ name: 'onClose', type: '() => void', description: 'Dismiss handler' },
		],
	},
	{
		slug: 'multiselect',
		name: 'MultiSelect',
		description: 'Choose multiple options from a searchable list.',
		category: 'Forms',
		status: 'stable',
		variants: ['default'],
		props: [
			{ name: 'options', type: 'Option[]', description: 'Selectable items' },
			{ name: 'value', type: 'string[]', description: 'Selected values' },
		],
	},
	{
		slug: 'select',
		name: 'Select',
		description: 'Single choice dropdown with keyboard support.',
		category: 'Forms',
		status: 'stable',
		variants: ['default'],
		props: [
			{ name: 'options', type: 'Option[]', description: 'Selectable items' },
			{ name: 'value', type: 'string', description: 'Selected value' },
		],
	},
	{
		slug: 'tabs',
		name: 'Tabs',
		description: 'Switch between related views in one surface.',
		category: 'Navigation',
		status: 'stable',
		variants: ['line', 'pills'],
		props: [
			{ name: 'defaultValue', type: 'string', description: 'Initially active tab' },
			{ name: 'items', type: 'TabItem[]', description: 'Tab definitions' },
		],
	},
	{
		slug: 'toast',
		name: 'Toast',
		description: 'Transient notifications stacked at the edge.',
		category: 'Feedback',
		status: 'stable',
		variants: ['default', 'success', 'error'],
		props: [
			{ name: 'message', type: 'string', description: 'Toast content' },
			{ name: 'duration', type: 'number', default: '4000', description: 'Auto-dismiss ms' },
		],
	},
	{
		slug: 'calendar',
		name: 'Calendar',
		description: 'Date grid powered by React Aria primitives.',
		category: 'Date & time',
		status: 'coming',
		variants: ['single', 'range'],
		props: [
			{ name: 'value', type: 'Date', description: 'Selected date' },
			{ name: 'minValue', type: 'Date', description: 'Earliest selectable day' },
		],
	},
	{
		slug: 'datepicker',
		name: 'DatePicker',
		description: 'Input + popover calendar for date selection.',
		category: 'Date & time',
		status: 'coming',
		variants: ['default'],
		props: [
			{ name: 'value', type: 'Date', description: 'Selected date' },
			{ name: 'label', type: 'string', description: 'Field label' },
		],
	},
];

export function getComponent(slug: string): ComponentDoc | undefined {
	return COMPONENT_LIBRARY.find((c) => c.slug === slug);
}
