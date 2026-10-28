#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examplesRoot = path.join(root, 'prototype/src/docs/examples');

/** @type {Record<string, { importName: string; samples: { file: string; title: string; description: string; body: string }[] }>} */
const SPECS = {
	badge: {
		importName: 'Badge',
		samples: [
			{ file: 'status', title: 'Status label', description: 'Show deployment state beside a title.', body: `export default function Example() {\n  return <Badge variant="success">Live</Badge>;\n}` },
			{ file: 'count', title: 'Count', description: 'Compact numeric badge.', body: `export default function Example() {\n  return <Badge size="sm">12</Badge>;\n}` },
			{ file: 'outline', title: 'Outline', description: 'Subtle badge on dense UI.', body: `export default function Example() {\n  return <Badge variant="outline">Beta</Badge>;\n}` },
		],
	},
	button: {
		importName: 'Button',
		samples: [
			{ file: 'primary-action', title: 'Primary action', description: 'Main call to action on a form.', body: `export default function Example() {\n  return <Button variant="primary">Save changes</Button>;\n}` },
			{ file: 'destructive', title: 'Destructive', description: 'Irreversible actions.', body: `export default function Example() {\n  return <Button variant="destructive">Delete project</Button>;\n}` },
			{ file: 'loading', title: 'Loading', description: 'Prevent double submit while saving.', body: `export default function Example() {\n  return <Button loading>Saving…</Button>;\n}` },
		],
	},
};

const DEFAULT_IMPORTS = {
	card: 'Card',
	checkbox: 'Checkbox',
	switch: 'Switch',
	field: 'Field',
	input: 'Input',
	textarea: 'Textarea',
	select: 'Select',
	slider: 'Slider',
	'radio-group': 'RadioGroup',
	multiselect: 'MultiSelect',
	combobox: 'Combobox',
	modal: 'Modal',
	drawer: 'Drawer',
	tooltip: 'Tooltip',
	popover: 'Popover',
	'dropdown-menu': 'DropdownMenu',
	tabs: 'Tabs',
	breadcrumbs: 'Breadcrumbs',
	pagination: 'Pagination',
	accordion: 'Accordion',
	toast: 'Toast',
	progress: 'Progress',
	spinner: 'Spinner',
	skeleton: 'Skeleton',
	avatar: 'Avatar',
	table: 'Table',
	'empty-state': 'EmptyState',
	'stat-card': 'StatCard',
	calendar: 'Calendar',
	datepicker: 'DatePicker',
};

for (const [slug, importName] of Object.entries(DEFAULT_IMPORTS)) {
	if (SPECS[slug]) continue;
	const titleName = importName;
	SPECS[slug] = {
		importName,
		samples: [
			{
				file: 'basic',
				title: 'Basic usage',
				description: `Default ${titleName} with theme tokens.`,
				body: `import { ${importName} } from '@bareframe/react';\n\nexport default function Example() {\n  return <${importName} />;\n}`,
			},
			{
				file: 'in-form',
				title: 'In context',
				description: `Typical placement in an app surface.`,
				body: `import { ${importName} } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <div style={{ maxWidth: '20rem' }}>\n      <${importName} />\n    </div>\n  );\n}`,
			},
			{
				file: 'themed',
				title: 'Themed surface',
				description: 'Scoped inside a theme wrapper.',
				body: `import { ${importName} } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <div data-bf-theme="dark">\n      <${importName} />\n    </div>\n  );\n}`,
			},
		],
	};
}

