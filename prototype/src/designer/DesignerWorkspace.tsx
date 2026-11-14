import { AssistantFab } from './components/AssistantDrawer';
import { CanvasToolbar } from './components/CanvasToolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { FlowMapProjectWorkspace } from './flowmap/FlowMapProjectWorkspace';
import { InspectorPanel } from './components/InspectorPanel';
import { LibrarySidebar } from './components/LibrarySidebar';
import { DesignerCloudSync } from './DesignerCloudSync';
import { DesignerProvider, useDesigner } from './store';
import { useDesignerEditorChrome } from './useDesignerEditorChrome';
import { AppCanvasChromeProvider, type AppCanvasChromeValue } from './AppCanvasChrome';
import { DemoReviewCameraFit } from './DemoReviewCameraFit';
import { ReviewProvider } from '../app/ReviewContext';
import type { ReactNode } from 'react';

function WorkspaceInner({
	compactChrome,
	flowMap,
	readOnly,
	openPrototypeOnMount,
	prototypeStartFrameId,
	prototypeOnly,
}: {
	compactChrome?: boolean;
	flowMap?: boolean;
	readOnly?: boolean;
	openPrototypeOnMount?: boolean;
	prototypeStartFrameId?: string | null;
	prototypeOnly?: boolean;
}) {
	const { state, dispatch } = useDesigner();
	const { mobilePanel } = state.ui;
	useDesignerEditorChrome();
	const useFlowMap = flowMap ?? compactChrome;

	return (
		<div
			className={`designer-workspace-v2${compactChrome ? ' designer-workspace-v2--compact' : ''}${
				useFlowMap ? ' designer-workspace-v2--flow-map' : ''
			}${mobilePanel !== 'none' ? ' mobile-panel-open' : ''}`}
			data-mobile-panel={mobilePanel}
		>
			{mobilePanel !== 'none' && (
				<button
					type="button"
					className="designer-mobile-backdrop"
					aria-label="Close panel"
					onClick={() => dispatch({ type: 'setMobilePanel', panel: 'none' })}
				/>
			)}
			{!compactChrome ? <LibrarySidebar /> : null}
			<div className="designer-canvas-column">
				{useFlowMap ? null : <CanvasToolbar />}
				{useFlowMap ? (
					<FlowMapProjectWorkspace
						readOnly={readOnly}
						openPrototypeOnMount={openPrototypeOnMount}
						prototypeStartFrameId={prototypeStartFrameId}
						prototypeOnly={prototypeOnly}
					/>
				) : (
					<InfiniteCanvas />
				)}
				{!compactChrome ? <AssistantFab /> : null}
			</div>
			{!compactChrome ? <InspectorPanel /> : null}
		</div>
	);
}

type DesignerWorkspaceProps = {
	projectId?: string;
	readOnly?: boolean;
	demoReview?: boolean;
	compactChrome?: boolean;
	appChrome?: AppCanvasChromeValue;
	initialDocument?: import('@bareframe/designer-core').ProjectDocument | null;
	/** Enables AI review flags on the map (shared with `aside`). */
	review?: { projectId?: string; demo?: boolean };
	/** Side panel rendered inside the designer providers, beside the canvas. */
	aside?: ReactNode;
	openPrototypeOnMount?: boolean;
	prototypeStartFrameId?: string | null;
	/** Shared playable link: skip flow map chrome and show the player only. */
	prototypeOnly?: boolean;
};

export function DesignerWorkspace({
	projectId,
	readOnly,
	demoReview,
	compactChrome,
	appChrome,
	initialDocument,
	review,
	aside,
	openPrototypeOnMount,
	prototypeStartFrameId,
	prototypeOnly,
}: DesignerWorkspaceProps) {
	const chrome: AppCanvasChromeValue = {
		...appChrome,
		projectId: appChrome?.projectId ?? projectId,
	};

	const inner = (
		<WorkspaceInner
			compactChrome={compactChrome ?? Boolean(demoReview)}
			flowMap={compactChrome ?? Boolean(demoReview)}
			readOnly={readOnly ?? demoReview}
			openPrototypeOnMount={openPrototypeOnMount}
			prototypeStartFrameId={prototypeStartFrameId}
			prototypeOnly={prototypeOnly}
		/>
	);

	return (
		<DesignerProvider>
			<AppCanvasChromeProvider value={chrome}>
				<DesignerCloudSync
					projectId={projectId}
					readOnly={readOnly}
					demoReview={demoReview}
					initialDocument={initialDocument}
				/>
				{demoReview ? <DemoReviewCameraFit useFlowMap={compactChrome ?? Boolean(demoReview)} /> : null}
				{review ? (
					<ReviewProvider projectId={review.projectId} demo={review.demo}>
						{withAside(inner, aside)}
					</ReviewProvider>
				) : (
					withAside(inner, aside)
				)}
			</AppCanvasChromeProvider>
		</DesignerProvider>
	);
}

function withAside(canvas: ReactNode, aside?: ReactNode) {
	if (!aside) return canvas;
	return (
		<div className="app-project-layout">
			<div className="app-project-canvas">{canvas}</div>
			{aside}
		</div>
	);
}
