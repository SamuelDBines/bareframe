import { useEffect, useMemo, useState } from 'react';
import { useAppCanvasChrome } from '../AppCanvasChrome';
import { useAiAvailable } from '../../app/useAiAvailable';
import { useDesigner } from '../store';
import type { Frame } from '../types';
import { FlowMapCanvas } from './FlowMapCanvas';
import { FlowMapContextMenu, FlowMapDeleteScreenDialog, type ContextMenuState } from './FlowMapContextMenu';
import { FlowMapToolbar, type FlowWorkspaceMode } from './FlowMapToolbar';
import { FlowMapTour } from './FlowMapTour';
import { DescribeProductPanel } from './DescribeProductPanel';
import { RefineFlowDialog } from './RefineFlowDialog';
import { DesignBar } from './DesignBar';
import { useDesignQueue } from './designGenApi';
import type { DesignDevice } from '@bareframe/designer-core';
import { designDeviceToViewport, viewportToDesignDevice } from './designViewport';
import { useScreenDesigns } from './useScreenDesigns';
import { PrototypePlayer } from './PrototypePlayer';
import { FlowMapScreenLinkPanel } from './FlowMapScreenLinkPanel';
import './flow-map-ui.css';
import { useAuth } from '../../auth/AuthContext';
import { ProjectNotesPanel } from './ProjectNotesPanel';
import { ProjectNotesProvider } from './ProjectNotesContext';
import { TemplatesGallery } from './TemplatesGallery';

type Props = {
	readOnly?: boolean;
	openPrototypeOnMount?: boolean;
	prototypeStartFrameId?: string | null;
	prototypeOnly?: boolean;
};

