import { createPortal } from 'react-dom';
import { useEffect, useId, useRef } from 'react';
import { useDesigner } from '../store';
import type { Frame } from '../types';

export type ContextMenuState =
	| { kind: 'frame'; frame: Frame; x: number; y: number }
	| { kind: 'canvas'; x: number; y: number }
	| null;

type Props = {
	menu: ContextMenuState;
	onClose: () => void;
	readOnly?: boolean;
	onRename: (frameId: string, currentName: string) => void;
	onRequestDelete: (frame: Frame, connectorCount: number) => void;
	onAddScreen?: () => void;
	/** AI design for this screen on the chosen device; absent when generation isn't available. */
	onGenerateDesign?: (frame: Frame) => void;
	designBusy?: boolean;
};

export function FlowMapContextMenu({
	menu,
	onClose,
	readOnly,
	onRename,
	onRequestDelete,
	onAddScreen,
	onGenerateDesign,
	designBusy,
}: Props) {
	const { state, dispatch } = useDesigner();
	const menuRef = useRef<HTMLDivElement>(null);
	const titleId = useId();

	useEffect(() => {
		if (!menu) return;
		const onDoc = (e: MouseEvent) => {
			if (menuRef.current?.contains(e.target as Node)) return;
			onClose();
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') onClose();
		};
		document.addEventListener('mousedown', onDoc);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', onDoc);
			document.removeEventListener('keydown', onKey);
		};
	}, [menu, onClose]);

	if (!menu) return null;

	const items =
		menu.kind === 'canvas'
			? readOnly
				? []
				: [
						{
							label: 'Add screen',
							action: () => {
								onAddScreen?.();
								onClose();
							},
						},
				  ]
			: (() => {
					const frame = menu.frame;
					if (frame.readOnly || readOnly) return [];
					const connectorCount = state.project.connectors.filter(
						(c) => c.fromFrameId === frame.id || c.toFrameId === frame.id,
					).length;
					const isStart = state.project.prototypeEntryFrameId === frame.id;
					const inferredStart =
						!state.project.prototypeEntryFrameId &&
						!state.project.connectors.some((c) => c.toFrameId === frame.id);
					const page = state.project.pages.find((p) => p.id === frame.pageId);
					const hasDesign = (page?.nodes[page.rootNodeId]?.children.length ?? 0) > 0;
					return [
						...(onGenerateDesign
							? [
									{
										label: hasDesign ? 'Regenerate design' : 'Generate design',
										disabled: designBusy,
										action: () => {
											onGenerateDesign(frame);
											onClose();
										},
									},
								]
							: []),
						{
							label: 'Rename',
							action: () => {
								onRename(frame.id, frame.name);
								onClose();
							},
						},
						{
							label: 'Duplicate',
							action: () => {
								dispatch({ type: 'duplicateFrame', frameId: frame.id });
								onClose();
							},
						},
						{
							label: isStart || inferredStart ? 'Start screen' : 'Set as start',
							disabled: isStart,
							hint: isStart || inferredStart ? 'Prototype opens here' : undefined,
							action: () => {
								dispatch({ type: 'setPrototypeEntryFrame', frameId: frame.id });
								onClose();
							},
						},
						{
							label: 'Delete screen',
							destructive: true,
							action: () => {
								onRequestDelete(frame, connectorCount);
								onClose();
							},
						},
					];
			  })();

	if (!items.length) return null;

	const clamp = (v: number, max: number) => Math.max(8, Math.min(v, max));
	const w = typeof window !== 'undefined' ? window.innerWidth : 800;
	const h = typeof window !== 'undefined' ? window.innerHeight : 600;
	const left = clamp(menu.x, w - 220);
	const top = clamp(menu.y, h - items.length * 40 - 24);

	return createPortal(
		<div
			ref={menuRef}
			className="flow-context-menu"
			role="menu"
			aria-labelledby={titleId}
			style={{ left, top }}
			onContextMenu={(e) => e.preventDefault()}
		>
			<p id={titleId} className="flow-context-menu__sr">
				Screen actions
			</p>
			{items.map((item) => (
				<button
					key={item.label}
					type="button"
					role="menuitem"
					className={`flow-context-menu__item${'destructive' in item && item.destructive ? ' flow-context-menu__item--danger' : ''}`}
					disabled={'disabled' in item && item.disabled}
					title={'hint' in item ? item.hint : undefined}
					onClick={() => item.action()}
				>
					{item.label}
				</button>
			))}
		</div>,
		document.body,
	);
}

type DeleteDialogProps = {
	frame: Frame | null;
	connectorCount: number;
	onCancel: () => void;
	onConfirm: () => void;
};

export function FlowMapDeleteScreenDialog({ frame, connectorCount, onCancel, onConfirm }: DeleteDialogProps) {
	if (!frame) return null;
	return createPortal(
		<div className="bx-dialog-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
			<div className="bx-dialog flow-map-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-screen-title">
				<div className="bx-dialog__head">
					<h2 id="delete-screen-title">Delete “{frame.name}”?</h2>
					<p>
						{connectorCount > 0
							? `This removes ${connectorCount} connection${connectorCount === 1 ? '' : 's'} on this screen. You can undo with Ctrl+Z.`
							: 'This screen will be removed from the map. You can undo with Ctrl+Z.'}
					</p>
				</div>
				<div className="bx-dialog__actions">
					<button type="button" className="btn btn-secondary" onClick={onCancel}>
						Cancel
					</button>
					<button type="button" className="btn btn-dark" onClick={onConfirm}>
						Delete screen
					</button>
				</div>
			</div>
		</div>,
		document.body,
	);
}
