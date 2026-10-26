import { useEffect, useId, useRef, useState } from 'react';
import type { PreviewInteractionState } from '../library/types';
import { previewClassName, stateProps } from './utils';

export function Modal({
	open = true,
	title = 'Confirm action',
	children = 'Are you sure you want to continue?',
	previewState = 'default',
}: {
	open?: boolean;
	title?: string;
	children?: React.ReactNode;
	previewState?: PreviewInteractionState;
}) {
	if (!open && previewState !== 'focus') return null;
	return (
		<div className={previewClassName('bf-modal-scene', previewState)}>
			<div className="bf-modal__backdrop" aria-hidden />
			<div className="bf-modal" role="dialog" aria-modal="true" aria-labelledby="bf-modal-title">
				<header className="bf-modal__header">
					<h2 id="bf-modal-title">{title}</h2>
				</header>
				<div className="bf-modal__body">{children}</div>
				<footer className="bf-modal__footer">
					<button type="button" className="btn btn-ghost" {...stateProps(previewState)}>Cancel</button>
					<button type="button" className="btn btn-primary" {...stateProps(previewState)}>Confirm</button>
				</footer>
			</div>
		</div>
	);
}

export function Drawer({
	open = true,
	side = 'right',
	title = 'Filters',
	previewState = 'default',
}: {
	open?: boolean;
	side?: 'left' | 'right';
	title?: string;
	previewState?: PreviewInteractionState;
}) {
	if (!open) return <p className="bf-muted">Drawer closed — toggle <code>open</code> in controls.</p>;
	return (
		<div className={previewClassName(`bf-drawer-scene bf-drawer-scene--${side}`, previewState)}>
			<div className="bf-drawer__backdrop" aria-hidden />
			<aside className="bf-drawer" role="dialog" aria-label={title}>
				<header className="bf-drawer__header"><h2>{title}</h2></header>
				<div className="bf-drawer__body">Secondary workflow content goes here.</div>
			</aside>
		</div>
	);
}

export function Tooltip({
	content = 'Helpful hint',
	previewState = 'default',
}: {
	content?: string;
	previewState?: PreviewInteractionState;
}) {
	const show = previewState === 'hover' || previewState === 'focus' || previewState === 'default';
	return (
		<div className={previewClassName('bf-tooltip-anchor', previewState)}>
			<button type="button" className="btn btn-secondary" {...stateProps(previewState)}>
				Hover me
			</button>
			{show ? (
				<div className="bf-tooltip" role="tooltip">{content}</div>
			) : null}
		</div>
	);
}

export function Popover({
	open = false,
	previewState = 'default',
}: {
	open?: boolean;
	previewState?: PreviewInteractionState;
}) {
	const isOpen = open || previewState === 'focus';
	return (
		<div className={previewClassName('bf-popover-anchor', previewState)}>
			<button type="button" className="btn btn-secondary" aria-expanded={isOpen} {...stateProps(previewState)}>
				Open popover
			</button>
			{isOpen ? (
				<div className="bf-popover" role="dialog">
					<strong>Popover</strong>
					<p>Floating content anchored to the trigger.</p>
				</div>
			) : null}
		</div>
	);
}

export function DropdownMenu({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	const [open, setOpen] = useState(previewState === 'focus');
	useEffect(() => {
		if (previewState === 'focus') setOpen(true);
	}, [previewState]);
	const menuId = useId();
	return (
		<div className={previewClassName('bf-dropdown', previewState)}>
			<button
				type="button"
				className="btn btn-secondary"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				onClick={() => setOpen((v) => !v)}
				{...stateProps(previewState)}
			>
				Actions ▾
			</button>
			{open ? (
				<ul id={menuId} className="bf-dropdown__menu" role="menu">
					<li role="none"><button type="button" role="menuitem">Edit</button></li>
					<li role="none"><button type="button" role="menuitem">Duplicate</button></li>
					<li role="none"><button type="button" role="menuitem">Archive</button></li>
				</ul>
			) : null}
		</div>
	);
}

export function Combobox({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	const [open, setOpen] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);
	return (
		<div className={previewClassName('bf-combobox', previewState)}>
			<input
				ref={inputRef}
				className="bf-input"
				placeholder="Search fruits…"
				value="Ap"
				readOnly
				aria-autocomplete="list"
				aria-expanded={open}
				onFocus={() => setOpen(true)}
				{...stateProps(previewState)}
			/>
			{(open || previewState === 'focus') && (
				<ul className="bf-combobox__list" role="listbox">
					<li role="option" aria-selected>Apple</li>
					<li role="option">Apricot</li>
				</ul>
			)}
		</div>
	);
}

export function MultiSelect({ previewState = 'default' }: { previewState?: PreviewInteractionState }) {
	return (
		<div className={previewClassName('bf-multiselect', previewState)}>
			<div className="bf-multiselect__chips">
				<span className="bf-badge bf-badge--outline">Design</span>
				<span className="bf-badge bf-badge--outline">Engineering</span>
			</div>
			<button type="button" className="bf-input bf-multiselect__trigger" {...stateProps(previewState)}>
				Add team…
			</button>
		</div>
	);
}
