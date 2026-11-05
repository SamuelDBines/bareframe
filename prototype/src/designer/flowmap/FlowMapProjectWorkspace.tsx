import { useEffect, useMemo, useState } from 'react';
import { useDesigner } from '../store';
import type { Frame } from '../types';
import { FlowMapCanvas } from './FlowMapCanvas';
import { FlowMapContextMenu, FlowMapDeleteScreenDialog, type ContextMenuState } from './FlowMapContextMenu';
import { FlowMapToolbar, type FlowWorkspaceMode } from './FlowMapToolbar';
import { FlowMapTour } from './FlowMapTour';
import { PrototypePlayer } from './PrototypePlayer';
import './flow-map-ui.css';

type Props = {
	readOnly?: boolean;
};

export function FlowMapProjectWorkspace({ readOnly }: Props) {
	const { state, dispatch } = useDesigner();
	const [mode, setMode] = useState<Exclude<FlowWorkspaceMode, 'prototype'>>('map');
	const [playing, setPlaying] = useState(false);
	const [connectMode, setConnectMode] = useState(false);
	const [connectFrom, setConnectFrom] = useState<string | null>(null);
	const [tourOpen, setTourOpen] = useState(false);
	const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
	const [pendingDelete, setPendingDelete] = useState<{ frame: Frame; connectors: number } | null>(null);

	const screenCount = useMemo(
		() => state.project.frames.filter((f) => !f.ghost).length,
		[state.project.frames],
	);
	const tourAutoEligible = !readOnly && screenCount <= 1;

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const t = e.target as HTMLElement | null;
			if (t?.closest('input, textarea, select, [contenteditable="true"]')) return;
			if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
			if (e.key === 'z' && !e.shiftKey) {
				e.preventDefault();
				dispatch({ type: 'undo' });
			} else if (e.key === 'z' && e.shiftKey) {
				e.preventDefault();
				dispatch({ type: 'redo' });
			}
		};
		window.addEventListener('keydown', onKey);
		return () => window.removeEventListener('keydown', onKey);
	}, [dispatch]);

	const promptRename = (frameId: string, currentName: string) => {
		const next = window.prompt('Screen name', currentName);
		if (next == null) return;
		const trimmed = next.trim();
		if (trimmed && trimmed !== currentName) dispatch({ type: 'renameFrame', frameId, name: trimmed });
	};

	return (
		<div className="flow-map-workspace" data-testid="flow-map-workspace">
			<FlowMapToolbar
				mode={mode}
				onModeChange={(m) => {
					if (m === 'prototype') {
						setPlaying(true);
						return;
					}
					setMode(m);
					setConnectMode(false);
					setConnectFrom(null);
				}}
				connectMode={connectMode}
				onConnectModeChange={(on) => {
					setConnectMode(on);
					setConnectFrom(null);
				}}
				readOnly={readOnly}
				onStartTour={() => setTourOpen(true)}
			/>
			<div className="flow-map-stage">
				<FlowMapCanvas
					readOnly={readOnly}
					connectMode={mode === 'edit' && connectMode && !readOnly}
					connectFromFrameId={connectFrom}
					onConnectFrameSelect={(frameId) => {
						if (!connectFrom) {
							setConnectFrom(frameId);
							return;
						}
						if (connectFrom !== frameId) {
							dispatch({
								type: 'addConnector',
								fromFrameId: connectFrom,
								toFrameId: frameId,
								label: 'Next',
							});
						}
						setConnectFrom(null);
					}}
					onContextMenuChange={setContextMenu}
					onRenameFrame={promptRename}
					onRequestDeleteFrame={(frame, connectorCount) => setPendingDelete({ frame, connectors: connectorCount })}
					onAddScreenFromMenu={() => {
						setMode('edit');
						dispatch({ type: 'addFrame', presetId: 'iphone-15' });
					}}
				/>
			</div>
			{playing ? <PrototypePlayer onExit={() => setPlaying(false)} /> : null}
			<FlowMapContextMenu
				menu={contextMenu}
				onClose={() => setContextMenu(null)}
				readOnly={readOnly}
				onRename={promptRename}
				onRequestDelete={(frame, connectorCount) => setPendingDelete({ frame, connectors: connectorCount })}
				onAddScreen={() => {
					setMode('edit');
					dispatch({ type: 'addFrame', presetId: 'iphone-15' });
				}}
			/>
			<FlowMapDeleteScreenDialog
				frame={pendingDelete?.frame ?? null}
				connectorCount={pendingDelete?.connectors ?? 0}
				onCancel={() => setPendingDelete(null)}
				onConfirm={() => {
					if (pendingDelete) dispatch({ type: 'deleteFrame', frameId: pendingDelete.frame.id });
					setPendingDelete(null);
				}}
			/>
			<FlowMapTour open={tourOpen} onOpenChange={setTourOpen} autoEligible={tourAutoEligible} />
		</div>
	);
}