// Richer samples for key components
Object.assign(SPECS, {
	card: {
		importName: 'Card',
		samples: [
			{ file: 'summary', title: 'Summary card', description: 'Grouped metrics with footer.', body: `import { Card } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Card title="Revenue" footer="Updated 5m ago">\n      $12,480 this week\n    </Card>\n  );\n}` },
			{ file: 'elevated', title: 'Elevated', description: 'Use elevation sparingly for focus.', body: `import { Card } from '@bareframe/react';\n\nexport default function Example() {\n  return <Card variant="elevated" title="Highlight">Featured content</Card>;\n}` },
			{ file: 'ghost', title: 'Ghost', description: 'Low chrome grouping.', body: `import { Card } from '@bareframe/react';\n\nexport default function Example() {\n  return <Card variant="ghost">Supporting details</Card>;\n}` },
		],
	},
	modal: {
		importName: 'Modal',
		samples: [
			{ file: 'confirm', title: 'Confirm dialog', description: 'Critical confirmation with actions.', body: `import { Button, Modal } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Modal\n      isOpen\n      title="Delete file?"\n      footer={\n        <>\n          <Button variant="ghost">Cancel</Button>\n          <Button variant="destructive">Delete</Button>\n        </>\n      }\n    >\n      This cannot be undone.\n    </Modal>\n  );\n}` },
			{ file: 'controlled', title: 'Controlled open', description: 'Drive visibility from React state.', body: `import { useState } from 'react';\nimport { Button, Modal } from '@bareframe/react';\n\nexport default function Example() {\n  const [open, setOpen] = useState(true);\n  return (\n    <>\n      <Button onPress={() => setOpen(true)}>Open</Button>\n      <Modal isOpen={open} onOpenChange={setOpen} title="Settings">\n        Modal content\n      </Modal>\n    </>\n  );\n}` },
			{ file: 'form', title: 'Form in modal', description: 'Short forms fit well in modals.', body: `import { Field, Modal } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Modal isOpen title="Invite teammate">\n      <Field label="Email" />\n    </Modal>\n  );\n}` },
		],
	},
	select: {
		importName: 'Select',
		samples: [
			{ file: 'basic', title: 'Pick one option', description: 'Keyboard navigable listbox.', body: `import { Select } from '@bareframe/react';\n\nconst options = [\n  { value: 'a', label: 'Design' },\n  { value: 'b', label: 'Engineering' },\n];\n\nexport default function Example() {\n  return <Select aria-label="Team" options={options} defaultSelectedKey="a" />;\n}` },
			{ file: 'controlled', title: 'Controlled value', description: 'Sync selection with app state.', body: `import { useState } from 'react';\nimport { Select } from '@bareframe/react';\n\nconst options = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }];\n\nexport default function Example() {\n  const [theme, setTheme] = useState('light');\n  return (\n    <Select\n      aria-label="Theme"\n      options={options}\n      selectedKey={theme}\n      onSelectionChange={(k) => setTheme(String(k))}\n    />\n  );\n}` },
			{ file: 'disabled-option', title: 'Disabled option', description: 'Mark unavailable entries.', body: `import { Select } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Select\n      aria-label="Plan"\n      options={[\n        { value: 'free', label: 'Free' },\n        { value: 'pro', label: 'Pro', disabled: true },\n      ]}\n    />\n  );\n}` },
		],
	},
	field: {
		importName: 'Field',
		samples: [
			{ file: 'basic', title: 'Labeled input', description: 'Visible label with hint text.', body: `import { Field } from '@bareframe/react';\n\nexport default function Example() {\n  return <Field label="Project name" hint="Shown on invoices." />;\n}` },
			{ file: 'in-form', title: 'Validation error', description: 'Surface an error message from the server.', body: `import { Field } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Field label="Email" errorMessage="That address is already registered." />\n  );\n}` },
			{ file: 'themed', title: 'Dark theme', description: 'Field inherits scoped theme tokens.', body: `import { Field } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <div data-bf-theme="dark">\n      <Field label="API key" />\n    </div>\n  );\n}` },
		],
	},
	combobox: {
		importName: 'Combobox',
		samples: [
			{ file: 'basic', title: 'Searchable list', description: 'Filter options with a visible label.', body: `import { Combobox } from '@bareframe/react';\n\nconst options = [\n  { value: 'figma', label: 'Figma' },\n  { value: 'sketch', label: 'Sketch' },\n];\n\nexport default function Example() {\n  return <Combobox label="Design tool" options={options} defaultValue="figma" />;\n}` },
			{ file: 'in-form', title: 'Controlled', description: 'Keep selection in React state.', body: `import { useState } from 'react';\nimport { Combobox } from '@bareframe/react';\n\nconst options = [{ value: 'us', label: 'United States' }, { value: 'ca', label: 'Canada' }];\n\nexport default function Example() {\n  const [country, setCountry] = useState('us');\n  return (\n    <Combobox\n      label="Country"\n      options={options}\n      value={country}\n      onChange={setCountry}\n    />\n  );\n}` },
			{ file: 'themed', title: 'Aria label only', description: 'Use aria-label when a visible label is not possible.', body: `import { Combobox } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Combobox\n      aria-label="Search repositories"\n      options={[{ value: 'bareframe', label: 'bareframe' }]}\n    />\n  );\n}` },
		],
	},
	multiselect: {
		importName: 'MultiSelect',
		samples: [
			{ file: 'basic', title: 'Tag picker', description: 'Add values with a labeled control.', body: `import { MultiSelect } from '@bareframe/react';\n\nconst options = [\n  { value: 'react', label: 'React' },\n  { value: 'vue', label: 'Vue' },\n];\n\nexport default function Example() {\n  return <MultiSelect label="Skills" options={options} defaultValue={['react']} />;\n}` },
			{ file: 'in-form', title: 'Controlled', description: 'Sync chip list with form state.', body: `import { useState } from 'react';\nimport { MultiSelect } from '@bareframe/react';\n\nconst options = [{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }];\n\nexport default function Example() {\n  const [tags, setTags] = useState<string[]>(['a']);\n  return <MultiSelect label="Tags" options={options} value={tags} onChange={setTags} />;\n}` },
			{ file: 'themed', title: 'Compact row', description: 'MultiSelect in a narrow column.', body: `import { MultiSelect } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <div style={{ maxWidth: '16rem' }}>\n      <MultiSelect aria-label="Labels" options={[{ value: 'bug', label: 'Bug' }]} />\n    </div>\n  );\n}` },
		],
	},
	tooltip: {
		importName: 'Tooltip',
		samples: [
			{ file: 'basic', title: 'Icon hint', description: 'Clarify an icon-only control.', body: `import { Tooltip } from '@bareframe/react';\n\nexport default function Example() {\n  return <Tooltip content="Copy link to clipboard">Share</Tooltip>;\n}` },
			{ file: 'in-form', title: 'Field help', description: 'Short guidance beside a label.', body: `import { Tooltip } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Tooltip content="Must match your billing country.">\n      Country\n    </Tooltip>\n  );\n}` },
			{ file: 'themed', title: 'Dark surface', description: 'Tooltip on a dark panel.', body: `import { Tooltip } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <div data-bf-theme="dark">\n      <Tooltip content="Experimental feature">Labs</Tooltip>\n    </div>\n  );\n}` },
		],
	},
	popover: {
		importName: 'Popover',
		samples: [
			{ file: 'basic', title: 'Extra actions', description: 'Popover anchored to a trigger.', body: `import { Popover } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Popover trigger="Filters">\n      <p>Refine results by status and owner.</p>\n    </Popover>\n  );\n}` },
			{ file: 'in-form', title: 'Inline help', description: 'Keep dense forms uncluttered.', body: `import { Popover } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <Popover trigger="What is this?">\n      <p>We use this to calculate prorated billing.</p>\n    </Popover>\n  );\n}` },
			{ file: 'themed', title: 'On dark UI', description: 'Popover inherits theme tokens.', body: `import { Popover } from '@bareframe/react';\n\nexport default function Example() {\n  return (\n    <div data-bf-theme="noir">\n      <Popover trigger="Details">More information here.</Popover>\n    </div>\n  );\n}` },
		],
	},
});

let written = 0;
for (const [slug, spec] of Object.entries(SPECS)) {
	const dir = path.join(examplesRoot, slug);
	mkdirSync(dir, { recursive: true });
	for (const sample of spec.samples) {
		const filePath = path.join(dir, `${sample.file}.example.tsx`);
		if (existsSync(filePath) && slug === 'alert') continue;
		const content = sample.body.includes('import ')
			? `${sample.body}\n`
			: `import { ${spec.importName} } from '@bareframe/react';\n\n${sample.body}\n`;
		writeFileSync(filePath, content);
		written++;
	}
}

writeFileSync(
	path.join(root, 'prototype/src/components/library/doc-example-spec.json'),
	JSON.stringify(SPECS, null, 2),
);
console.log(`Wrote ${written} example files and doc-example-spec.json`);
