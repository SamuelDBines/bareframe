import { useEffect } from 'react';
import { AssistantFab } from './components/AssistantDrawer';
import { CanvasToolbar } from './components/CanvasToolbar';
import { InfiniteCanvas } from './components/InfiniteCanvas';
import { InspectorPanel } from './components/InspectorPanel';
import { LibrarySidebar } from './components/LibrarySidebar';
import { DesignerProvider, useDesigner } from './store';

function WorkspaceInner() {
	const { fitAll } = useDesigner();
	useEffect(() => {
		fitAll();
		// eslint-disable-next-line react-hooks/exhaustive-deps -- initial camera only
	}, []);

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
