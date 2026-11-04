import { useEffect, useState } from 'react';
import { friendlyError } from '../../app/apiError';
import { createProjectShare, startProCheckout } from '../../app/reviewApi';
import { useAppCanvasChrome } from '../AppCanvasChrome';
import { useDesigner } from '../store';
import { FigmaImportDialog } from './FigmaImportDialog';

export type FlowWorkspaceMode = 'map' | 'edit' | 'prototype';

type Props = {
	mode: FlowWorkspaceMode;
	onModeChange: (mode: FlowWorkspaceMode) => void;
	connectMode: boolean;
	onConnectModeChange: (on: boolean) => void;
	readOnly?: boolean;
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

export function FlowMapToolbar({ mode, onModeChange, connectMode, onConnectModeChange, readOnly }: Props) {
	const { state, dispatch } = useDesigner();
	const chrome = useAppCanvasChrome();
	const [figmaOpen, setFigmaOpen] = useState(false);
	const [toast, setToast] = useState<string | null>(null);
	const screenCount = state.project.frames.filter((f) => !f.ghost).length;

	useEffect(() => {
		if (!toast) return;
		const t = window.setTimeout(() => setToast(null), 3200);
		return () => window.clearTimeout(t);
	}, [toast]);

	async function handleShare() {
		if (!chrome.projectId) return;
		try {
			setToast(await copyShareLink(chrome.projectId));
		} catch (e) {
			setToast(friendlyError(e, 'We couldn’t create a share link. Please try again.'));
		}
	}

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
							<button
								type="button"
								className="btn btn-secondary btn-sm"
								onClick={() => dispatch({ type: 'addFrame', presetId: 'iphone-15' })}
							>
								+ Screen
							</button>
							<button
								type="button"
								className={`btn btn-sm ${connectMode ? 'btn-dark' : 'btn-secondary'}`}
								aria-pressed={connectMode}
								onClick={() => onConnectModeChange(!connectMode)}
							>
								{connectMode ? 'Done connecting' : 'Connect screens'}
							</button>
							{state.ui.selectedFrameId ? (
								<button
									type="button"
									className="btn btn-ghost btn-sm"
									onClick={() => dispatch({ type: 'deleteFrame', frameId: state.ui.selectedFrameId! })}
								>
									Delete screen
								</button>
							) : null}
						</div>
					) : null}
				</div>
				<div className="flow-map-toolbar__actions">
					{toast ? (
						<span className="canvas-app-toast" role="status">
							{toast}
						</span>
					) : null}
					{!readOnly && chrome.showUpgrade ? (
						<button
							type="button"
							className="btn btn-ghost btn-sm"
							onClick={() =>
								void startProCheckout()
									.then((r) => {
										if (r.checkoutUrl) window.location.href = r.checkoutUrl;
										else setToast(r.message ?? 'Upgrades open soon.');
									})
									.catch((e) => setToast(friendlyError(e, 'Checkout isn’t available right now.')))
							}
						>
							Upgrade
						</button>
					) : null}
					{!readOnly && chrome.projectId ? (
						<button
							type="button"
							className="btn btn-secondary btn-sm"
							data-testid="figma-import-open"
							onClick={() => setFigmaOpen(true)}
						>
							Import Figma
						</button>
					) : null}
					{!readOnly && chrome.showShare && chrome.projectId ? (
						<button type="button" className="btn btn-secondary btn-sm" onClick={() => void handleShare()}>
							Share
						</button>
					) : null}
					<button
						type="button"
						className="btn btn-primary btn-sm"
						data-testid="flow-mode-prototype"
						onClick={() => onModeChange('prototype')}
						disabled={screenCount === 0}
					>
						<span aria-hidden>▶</span> Prototype
					</button>
				</div>
			</div>
			{figmaOpen && chrome.projectId ? (
				<FigmaImportDialog projectId={chrome.projectId} onClose={() => setFigmaOpen(false)} />
			) : null}
		</>
	);
}
