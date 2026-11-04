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
      .catch(() => setShowUpgrade(false));
  }, []);

  return (
    <DesignerWorkspace
      projectId={projectId}
      compactChrome
      appChrome={{
        projectId,
        showShare: Boolean(projectId),
        showUpgrade,
      }}
      review={{ projectId }}
      aside={projectId ? <AppReviewPanel /> : undefined}
    />
  );
}
