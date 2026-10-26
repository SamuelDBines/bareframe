import { AssistantFab } from './components/AssistantDrawer';
import { CanvasToolbar } from './components/CanvasToolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { LibrarySidebar } from './components/LibrarySidebar';
import { DesignerProvider, useDesigner } from './store';

function WorkspaceInner() {
	const { state, dispatch } = useDesigner();
	const { mobilePanel } = state.ui;

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

export function DesignerWorkspace() {
	return (
		<DesignerProvider>
			<WorkspaceInner />
		</DesignerProvider>
	);
}
