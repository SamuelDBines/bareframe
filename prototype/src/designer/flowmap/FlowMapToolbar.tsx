import { useEffect, useId, useRef, useState, type ButtonHTMLAttributes } from 'react';
import { friendlyError } from '../../app/apiError';
import { createProjectShare, startProCheckout } from '../../app/reviewApi';
import { useAppCanvasChrome } from '../AppCanvasChrome';
import { useDesigner } from '../store';
import { FigmaImportDialog } from './FigmaImportDialog';
import {
	IconAddScreen,
	IconConnect,
	IconFigma,
	IconHelp,
	IconMore,
	IconPlay,
	IconShare,
	IconTrash,
	IconUpgrade,
} from './FlowMapIcons';

export type FlowWorkspaceMode = 'map' | 'edit' | 'prototype';

type Props = {
	mode: FlowWorkspaceMode;
	onModeChange: (mode: FlowWorkspaceMode) => void;
	connectMode: boolean;
	onConnectModeChange: (on: boolean) => void;
	readOnly?: boolean;
	onStartTour?: () => void;
};

export async function copyShareLink(projectId: string): Promise<string> {
	const { publicUrl } = await createProjectShare(projectId);
	try {
		await navigator.clipboard.writeText(publicUrl);
		return 'Share link copied';
	} catch {
		return `Share link: ${publicUrl}`;
	}
}

function ToolbarIconButton({
	label,
	className = 'btn-secondary',
	children,
	pressed,
	...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; pressed?: boolean; className?: string }) {
	return (
		<button
			type="button"
			className={`btn btn-sm btn-icon ${className}`}
			aria-label={label}
			title={label}
			aria-pressed={pressed}
			{...rest}
		>
			{children}
		</button>
	);
}