export function FlowMapProjectWorkspace({
	readOnly,
	openPrototypeOnMount,
	prototypeStartFrameId,
	prototypeOnly,
}: Props) {
	const { state, dispatch } = useDesigner();
	const chrome = useAppCanvasChrome();
	const [mode, setMode] = useState<Exclude<FlowWorkspaceMode, 'prototype'>>('map');
	const [playing, setPlaying] = useState(Boolean(openPrototypeOnMount));
	const [connectMode, setConnectMode] = useState(false);
	const [connectFrom, setConnectFrom] = useState<string | null>(null);
	const [tourOpen, setTourOpen] = useState(false);
	const [contextMenu, setContextMenu] = useState<ContextMenuState>(null);
	const [pendingDelete, setPendingDelete] = useState<{ frame: Frame; connectors: number } | null>(null);
	const [refineOpen, setRefineOpen] = useState(false);
	const [startedByHand, setStartedByHand] = useState(false);
	const [flowToast, setFlowToast] = useState<string | null>(null);
	const [designDevice, setDesignDevice] = useState<DesignDevice>(() => {
		const brief = state.project.productBrief;
		const first = brief?.platforms?.[0] ?? brief?.platform;
		return first === 'tablet' ? 'tablet' : first === 'desktop' ? 'desktop' : 'phone';
	});
	const designs = useDesignQueue(chrome.projectId);
	const screenDesigns = useScreenDesigns(chrome.projectId);
	const { status: authStatus } = useAuth();
	const [notesOpen, setNotesOpen] = useState(false);
	const [templatesOpen, setTemplatesOpen] = useState(false);
	const cloudProjectId =
		!readOnly && authStatus === 'authenticated' && chrome.projectId ? chrome.projectId : undefined;

	const screenCount = useMemo(
		() => state.project.frames.filter((f) => !f.ghost).length,
		[state.project.frames],
	);
	const canGenerate = !readOnly && Boolean(chrome.projectId);
	const aiAvailable = useAiAvailable();
	const canUseDesignTools = canGenerate;
	const showLinkPanel = mode === 'edit' && !connectMode && !readOnly && Boolean(state.ui.selectedFrameId);
	// Empty project: no screens yet, or only the untouched starter screen.
	const flowIsEmpty = useMemo(() => {
		const frames = state.project.frames.filter((f) => !f.ghost);
		if (frames.length === 0) return true;
		if (frames.length > 1 || state.project.connectors.length > 0) return false;
		return state.project.pages.every((p) => (p.nodes[p.rootNodeId]?.children.length ?? 0) === 0) && !state.project.productBrief;
	}, [state.project]);
	const showDescribe = canGenerate && flowIsEmpty && !startedByHand;
	const tourAutoEligible = !readOnly && screenCount <= 1 && !showDescribe;

	useEffect(() => {
		if (prototypeStartFrameId) {
			dispatch({ type: 'setPrototypeEntryFrame', frameId: prototypeStartFrameId });
		}
	}, [dispatch, prototypeStartFrameId]);

	useEffect(() => {
		if (!designs.queue.running && designs.queue.done > 0) {
			void fetch(`/api/projects/${chrome.projectId}/screen-designs`, { credentials: 'include' })
				.then((r) => (r.ok ? r.json() : null))
				.then((data) => {
					if (data?.designs) screenDesigns.mergeDesigns(data.designs);
				})
				.catch(() => undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [designs.queue.running, designs.queue.done]);

	useEffect(() => {
		if (!flowToast) return;
		const t = window.setTimeout(() => setFlowToast(null), 5000);
		return () => window.clearTimeout(t);
	}, [flowToast]);

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

	if (prototypeOnly) {
		return playing ? (
			<PrototypePlayer onExit={() => setPlaying(false)} />
		) : (
			<div className="share-loading" role="status" data-testid="share-play-loading">
				Opening prototype…
			</div>
		);
	}

	const stage = (
		<div
			className={`flow-map-workspace${
				notesOpen && cloudProjectId ? ' flow-map-workspace--notes-open' : ''
			}${showDescribe ? ' flow-map-workspace--onboarding' : ''}`}
			data-testid="flow-map-workspace"
		>
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
				onRefineFlow={canUseDesignTools && !flowIsEmpty ? () => setRefineOpen(true) : undefined}
				onOpenTemplates={canGenerate ? () => setTemplatesOpen(true) : undefined}
				showNotes={Boolean(cloudProjectId)}
				notesOpen={notesOpen}
				onNotesOpenChange={setNotesOpen}
			/>
			{canUseDesignTools && !flowIsEmpty && !showDescribe ? (
				<DesignBar
					device={designDevice}
					onDeviceChange={setDesignDevice}
					queue={designs.queue}
					screenCount={screenCount}
					onGenerateAll={() => void designs.designAll(designDevice)}
					onCancel={designs.cancel}
					onDismiss={designs.dismiss}
				/>
			) : null}
			<div
				className={`flow-map-stage${showLinkPanel ? ' flow-map-stage--with-link' : ''}${
					notesOpen && cloudProjectId ? ' flow-map-stage--with-notes' : ''
				}${showDescribe ? ' flow-map-stage--onboarding' : ''}`}
			>
				{showLinkPanel ? <FlowMapScreenLinkPanel /> : null}
				<FlowMapCanvas
					projectId={cloudProjectId ?? undefined}
					previewDevice={designDevice}
					previewDesigns={screenDesigns.designsByKey}
					productDescription={state.project.productBrief?.description ?? state.project.name}
					readOnly={readOnly}
					hideEmptyState={showDescribe}
					workspaceMode={mode}
					onGenerateDesign={canUseDesignTools && !flowIsEmpty ? (frame) => void designs.designOne(frame, designDevice) : undefined}
					designingFrameId={designs.queue.currentFrameId}
					designBusy={designs.queue.running}
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
				{notesOpen && cloudProjectId ? (
					<ProjectNotesPanel
						projectId={cloudProjectId}
						onClose={() => setNotesOpen(false)}
						onFocusFrame={(frameId) => {
							dispatch({ type: 'selectFrame', frameId });
							setMode('map');
						}}
					/>
				) : null}
				{showDescribe && chrome.projectId ? (
					<DescribeProductPanel
						projectId={chrome.projectId}
						aiAvailable={aiAvailable}
						onGenerated={setFlowToast}
						onAddScreen={() => {
							// Use the untouched starter screen if there is one; otherwise create the first screen.
							setStartedByHand(true);
							setMode('edit');
							const starter = state.project.frames.find(
								(f) => !f.ghost && state.project.pages.some((p) => p.id === f.pageId),
							);
							if (starter) {
								dispatch({ type: 'selectFrame', frameId: starter.id });
								return;
							}
							dispatch({
								type: 'addScreen',
								frameId: `frame-${Date.now().toString(36)}`,
								name: 'First screen',
								heading: 'First screen',
								x: 96,
								y: 88,
							});
						}}
					/>
				) : null}
				{flowToast ? (
					<p className="flow-gen-toast" role="status" data-testid="flow-gen-toast">
						{flowToast}
					</p>
				) : null}
			</div>
			{refineOpen && chrome.projectId ? (
				<RefineFlowDialog projectId={chrome.projectId} onClose={() => setRefineOpen(false)} onDone={setFlowToast} />
			) : null}
			{playing ? (
				<PrototypePlayer
					onExit={() => setPlaying(false)}
					viewportKind={designDeviceToViewport(designDevice)}
					onViewportKindChange={(k) => setDesignDevice(viewportToDesignDevice(k))}
					previewDesigns={screenDesigns.designsByKey}
				/>
			) : null}
			<FlowMapContextMenu
				menu={contextMenu}
				onClose={() => setContextMenu(null)}
				readOnly={readOnly}
				onRename={promptRename}
				onRequestDelete={(frame, connectorCount) => setPendingDelete({ frame, connectors: connectorCount })}
				onGenerateDesign={canUseDesignTools && !flowIsEmpty ? (frame) => void designs.designOne(frame, designDevice) : undefined}
				designBusy={designs.queue.running}
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
			{templatesOpen && chrome.projectId ? (
				<TemplatesGallery
					projectId={chrome.projectId}
					open={templatesOpen}
					onClose={() => setTemplatesOpen(false)}
					onInserted={setFlowToast}
				/>
			) : null}
		</div>
	);

	return cloudProjectId ? <ProjectNotesProvider projectId={cloudProjectId}>{stage}</ProjectNotesProvider> : stage;
}
