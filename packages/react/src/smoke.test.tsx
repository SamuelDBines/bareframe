import { render } from '@testing-library/react';
import { I18nProvider } from '@react-aria/i18n';
import type { ReactElement } from 'react';
import { describe, expect, it } from 'vitest';
import * as Bf from './index';

function mount(element: ReactElement) {
	return render(<I18nProvider locale="en-US">{element}</I18nProvider>);
}

const smokeCases: [string, ReactElement][] = [
	['Badge', <Bf.Badge>Beta</Bf.Badge>],
	['Card', <Bf.Card title="T">Body</Bf.Card>],
	['Checkbox', <Bf.Checkbox label="OK" />],
	['Switch', <Bf.Switch label="On" />],
	['Textarea', <Bf.Textarea aria-label="Notes" />],
	['Progress', <Bf.Progress value={20} />],
	['Spinner', <Bf.Spinner />],
	['Skeleton', <Bf.Skeleton lines={2} />],
	['Toast', <Bf.Toast>Hi</Bf.Toast>],
	['Tabs', <Bf.Tabs />],
	['Breadcrumbs', <Bf.Breadcrumbs />],
	['Pagination', <Bf.Pagination />],
	['Accordion', <Bf.Accordion />],
	['Table', <Bf.Table />],
	['EmptyState', <Bf.EmptyState />],
	['StatCard', <Bf.StatCard />],
	['Avatar', <Bf.Avatar name="Ada Lovelace" />],
	['Tooltip', <Bf.Tooltip content="Tip">Target</Bf.Tooltip>],
	['Drawer', <Bf.Drawer isOpen title="Panel">Body</Bf.Drawer>],
	['Modal', <Bf.Modal isOpen title="Title">Body</Bf.Modal>],
	['Calendar', <Bf.Calendar aria-label="Pick a date" />],
	['DatePicker', <Bf.DatePicker label="Date" />],
	['DropdownMenu', <Bf.DropdownMenu />],
	['Combobox', <Bf.Combobox options={[{ value: 'a', label: 'A' }]} />],
	['MultiSelect', <Bf.MultiSelect options={[{ value: 'a', label: 'A' }]} />],
	['NativeSelect', <Bf.NativeSelect options={[{ value: 'a', label: 'A' }]} aria-label="x" />],
	['RadioGroup', <Bf.RadioGroup />],
	['Slider', <Bf.Slider aria-label="Volume" defaultValue={50} />],
	['Select', <Bf.Select options={[{ value: 'a', label: 'A' }]} aria-label="Pick" />],
];

describe('component smoke renders', () => {
	it.each(smokeCases)('%s mounts', (_name, element) => {
		const { baseElement } = mount(element);
		expect(baseElement.innerHTML.length).toBeGreaterThan(0);
	});
});