export function FlowMapToolbar({
	mode,
	onModeChange,
	connectMode,
	onConnectModeChange,
	readOnly,
	onStartTour,
}: Props) {
	const { state, dispatch } = useDesigner();
	const chrome = useAppCanvasChrome();
	const [figmaOpen, setFigmaOpen] = useState(false);
	const [moreOpen, setMoreOpen] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const moreRef = useRef<HTMLDivElement>(null);
	const moreMenuId = useId();
	const screenCount = state.project.frames.filter((f) => !f.ghost).length;

	useEffect(() => {
		if (!toast) return;
		const t = window.setTimeout(() => setToast(null), 3200);
		return () => window.clearTimeout(t);
	}, [toast]);

	useEffect(() => {
		if (!moreOpen) return;
		const close = (e: MouseEvent) => {
			if (moreRef.current?.contains(e.target as Node)) return;
			setMoreOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') setMoreOpen(false);
		};
		document.addEventListener('mousedown', close);
		document.addEventListener('keydown', onKey);
		return () => {
			document.removeEventListener('mousedown', close);
			document.removeEventListener('keydown', onKey);
		};
	}, [moreOpen]);

	async function handleShare() {
		if (!chrome.projectId) return;
		try {
			setToast(await copyShareLink(chrome.projectId));
		} catch (e) {
			setToast(friendlyError(e, 'We couldn’t create a share link. Please try again.'));
		}
	}

	const showImport = !readOnly && Boolean(chrome.projectId);
	const showUpgrade = !readOnly && chrome.showUpgrade;
	const showDelete = mode === 'edit' && !readOnly && Boolean(state.ui.selectedFrameId);

	return (
		<>
			<div className="flow-map-toolbar">
				<div className="flow-map-toolbar__left">
					<div className="flow-map-toolbar__title">
						<strong>{state.project.name}</strong>
						<span>
							{screenCount} screen{screenCount === 1 ? '' : 's'}
						</span>
					</div>
					{readOnly ? null : (
						<div className="flow-seg" role="tablist" aria-label="Canvas mode">
							{(['map', 'edit'] as const).map((m) => (
								<button
									key={m}
									type="button"
									role="tab"
									aria-selected={mode === m}
									data-testid={`flow-mode-${m}`}
									onClick={() => onModeChange(m)}
								>
									{m === 'map' ? 'Map' : 'Edit'}
								</button>
							))}
						</div>
					)}
					{mode === 'edit' && !readOnly ? (
						<div className="flow-map-toolbar__tools">
							<ToolbarIconButton
								label="Add screen"
								data-testid="flow-add-screen"
								onClick={() => dispatch({ type: 'addFrame', presetId: 'iphone-15' })}
							>
								<IconAddScreen />
							</ToolbarIconButton>
							<ToolbarIconButton
								label={connectMode ? 'Done connecting' : 'Connect screens'}
								data-testid="flow-connect-screens"
								pressed={connectMode}
								className={connectMode ? 'btn-dark' : 'btn-secondary'}
								onClick={() => onConnectModeChange(!connectMode)}
							>
								<IconConnect />
							</ToolbarIconButton>
						</div>
					) : null}
				</div>
				<div className="flow-map-toolbar__actions">
					{toast ? (
						<span className="canvas-app-toast" role="status">
							{toast}
						</span>
					) : null}
					{onStartTour ? (
						<ToolbarIconButton label="Take a tour" data-testid="flow-tour-help" onClick={onStartTour}>
							<IconHelp />
						</ToolbarIconButton>
					) : null}
					<div className="flow-toolbar-menu" ref={moreRef}>
						<ToolbarIconButton
							label="More actions"
							data-testid="flow-more-menu"
							aria-expanded={moreOpen}
							aria-haspopup="menu"
							aria-controls={moreMenuId}
							onClick={() => setMoreOpen((o) => !o)}
						>
							<IconMore />
						</ToolbarIconButton>
						{moreOpen ? (
							<div className="flow-toolbar-menu__panel" role="menu" id={moreMenuId}>
								{showDelete ? (
									<button
										type="button"
										role="menuitem"
										className="flow-toolbar-menu__item flow-toolbar-menu__item--danger"
										onClick={() => {
											const id = state.ui.selectedFrameId;
											if (id) dispatch({ type: 'deleteFrame', frameId: id });
											setMoreOpen(false);
										}}
									>
										<IconTrash size={16} /> Delete selected screen
									</button>
								) : null}
								{showUpgrade ? (
									<button
										type="button"
										role="menuitem"
										className="flow-toolbar-menu__item"
										onClick={() => {
											setMoreOpen(false);
											void startProCheckout()
												.then((r) => {
													if (r.checkoutUrl) window.location.href = r.checkoutUrl;
													else setToast(r.message ?? 'Upgrades open soon.');
												})
												.catch((e) => setToast(friendlyError(e, 'Checkout isn’t available right now.')));
										}}
									>
										<IconUpgrade size={16} /> Upgrade
									</button>
								) : null}
								{showImport ? (
									<button
										type="button"
										role="menuitem"
										className="flow-toolbar-menu__item"
										data-testid="figma-import-open"
										onClick={() => {
											setFigmaOpen(true);
											setMoreOpen(false);
										}}
									>
										<IconFigma size={16} /> Import Figma
									</button>
								) : null}
								{!showDelete && !showUpgrade && !showImport ? (
									<p className="flow-toolbar-menu__empty">No extra actions</p>
								) : null}
							</div>
						) : null}
					</div>
					{!readOnly && chrome.showShare && chrome.projectId ? (
						<ToolbarIconButton label="Share project" onClick={() => void handleShare()}>
							<IconShare />
						</ToolbarIconButton>
					) : null}
					<button
						type="button"
						className="btn btn-primary btn-sm flow-toolbar-prototype"
						data-testid="flow-mode-prototype"
						title="Open prototype"
						onClick={() => onModeChange('prototype')}
						disabled={screenCount === 0}
					>
						<IconPlay size={16} />
						<span>Prototype</span>
					</button>
				</div>
			</div>
			{figmaOpen && chrome.projectId ? (
				<FigmaImportDialog projectId={chrome.projectId} onClose={() => setFigmaOpen(false)} />
			) : null}
		</>
	);
}
