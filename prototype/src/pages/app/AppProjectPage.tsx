import { useParams } from 'react-router-dom';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { AppReviewPanel } from './AppReviewPanel';

export function AppProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  return (
    <div className="app-project-layout">
      <div className="app-project-canvas">
        <DesignerWorkspace projectId={projectId} />
      </div>
      {projectId ? <AppReviewPanel projectId={projectId} /> : null}
    </div>
  );
}
