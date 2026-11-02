import { AssistantFab } from './components/AssistantDrawer';
import { CanvasToolbar } from './components/CanvasToolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { LibrarySidebar } from './components/LibrarySidebar';
import { DesignerCloudSync } from './DesignerCloudSync';
import { DesignerProvider, useDesigner } from './store';
import { useDesignerEditorChrome } from './useDesignerEditorChrome';
import { AppCanvasChromeProvider, type AppCanvasChromeValue } from './AppCanvasChrome';
import { DemoReviewCameraFit } from './DemoReviewCameraFit';

function WorkspaceInner({ compactChrome }: { compactChrome?: boolean }) {
	const { state, dispatch } = useDesigner();
	const { mobilePanel } = state.ui;
	useDesignerEditorChrome();

	return (
		<div
			className={`designer-workspace-v2${compactChrome ? ' designer-workspace-v2--compact' : ''}${
				mobilePanel !== 'none' ? ' mobile-panel-open' : ''
			}`}
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
				<CanvasToolbar />
				<InfiniteCanvas />
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
};

export function DesignerWorkspace({
	projectId,
	readOnly,
	demoReview,
	compactChrome,
	appChrome,
	initialDocument,
}: DesignerWorkspaceProps) {
	const chrome: AppCanvasChromeValue = {
		...appChrome,
		projectId: appChrome?.projectId ?? projectId,
	};

	return (
		<DesignerProvider>
			<AppCanvasChromeProvider value={chrome}>
				<DesignerCloudSync
					projectId={projectId}
					readOnly={readOnly}
					demoReview={demoReview}
					initialDocument={initialDocument}
				/>
				{demoReview ? <DemoReviewCameraFit /> : null}
				<WorkspaceInner compactChrome={compactChrome ?? Boolean(demoReview)} />
			</AppCanvasChromeProvider>
		</DesignerProvider>
	);
}
