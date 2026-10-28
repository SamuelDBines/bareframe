import type { ReactNode } from 'react';
import type { ComponentRegistryEntry } from '../../../components/library/types';

const DEMO_OPTIONS = [
	{ value: 'a', label: 'Option A' },
	{ value: 'b', label: 'Option B' },
];

export function galleryPreviewProps(entry: ComponentRegistryEntry): Record<string, unknown> {
	const props: Record<string, unknown> = { ...entry.defaultProps };

	switch (entry.slug) {
		case 'alert':
			return { variant: 'info', title: 'Saved', children: 'Draft updated.', dismissible: false };
		case 'button':
			return { variant: 'primary', size: 'sm', children: 'Save', disabled: false, loading: false };
		case 'badge':
			return { variant: 'success', size: 'sm', children: 'New' };
		case 'card':
			return {
				variant: 'outlined',
				title: 'Summary',
				children: 'Usage up 12%.',
				footer: undefined,
			};
		case 'input':
			return { placeholder: 'Search…', 'aria-label': 'Search' };
		case 'textarea':
			return { placeholder: 'Notes…', rows: 2, 'aria-label': 'Notes' };
		case 'field':
			return {
				label: 'Email',
				hint: 'Work address only.',
			};
		case 'checkbox':
			return { label: 'Subscribe', checked: true };
		case 'switch':
			return { label: 'Notifications', checked: true };
		case 'select':
		case 'combobox':
		case 'multiselect':
		case 'native-select':
			props.options = DEMO_OPTIONS;
			props['aria-label'] = entry.name;
			if (entry.slug === 'multiselect') props.placeholder = 'Add tags';
			return props;
		case 'slider':
			return { label: 'Volume', value: 40, min: 0, max: 100 };
		case 'radio-group':
			return {
				'aria-label': 'Notify via',
				options: [
					{ value: 'email', label: 'Email' },
					{ value: 'sms', label: 'SMS' },
				],
				defaultValue: 'email',
			};
		case 'toast':
			return { variant: 'success', children: 'Published.' };
		case 'pagination':
			return { page: 2, total: 3, className: 'bf-pagination--gallery' };
		case 'tabs':
			return {
				variant: 'line',
				defaultValue: 'overview',
				className: 'bf-tabs--gallery',
				items: [
					{ id: 'overview', label: 'Overview', content: 'Summary.' },
					{ id: 'settings', label: 'Settings', content: 'Prefs.' },
				],
			};
		case 'progress':
			return { label: 'Upload', value: 45, className: 'bf-progress--gallery' };
		case 'spinner':
			return { size: 'sm', label: 'Loading' };
		case 'skeleton':
			return { lines: 2 };
		case 'breadcrumbs':
			return {
				className: 'bf-breadcrumbs--gallery',
				items: [
					{ href: '/', label: 'Home' },
					{ label: 'Docs' },
				],
			};
		case 'accordion':
			return {
				items: [
					{
						id: 'tokens',
						title: 'Design tokens?',
						content: 'Named theme variables.',
					},
				],
				defaultExpandedKeys: ['tokens'],
			};
		case 'empty-state':
			return {
				title: 'No projects',
				description: 'Create one to start.',
				actionLabel: 'Create',
				className: 'bf-empty--gallery',
			};
		case 'stat-card':
			return { label: 'Active teams', value: '128', delta: '+12%' };
		case 'avatar':
			return { name: 'Sam Bines', size: 'md' };
		case 'table':
			return { className: 'bf-table-wrap--gallery' };
		case 'calendar':
		case 'datepicker':
			props.label = props.label ?? entry.name;
			props.className = 'bf-calendar--gallery-preview';
			return props;
		case 'modal':
		case 'drawer':
		case 'popover':
		case 'tooltip':
		case 'dropdown-menu':
			return props;
		default:
			return props;
	}
}

export function renderGalleryPreview(entry: ComponentRegistryEntry): ReactNode {
	const props = galleryPreviewProps(entry);

	switch (entry.slug) {
		case 'pagination':
			return (
				<nav className="bf-pagination bf-pagination--gallery" aria-label="Pagination preview">
					<button type="button" className="bf-pagination__chip">
						‹
					</button>
					<button type="button" className="bf-pagination__chip">
						1
					</button>
					<button type="button" className="bf-pagination__chip is-active" aria-current="page">
						2
					</button>
					<button type="button" className="bf-pagination__chip">
						3
					</button>
					<button type="button" className="bf-pagination__chip">
						›
					</button>
				</nav>
			);
		case 'modal':
			return (
				<div className="docs-gallery-mock docs-gallery-mock--dialog" aria-hidden>
					<div className="docs-gallery-mock__panel bf-modal">
						<header className="bf-modal__header">
							<h3 className="bf-modal__title">Delete project?</h3>
						</header>
						<div className="bf-modal__body">
							<p>This cannot be undone.</p>
						</div>
					</div>
				</div>
			);
		case 'drawer':
			return (
				<div className="docs-gallery-mock docs-gallery-mock--drawer" aria-hidden>
					<div className="docs-gallery-mock__panel bf-drawer">
						<header className="bf-drawer__header">
							<h3>Filters</h3>
						</header>
						<div className="bf-drawer__body">
							<p>Status · owner</p>
						</div>
					</div>
				</div>
			);
		case 'popover':
			return (
				<div className="docs-gallery-mock docs-gallery-mock--popover" aria-hidden>
					<span className="docs-gallery-mock__trigger btn btn-secondary">Open</span>
					<div className="bf-popover docs-gallery-mock__float">
						<strong>Share</strong>
						<p>Copy link to clipboard.</p>
					</div>
				</div>
			);
		case 'tooltip':
			return (
				<div className="docs-gallery-mock docs-gallery-mock--tooltip" aria-hidden>
					<span className="btn btn-secondary">Hover</span>
					<span className="bf-tooltip docs-gallery-mock__float">Export frame</span>
				</div>
			);
		case 'dropdown-menu':
			return (
				<div className="docs-gallery-mock docs-gallery-mock--menu" aria-hidden>
					<span className="btn btn-secondary">Actions ▾</span>
					<div className="bf-dropdown__popover docs-gallery-mock__float">
						<ul className="bf-dropdown__menu" role="menu">
							<li className="bf-dropdown__item">Edit</li>
							<li className="bf-dropdown__item">Duplicate</li>
						</ul>
					</div>
				</div>
			);
		case 'table':
			return (
				<div className="bf-table-wrap bf-table-wrap--gallery">
					<table className="bf-table bf-table--compact">
						<thead>
							<tr>
								<th scope="col">Name</th>
								<th scope="col">Role</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td>Ava</td>
								<td>Design</td>
							</tr>
							<tr>
								<td>Jordan</td>
								<td>Eng</td>
							</tr>
						</tbody>
					</table>
				</div>
			);
		default:
			return entry.render(props);
	}
}
