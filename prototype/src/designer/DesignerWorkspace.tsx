import { AssistantFab } from './components/AssistantDrawer';
import { CanvasToolbar } from './components/CanvasToolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { LibrarySidebar } from './components/LibrarySidebar';
import { DesignerProvider } from './store';

function WorkspaceInner() {
	return (
		<div className="designer-workspace-v2">
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
