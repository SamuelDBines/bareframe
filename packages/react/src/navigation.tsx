import { forwardRef, useState } from 'react';
import {
	Button,
	Disclosure,
	DisclosureGroup,
	DisclosurePanel,
	Heading,
	Tab,
	TabList,
	TabPanel,
	Tabs as RACTabs,
} from 'react-aria-components';
import { cn } from './utils/cn';
import { Button as BfButton } from './Button/Button';

export const Tabs = forwardRef<
	HTMLDivElement,
	{
		variant?: 'line' | 'pills';
		defaultValue?: string;
		value?: string;
		onChange?: (value: string) => void;
		items?: { id: string; label: string; content?: React.ReactNode }[];
		className?: string;
	}
>(function Tabs(
	{
		variant = 'line',
		defaultValue = 'overview',
		value,
		onChange,
		items = [
			{ id: 'overview', label: 'Overview', content: 'Overview panel content.' },
			{ id: 'analytics', label: 'Analytics', content: 'Analytics panel content.' },
			{ id: 'settings', label: 'Settings', content: 'Settings panel content.' },
		],
		className,
	},
	ref,
) {
	const [internal, setInternal] = useState(defaultValue);
	const selectedKey = value ?? internal;
	return (
		<RACTabs
			ref={ref}
			selectedKey={selectedKey}
			defaultSelectedKey={defaultValue}
			onSelectionChange={(key) => {
				const id = String(key);
				if (value === undefined) setInternal(id);
				onChange?.(id);
			}}
			className={cn('bf-tabs', `bf-tabs--${variant}`, className)}
		>
			<TabList aria-label="Tabs" className="bf-tabs__list">
				{items.map((item) => (
					<Tab key={item.id} id={item.id} className="bf-tabs__tab">
						{item.label}
					</Tab>
				))}
			</TabList>
			{items.map((item) => (
				<TabPanel key={item.id} id={item.id} className="bf-tabs__panel">
					{item.content ?? `Content for ${item.id}`}
				</TabPanel>
			))}
		</RACTabs>
	);
});

export const Breadcrumbs = forwardRef<
	HTMLElement,
	{ items?: { href?: string; label: string }[]; className?: string }
>(function Breadcrumbs({ items, className }, ref) {
	const crumbs = items ?? [
		{ href: '/', label: 'Home' },
		{ href: '/components', label: 'Components' },
		{ label: 'Alert' },
	];
	return (
		<nav ref={ref} className={cn('bf-breadcrumbs', className)} aria-label="Breadcrumb">
			<ol>
				{crumbs.map((c, i) => (
					<li key={`${c.label}-${i}`}>
						{c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
					</li>
				))}
			</ol>
		</nav>
	);
});

export const Pagination = forwardRef<
	HTMLElement,
	{ page?: number; total?: number; onPageChange?: (page: number) => void; className?: string }
>(function Pagination({ page: pageProp = 1, total = 5, onPageChange, className }, ref) {
	const page = pageProp;
	return (
		<nav ref={ref} className={cn('bf-pagination', className)} aria-label="Pagination">
			<BfButton variant="secondary" size="sm" isDisabled={page <= 1} onPress={() => onPageChange?.(page - 1)}>
				Previous
			</BfButton>
			{Array.from({ length: total }, (_, i) => i + 1).map((n) => (
				<BfButton
					key={n}
					variant={n === page ? 'primary' : 'secondary'}
					size="sm"
					aria-current={n === page ? 'page' : undefined}
					onPress={() => onPageChange?.(n)}
				>
					{n}
				</BfButton>
			))}
			<BfButton variant="secondary" size="sm" isDisabled={page >= total} onPress={() => onPageChange?.(page + 1)}>
				Next
			</BfButton>
		</nav>
	);
});

export const Accordion = forwardRef<
	HTMLDivElement,
	{
		items?: { id: string; title: string; content: React.ReactNode }[];
		className?: string;
		defaultExpandedKeys?: Iterable<string>;
		expandedKeys?: Iterable<string>;
		onExpandedChange?: (keys: Set<string | number>) => void;
	}
>(function Accordion(
	{
		items,
		className,
		defaultExpandedKeys,
		expandedKeys: expandedKeysProp,
		onExpandedChange,
	},
	ref,
) {
	const data = items ?? [
		{ id: '1', title: 'What are design tokens?', content: 'Named variables for color, spacing, and typography.' },
		{ id: '2', title: 'How do themes work?', content: 'Themes override CSS custom properties on `[data-bf-theme]`.' },
	];
	const [internalKeys, setInternalKeys] = useState<Set<string>>(
		() => new Set(defaultExpandedKeys ?? (data[0]?.id ? [data[0].id] : [])),
	);
	const expandedKeys = expandedKeysProp ? new Set(expandedKeysProp) : internalKeys;
	const setExpandedKeys = (keys: Set<string | number>) => {
		const normalized = new Set(Array.from(keys, String));
		if (expandedKeysProp === undefined) setInternalKeys(normalized);
		onExpandedChange?.(normalized);
	};
	return (
		<DisclosureGroup
			ref={ref}
			className={cn('bf-accordion', className)}
			expandedKeys={expandedKeys}
			onExpandedChange={setExpandedKeys}
			allowsMultipleExpanded={false}
		>
			{data.map((item) => (
				<Disclosure key={item.id} id={item.id} className="bf-accordion__item">
					<Heading>
						<Button slot="trigger" className="bf-accordion__trigger">
							{item.title}
						</Button>
					</Heading>
					<DisclosurePanel className="bf-accordion__panel" role="region">
						{item.content}
					</DisclosurePanel>
				</Disclosure>
			))}
		</DisclosureGroup>
	);
});
