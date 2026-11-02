import { AssistantFab } from './components/AssistantDrawer';
import { CanvasToolbar } from './components/CanvasToolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { LibrarySidebar } from './components/LibrarySidebar';
import { DesignerCloudSync } from './DesignerCloudSync';
import { DesignerProvider, useDesigner } from './store';
import { useDesignerEditorChrome } from './useDesignerEditorChrome';

function WorkspaceInner() {
	const { state, dispatch } = useDesigner();
	const { mobilePanel } = state.ui;
	useDesignerEditorChrome();

	return (
		<div
			className={`designer-workspace-v2${mobilePanel !== 'none' ? ' mobile-panel-open' : ''}`}
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
			<LibrarySidebar />
			<div className="designer-canvas-column">
				<CanvasToolbar />
				<InfiniteCanvas />
				<AssistantFab />
			</div>
			<InspectorPanel />
		</div>
	);
}

type DesignerWorkspaceProps = {
	projectId?: string;
	readOnly?: boolean;
	demoReview?: boolean;
	initialDocument?: import('@bareframe/designer-core').ProjectDocument | null;
};

export function DesignerWorkspace({
	projectId,
	readOnly,
	demoReview,
	initialDocument,
}: DesignerWorkspaceProps) {
	return (
		<DesignerProvider>
			<DesignerCloudSync
				projectId={projectId}
				readOnly={readOnly}
				demoReview={demoReview}
				initialDocument={initialDocument}
			/>
			<WorkspaceInner />
		</DesignerProvider>
	);
}
