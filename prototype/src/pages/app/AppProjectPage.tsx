import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { DesignerWorkspace } from '../../designer/DesignerWorkspace';
import { AppReviewPanel } from './AppReviewPanel';
import { fetchPlan } from '../../app/reviewApi';

export function AppProjectPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    fetchPlan()
      .then((p) => setShowUpgrade(p.tier !== 'pro'))
      .catch(() => setShowUpgrade(true));
  }, []);

  return (
    <div className="app-project-layout">
      <div className="app-project-canvas">
        <DesignerWorkspace
          projectId={projectId}
          compactChrome
          appChrome={{
            projectId,
            showShare: Boolean(projectId),
            showUpgrade,
          }}
        />
      </div>
      {projectId ? <AppReviewPanel projectId={projectId} showUpgrade={showUpgrade} /> : null}
    </div>
  );
}
